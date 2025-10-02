/**
 * LTI (Learning Tools Interoperability) Service
 * Implements LTI 1.3 standard for secure LMS integration
 */

const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');

class LTIService {
  constructor() {
    this.config = null;
    this.platformConfigs = new Map();
  }

  /**
   * Initialize LTI service
   */
  async initialize(config) {
    this.config = config;
    console.log('✓ LTI Service initialized');
  }

  /**
   * Register an LMS platform
   */
  registerPlatform(platformId, platformConfig) {
    this.platformConfigs.set(platformId, {
      issuer: platformConfig.issuer,
      clientId: platformConfig.clientId,
      authEndpoint: platformConfig.authEndpoint,
      tokenEndpoint: platformConfig.tokenEndpoint,
      jwksEndpoint: platformConfig.jwksEndpoint,
      deploymentId: platformConfig.deploymentId
    });

    console.log(`✓ LMS Platform registered: ${platformId}`);
  }

  /**
   * Handle LTI 1.3 Launch Request
   */
  async validateLaunch(idToken) {
    try {
      // Decode without verification first to get platform info
      const decoded = jwt.decode(idToken, { complete: true });

      if (!decoded) {
        throw new Error('Invalid ID token');
      }

      const { iss, aud } = decoded.payload;

      // Get platform config
      const platformConfig = Array.from(this.platformConfigs.values()).find(
        config => config.issuer === iss && config.clientId === aud
      );

      if (!platformConfig) {
        throw new Error(`Unknown platform: ${iss}`);
      }

      // Get JWKS keys from platform
      const publicKey = await this.getPublicKey(platformConfig.jwksEndpoint, decoded.header.kid);

      // Verify token
      const verified = jwt.verify(idToken, publicKey, {
        issuer: platformConfig.issuer,
        audience: platformConfig.clientId,
        algorithms: ['RS256']
      });

      // Validate required LTI claims
      this.validateLTIClaims(verified);

      return {
        sub: verified.sub,
        name: verified.name,
        given_name: verified.given_name,
        family_name: verified.family_name,
        email: verified.email,
        platform: iss,
        roles: verified['https://purl.imsglobal.org/spec/lti/claim/roles'] || [],
        context: verified['https://purl.imsglobal.org/spec/lti/claim/context'] || {},
        resource_link: verified['https://purl.imsglobal.org/spec/lti/claim/resource_link'] || {},
        custom: verified['https://purl.imsglobal.org/spec/lti/claim/custom'] || {},
        launch_presentation: verified['https://purl.imsglobal.org/spec/lti/claim/launch_presentation'] || {}
      };
    } catch (error) {
      console.error('LTI Launch validation error:', error);
      throw new Error(`LTI Launch failed: ${error.message}`);
    }
  }

  /**
   * Validate LTI required claims
   */
  validateLTIClaims(claims) {
    const required = [
      'iss',
      'aud',
      'exp',
      'iat',
      'nonce',
      'https://purl.imsglobal.org/spec/lti/claim/message_type',
      'https://purl.imsglobal.org/spec/lti/claim/version',
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id'
    ];

    for (const claim of required) {
      if (!claims[claim]) {
        throw new Error(`Missing required LTI claim: ${claim}`);
      }
    }

    // Validate message type
    const messageType = claims['https://purl.imsglobal.org/spec/lti/claim/message_type'];
    if (!['LtiResourceLinkRequest', 'LtiDeepLinkingRequest'].includes(messageType)) {
      throw new Error(`Unsupported message type: ${messageType}`);
    }

    // Validate version
    const version = claims['https://purl.imsglobal.org/spec/lti/claim/version'];
    if (version !== '1.3.0') {
      throw new Error(`Unsupported LTI version: ${version}`);
    }
  }

  /**
   * Get public key from JWKS endpoint
   */
  async getPublicKey(jwksEndpoint, kid) {
    try {
      const response = await axios.get(jwksEndpoint);
      const keys = response.data.keys;

      const key = keys.find(k => k.kid === kid);
      if (!key) {
        throw new Error(`Key with kid ${kid} not found`);
      }

      // Convert JWK to PEM
      return this.jwkToPem(key);
    } catch (error) {
      throw new Error(`Failed to fetch public key: ${error.message}`);
    }
  }

  /**
   * Convert JWK to PEM format
   */
  jwkToPem(jwk) {
    // This is a simplified version - in production use a library like jwk-to-pem
    const { n, e } = jwk;

    const modulus = Buffer.from(n, 'base64');
    const exponent = Buffer.from(e, 'base64');

    const publicKey = crypto.createPublicKey({
      key: {
        kty: 'RSA',
        n: modulus,
        e: exponent
      },
      format: 'jwk'
    });

    return publicKey.export({ type: 'spki', format: 'pem' });
  }

  /**
   * Generate LTI Deep Linking response
   */
  async generateDeepLinkingResponse(contentItems, deepLinkingSettings, platformConfig) {
    const payload = {
      iss: this.config.clientId,
      aud: platformConfig.issuer,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      nonce: crypto.randomBytes(16).toString('hex'),
      'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiDeepLinkingResponse',
      'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id': platformConfig.deploymentId,
      'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': contentItems,
      'https://purl.imsglobal.org/spec/lti-dl/claim/data': deepLinkingSettings.data
    };

    const privateKey = this.config.privateKey;
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', keyid: this.config.kid });

    return token;
  }

  /**
   * Create content item for deep linking
   */
  createContentItem(type, url, title, text = '', custom = {}) {
    return {
      type,
      url,
      title,
      text,
      custom,
      window: {
        targetName: '_blank',
        windowFeatures: 'menubar=no,location=no,toolbar=no,width=1200,height=800'
      }
    };
  }

  /**
   * Handle Names and Roles Provisioning Service (NRPS) request
   */
  async getNamesAndRoles(contextMembershipsUrl, accessToken) {
    try {
      const response = await axios.get(contextMembershipsUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.ims.lti-nrps.v2.membershipcontainer+json'
        }
      });

      return response.data.members || [];
    } catch (error) {
      throw new Error(`Failed to get roster via NRPS: ${error.message}`);
    }
  }

  /**
   * Handle Assignment and Grade Services (AGS) - Send grade
   */
  async sendGrade(lineItemUrl, userId, score, scoreMaximum, accessToken) {
    try {
      const gradePayload = {
        userId,
        scoreGiven: score,
        scoreMaximum: scoreMaximum || 100,
        activityProgress: 'Completed',
        gradingProgress: 'FullyGraded',
        timestamp: new Date().toISOString()
      };

      const response = await axios.post(lineItemUrl, gradePayload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.ims.lis.v1.score+json'
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to send grade via AGS: ${error.message}`);
    }
  }

  /**
   * Create line item (grade column) in LMS
   */
  async createLineItem(lineItemsUrl, label, scoreMaximum, resourceId, accessToken) {
    try {
      const lineItem = {
        scoreMaximum: scoreMaximum || 100,
        label,
        resourceId,
        tag: 'sangam-attendance'
      };

      const response = await axios.post(lineItemsUrl, lineItem, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.ims.lis.v2.lineitem+json'
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create line item: ${error.message}`);
    }
  }

  /**
   * Get access token for platform services
   */
  async getAccessToken(platformConfig, scopes) {
    try {
      const payload = {
        grant_type: 'client_credentials',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: this.createClientAssertion(platformConfig),
        scope: scopes.join(' ')
      };

      const response = await axios.post(platformConfig.tokenEndpoint, payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data.access_token;
    } catch (error) {
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  /**
   * Create client assertion JWT for token request
   */
  createClientAssertion(platformConfig) {
    const payload = {
      iss: this.config.clientId,
      sub: this.config.clientId,
      aud: platformConfig.tokenEndpoint,
      exp: Math.floor(Date.now() / 1000) + 300,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomBytes(16).toString('hex')
    };

    return jwt.sign(payload, this.config.privateKey, {
      algorithm: 'RS256',
      keyid: this.config.kid
    });
  }
}

module.exports = new LTIService();

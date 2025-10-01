const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

/**
 * Get TURN server credentials from Metered.ca API
 *
 * This endpoint fetches fresh TURN credentials from Metered.ca
 * which include time-limited access tokens for secure TURN server usage.
 *
 * Free tier: 20GB/month
 */
router.get('/credentials', async (req, res) => {
  try {
    const METERED_API_KEY = process.env.METERED_API_KEY;

    if (!METERED_API_KEY) {
      console.error('METERED_API_KEY not configured');
      // Fallback to public TURN servers
      return res.json({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          }
        ]
      });
    }

    // Fetch credentials from Metered.ca
    const response = await fetch(
      `https://sangam.metered.live/api/v1/turn/credentials?apiKey=${METERED_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Metered API error: ${response.status}`);
    }

    const data = await response.json();

    console.log('TURN credentials fetched successfully');
    console.log('Available servers:', data.length);

    res.json({ iceServers: data });
  } catch (error) {
    console.error('Error fetching TURN credentials:', error);

    // Fallback to public TURN servers
    res.json({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ]
    });
  }
});

module.exports = router;

/**
 * Analytics Service for Meeting Insights
 *
 * Features:
 * - Attendance Tracking (join/leave times, duration, late arrivals)
 * - Engagement Metrics (chat messages, reactions, screen shares)
 * - Talk Time Distribution (audio activity tracking)
 * - Meeting Health Score (calculated metric)
 * - Sentiment Analysis (basic mood detection)
 * - Custom Reports Generation
 */

class AnalyticsService {
  constructor() {
    // Store meeting analytics in memory (should be moved to database in production)
    this.meetingAnalytics = new Map(); // roomId -> analytics data
    this.userSessions = new Map(); // sessionId -> user session data
    this.talkTimeTracking = new Map(); // roomId -> speaker activity
  }

  // =================
  // Meeting Session Management
  // =================

  /**
   * Initialize analytics for a new meeting
   */
  initializeMeeting(roomId, meetingData = {}) {
    if (!this.meetingAnalytics.has(roomId)) {
      this.meetingAnalytics.set(roomId, {
        roomId,
        startTime: new Date(),
        endTime: null,
        scheduledStartTime: meetingData.scheduledStartTime || null,
        hostName: meetingData.hostName || 'Unknown',
        title: meetingData.title || 'Untitled Meeting',

        // Attendance tracking
        participants: new Map(), // socketId -> participant data
        totalJoins: 0,
        uniqueParticipants: new Set(),
        lateArrivals: [],
        earlyLeavers: [],

        // Engagement metrics
        totalChatMessages: 0,
        totalReactions: 0,
        totalScreenShares: 0,
        totalRecordings: 0,
        chatActivity: [], // timestamp, userId, type

        // Talk time tracking
        speakerStats: new Map(), // userId -> { totalTime, startTime, intervals }
        dominantSpeakers: [],

        // Technical metrics
        connectionIssues: [],
        qualityIssues: [],

        // Sentiment tracking
        sentimentScores: [],
        overallSentiment: 'neutral',

        // Health score
        healthScore: null,
        healthFactors: {}
      });
    }

    return this.meetingAnalytics.get(roomId);
  }

  /**
   * Record a participant joining the meeting
   */
  recordParticipantJoin(roomId, socketId, userData = {}) {
    const analytics = this.initializeMeeting(roomId);
    const joinTime = new Date();

    const participant = {
      socketId,
      userId: userData.userId || socketId,
      userName: userData.userName || 'Anonymous',
      joinTime,
      leaveTime: null,
      duration: 0,
      wasLate: false,
      leftEarly: false,

      // Activity metrics
      chatMessageCount: 0,
      reactionCount: 0,
      screenShareCount: 0,
      audioTime: 0,
      videoOnTime: 0,

      // Technical metrics
      audioMuted: true,
      videoEnabled: false,
      connectionQuality: 'good'
    };

    // Check if participant is late (>5 minutes after scheduled start)
    if (analytics.scheduledStartTime) {
      const scheduledStart = new Date(analytics.scheduledStartTime);
      const minutesLate = (joinTime - scheduledStart) / (1000 * 60);

      if (minutesLate > 5) {
        participant.wasLate = true;
        participant.minutesLate = Math.round(minutesLate);
        analytics.lateArrivals.push({
          userName: participant.userName,
          minutesLate: participant.minutesLate,
          joinTime
        });
      }
    }

    analytics.participants.set(socketId, participant);
    analytics.totalJoins++;
    analytics.uniqueParticipants.add(userData.userId || socketId);

    return participant;
  }

  /**
   * Record a participant leaving the meeting
   */
  recordParticipantLeave(roomId, socketId) {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics) return null;

    const participant = analytics.participants.get(socketId);
    if (!participant) return null;

    const leaveTime = new Date();
    participant.leaveTime = leaveTime;
    participant.duration = (leaveTime - participant.joinTime) / 1000; // seconds

    // Check if participant left early (more than 15 minutes before meeting end)
    // For now, consider leaving before 80% of average duration as early
    const averageDuration = this.calculateAverageDuration(roomId);
    if (averageDuration && participant.duration < (averageDuration * 0.8)) {
      participant.leftEarly = true;
      analytics.earlyLeavers.push({
        userName: participant.userName,
        duration: Math.round(participant.duration / 60),
        leaveTime
      });
    }

    return participant;
  }

  /**
   * End meeting and finalize analytics
   */
  endMeeting(roomId) {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics) return null;

    analytics.endTime = new Date();
    analytics.totalDuration = (analytics.endTime - analytics.startTime) / 1000; // seconds

    // Calculate final health score
    analytics.healthScore = this.calculateMeetingHealthScore(roomId);

    return analytics;
  }

  // =================
  // Engagement Tracking
  // =================

  /**
   * Record chat message activity
   */
  recordChatMessage(roomId, socketId, messageData = {}) {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics) return;

    analytics.totalChatMessages++;
    analytics.chatActivity.push({
      timestamp: new Date(),
      userId: socketId,
      type: 'chat',
      sentiment: this.analyzeSentiment(messageData.text)
    });

    const participant = analytics.participants.get(socketId);
    if (participant) {
      participant.chatMessageCount++;
    }

    // Update sentiment tracking
    const sentiment = this.analyzeSentiment(messageData.text);
    analytics.sentimentScores.push(sentiment);
    this.updateOverallSentiment(roomId);
  }

  /**
   * Record reaction/emoji activity
   */
  recordReaction(roomId, socketId, reactionType) {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics) return;

    analytics.totalReactions++;
    analytics.chatActivity.push({
      timestamp: new Date(),
      userId: socketId,
      type: 'reaction',
      reactionType
    });

    const participant = analytics.participants.get(socketId);
    if (participant) {
      participant.reactionCount++;
    }
  }

  /**
   * Record screen share activity
   */
  recordScreenShare(roomId, socketId, action = 'start') {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics) return;

    if (action === 'start') {
      analytics.totalScreenShares++;

      const participant = analytics.participants.get(socketId);
      if (participant) {
        participant.screenShareCount++;
      }
    }

    analytics.chatActivity.push({
      timestamp: new Date(),
      userId: socketId,
      type: 'screen_share',
      action
    });
  }

  /**
   * Record audio/video state changes
   */
  recordMediaStateChange(roomId, socketId, mediaType, enabled) {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics) return;

    const participant = analytics.participants.get(socketId);
    if (!participant) return;

    if (mediaType === 'audio') {
      participant.audioMuted = !enabled;
      if (enabled) {
        participant.audioStartTime = new Date();
      } else if (participant.audioStartTime) {
        const duration = (new Date() - participant.audioStartTime) / 1000;
        participant.audioTime += duration;
        delete participant.audioStartTime;
      }
    } else if (mediaType === 'video') {
      participant.videoEnabled = enabled;
      if (enabled) {
        participant.videoStartTime = new Date();
      } else if (participant.videoStartTime) {
        const duration = (new Date() - participant.videoStartTime) / 1000;
        participant.videoOnTime += duration;
        delete participant.videoStartTime;
      }
    }
  }

  // =================
  // Talk Time Distribution
  // =================

  /**
   * Start tracking audio activity for a speaker
   */
  startSpeaking(roomId, socketId, userName) {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics) return;

    const speakerKey = socketId;

    if (!analytics.speakerStats.has(speakerKey)) {
      analytics.speakerStats.set(speakerKey, {
        socketId,
        userName,
        totalTime: 0,
        intervals: [],
        startTime: null
      });
    }

    const speakerData = analytics.speakerStats.get(speakerKey);
    if (!speakerData.startTime) {
      speakerData.startTime = new Date();
    }
  }

  /**
   * Stop tracking audio activity for a speaker
   */
  stopSpeaking(roomId, socketId) {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics) return;

    const speakerData = analytics.speakerStats.get(socketId);
    if (!speakerData || !speakerData.startTime) return;

    const duration = (new Date() - speakerData.startTime) / 1000; // seconds
    speakerData.totalTime += duration;
    speakerData.intervals.push({
      start: speakerData.startTime,
      end: new Date(),
      duration
    });
    speakerData.startTime = null;

    // Update dominant speakers list
    this.updateDominantSpeakers(roomId);
  }

  /**
   * Update the list of dominant speakers
   */
  updateDominantSpeakers(roomId) {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics) return;

    const speakers = Array.from(analytics.speakerStats.values())
      .filter(s => s.totalTime > 0)
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 5) // Top 5 speakers
      .map(s => ({
        userName: s.userName,
        totalTime: Math.round(s.totalTime),
        percentage: 0 // Will calculate below
      }));

    const totalTalkTime = speakers.reduce((sum, s) => sum + s.totalTime, 0);
    speakers.forEach(s => {
      s.percentage = totalTalkTime > 0 ? Math.round((s.totalTime / totalTalkTime) * 100) : 0;
    });

    analytics.dominantSpeakers = speakers;
  }

  /**
   * Get talk time distribution for a meeting
   */
  getTalkTimeDistribution(roomId) {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics) return null;

    this.updateDominantSpeakers(roomId);

    const totalParticipants = analytics.participants.size;
    const speakersCount = analytics.speakerStats.size;
    const silentParticipants = totalParticipants - speakersCount;

    return {
      dominantSpeakers: analytics.dominantSpeakers,
      totalSpeakers: speakersCount,
      silentParticipants,
      silentPercentage: totalParticipants > 0
        ? Math.round((silentParticipants / totalParticipants) * 100)
        : 0
    };
  }

  // =================
  // Sentiment Analysis
  // =================

  /**
   * Simple sentiment analysis (basic implementation)
   * In production, use a proper NLP library or AI model
   */
  analyzeSentiment(text) {
    if (!text) return 0;

    const positiveWords = [
      'great', 'good', 'excellent', 'awesome', 'fantastic', 'love', 'perfect',
      'happy', 'thank', 'thanks', 'agree', 'yes', 'definitely', 'absolutely',
      'wonderful', 'amazing', 'brilliant', 'outstanding', 'helpful', 'nice'
    ];

    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'hate', 'wrong', 'issue',
      'problem', 'disagree', 'no', 'never', 'unfortunately', 'sadly',
      'poor', 'disappointing', 'confused', 'frustrating', 'difficult'
    ];

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });

    // Normalize to -1 to 1 range
    const normalized = Math.max(-1, Math.min(1, score / Math.max(words.length / 5, 1)));
    return normalized;
  }

  /**
   * Update overall meeting sentiment
   */
  updateOverallSentiment(roomId) {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics || analytics.sentimentScores.length === 0) return;

    const avgScore = analytics.sentimentScores.reduce((sum, s) => sum + s, 0) / analytics.sentimentScores.length;

    if (avgScore > 0.3) {
      analytics.overallSentiment = 'positive';
    } else if (avgScore < -0.3) {
      analytics.overallSentiment = 'negative';
    } else {
      analytics.overallSentiment = 'neutral';
    }
  }

  // =================
  // Meeting Health Score
  // =================

  /**
   * Calculate overall meeting health score (0-100)
   */
  calculateMeetingHealthScore(roomId) {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics) return null;

    const factors = {};
    let totalScore = 0;
    let factorCount = 0;

    // Factor 1: Attendance (0-20 points)
    const totalParticipants = analytics.participants.size;
    if (totalParticipants > 0) {
      const lateRate = analytics.lateArrivals.length / totalParticipants;
      const earlyLeaveRate = analytics.earlyLeavers.length / totalParticipants;
      factors.attendance = Math.max(0, 20 - (lateRate * 10) - (earlyLeaveRate * 10));
      totalScore += factors.attendance;
      factorCount++;
    }

    // Factor 2: Engagement (0-30 points)
    if (totalParticipants > 0) {
      const avgMessages = analytics.totalChatMessages / totalParticipants;
      const avgReactions = analytics.totalReactions / totalParticipants;
      const messageScore = Math.min(15, avgMessages * 2);
      const reactionScore = Math.min(15, avgReactions * 3);
      factors.engagement = messageScore + reactionScore;
      totalScore += factors.engagement;
      factorCount++;
    }

    // Factor 3: Participation Balance (0-25 points)
    const talkTimeData = this.getTalkTimeDistribution(roomId);
    if (talkTimeData && talkTimeData.dominantSpeakers.length > 0) {
      const topSpeakerPct = talkTimeData.dominantSpeakers[0]?.percentage || 0;
      const silentPct = talkTimeData.silentPercentage;

      // Ideal: top speaker < 40%, silent < 30%
      const balanceScore = Math.max(0, 25 - (Math.max(0, topSpeakerPct - 40) * 0.5) - (silentPct * 0.3));
      factors.participationBalance = balanceScore;
      totalScore += balanceScore;
      factorCount++;
    }

    // Factor 4: Sentiment (0-15 points)
    if (analytics.sentimentScores.length > 0) {
      const avgSentiment = analytics.sentimentScores.reduce((sum, s) => sum + s, 0) / analytics.sentimentScores.length;
      // Map -1 to 1 range to 0 to 15 points
      factors.sentiment = (avgSentiment + 1) * 7.5;
      totalScore += factors.sentiment;
      factorCount++;
    }

    // Factor 5: Duration Appropriateness (0-10 points)
    if (analytics.totalDuration) {
      const durationMinutes = analytics.totalDuration / 60;
      // Ideal: 15-60 minutes
      let durationScore = 10;
      if (durationMinutes < 15) {
        durationScore = Math.max(0, 10 - (15 - durationMinutes) * 0.5);
      } else if (durationMinutes > 60) {
        durationScore = Math.max(0, 10 - (durationMinutes - 60) * 0.1);
      }
      factors.duration = durationScore;
      totalScore += durationScore;
      factorCount++;
    }

    analytics.healthFactors = factors;

    // Calculate final score (0-100)
    const finalScore = factorCount > 0 ? Math.round(totalScore) : 0;
    return Math.min(100, Math.max(0, finalScore));
  }

  // =================
  // Technical Metrics
  // =================

  /**
   * Record connection quality issue
   */
  recordConnectionIssue(roomId, socketId, issueType, severity = 'medium') {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics) return;

    analytics.connectionIssues.push({
      timestamp: new Date(),
      userId: socketId,
      issueType,
      severity
    });

    const participant = analytics.participants.get(socketId);
    if (participant) {
      participant.connectionQuality = severity === 'high' ? 'poor' : 'fair';
    }
  }

  // =================
  // Reports & Summaries
  // =================

  /**
   * Get comprehensive meeting analytics
   */
  getMeetingAnalytics(roomId) {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics) return null;

    // Calculate current duration
    const endTime = analytics.endTime || new Date();
    const duration = (endTime - analytics.startTime) / 1000;

    // Get participant summaries
    const participants = Array.from(analytics.participants.values()).map(p => ({
      userName: p.userName,
      joinTime: p.joinTime,
      leaveTime: p.leaveTime,
      duration: Math.round(p.duration || ((new Date() - p.joinTime) / 1000)),
      wasLate: p.wasLate,
      minutesLate: p.minutesLate || 0,
      chatMessages: p.chatMessageCount,
      reactions: p.reactionCount,
      screenShares: p.screenShareCount,
      audioTime: Math.round(p.audioTime),
      videoOnTime: Math.round(p.videoOnTime),
      connectionQuality: p.connectionQuality
    }));

    return {
      roomId: analytics.roomId,
      title: analytics.title,
      hostName: analytics.hostName,
      startTime: analytics.startTime,
      endTime: analytics.endTime,
      duration: Math.round(duration),

      // Attendance
      totalParticipants: analytics.participants.size,
      uniqueParticipants: analytics.uniqueParticipants.size,
      lateArrivals: analytics.lateArrivals,
      earlyLeavers: analytics.earlyLeavers,
      participants,

      // Engagement
      totalChatMessages: analytics.totalChatMessages,
      totalReactions: analytics.totalReactions,
      totalScreenShares: analytics.totalScreenShares,
      engagementRate: participants.length > 0
        ? Math.round(((analytics.totalChatMessages + analytics.totalReactions) / participants.length) * 10) / 10
        : 0,

      // Talk time
      talkTimeDistribution: this.getTalkTimeDistribution(roomId),

      // Sentiment
      overallSentiment: analytics.overallSentiment,
      sentimentScore: analytics.sentimentScores.length > 0
        ? Math.round((analytics.sentimentScores.reduce((sum, s) => sum + s, 0) / analytics.sentimentScores.length) * 100) / 100
        : 0,

      // Health
      healthScore: analytics.healthScore || this.calculateMeetingHealthScore(roomId),
      healthFactors: analytics.healthFactors,

      // Technical
      connectionIssues: analytics.connectionIssues.length,
      averageConnectionQuality: this.calculateAverageConnectionQuality(roomId)
    };
  }

  /**
   * Get summary report for a meeting
   */
  generateMeetingSummary(roomId) {
    const analytics = this.getMeetingAnalytics(roomId);
    if (!analytics) return null;

    const summary = {
      title: analytics.title,
      duration: `${Math.floor(analytics.duration / 60)} minutes`,
      participants: analytics.totalParticipants,
      healthScore: analytics.healthScore,

      highlights: [],
      concerns: [],
      recommendations: []
    };

    // Generate highlights
    if (analytics.engagementRate > 5) {
      summary.highlights.push(`High engagement with ${analytics.engagementRate} interactions per participant`);
    }
    if (analytics.overallSentiment === 'positive') {
      summary.highlights.push('Positive meeting sentiment');
    }
    if (analytics.talkTimeDistribution?.silentPercentage < 20) {
      summary.highlights.push('Good participation balance');
    }

    // Generate concerns
    if (analytics.lateArrivals.length > 0) {
      summary.concerns.push(`${analytics.lateArrivals.length} participants arrived late`);
    }
    if (analytics.talkTimeDistribution?.silentPercentage > 50) {
      summary.concerns.push(`${analytics.talkTimeDistribution.silentPercentage}% of participants were silent`);
    }
    if (analytics.connectionIssues > 5) {
      summary.concerns.push(`${analytics.connectionIssues} connection quality issues`);
    }

    // Generate recommendations
    if (analytics.duration > 3600) {
      summary.recommendations.push('Consider shorter meetings (under 60 minutes) for better engagement');
    }
    if (analytics.talkTimeDistribution?.dominantSpeakers[0]?.percentage > 50) {
      summary.recommendations.push('Encourage more balanced participation');
    }
    if (analytics.engagementRate < 2) {
      summary.recommendations.push('Use polls, Q&A, or breakout rooms to increase engagement');
    }

    return summary;
  }

  /**
   * Get analytics for all meetings
   */
  getAllMeetingsAnalytics() {
    const allAnalytics = [];

    this.meetingAnalytics.forEach((analytics, roomId) => {
      allAnalytics.push(this.getMeetingAnalytics(roomId));
    });

    return allAnalytics.sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Generate aggregate statistics across all meetings
   */
  generateAggregateStats() {
    const allMeetings = this.getAllMeetingsAnalytics();

    if (allMeetings.length === 0) {
      return {
        totalMeetings: 0,
        totalDuration: 0,
        totalParticipants: 0,
        averageHealthScore: 0,
        averageDuration: 0,
        averageParticipants: 0
      };
    }

    const stats = {
      totalMeetings: allMeetings.length,
      totalDuration: allMeetings.reduce((sum, m) => sum + m.duration, 0),
      totalParticipants: allMeetings.reduce((sum, m) => sum + m.totalParticipants, 0),
      averageHealthScore: Math.round(allMeetings.reduce((sum, m) => sum + (m.healthScore || 0), 0) / allMeetings.length),
      averageDuration: Math.round(allMeetings.reduce((sum, m) => sum + m.duration, 0) / allMeetings.length),
      averageParticipants: Math.round(allMeetings.reduce((sum, m) => sum + m.totalParticipants, 0) / allMeetings.length),

      topPerformingMeetings: allMeetings
        .filter(m => m.healthScore)
        .sort((a, b) => b.healthScore - a.healthScore)
        .slice(0, 5)
        .map(m => ({
          title: m.title,
          date: m.startTime,
          healthScore: m.healthScore
        })),

      mostEngagedMeetings: allMeetings
        .sort((a, b) => b.engagementRate - a.engagementRate)
        .slice(0, 5)
        .map(m => ({
          title: m.title,
          date: m.startTime,
          engagementRate: m.engagementRate
        }))
    };

    return stats;
  }

  // =================
  // Utility Methods
  // =================

  /**
   * Calculate average meeting duration
   */
  calculateAverageDuration(roomId) {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics || analytics.participants.size === 0) return null;

    let totalDuration = 0;
    let count = 0;

    analytics.participants.forEach(p => {
      if (p.duration > 0) {
        totalDuration += p.duration;
        count++;
      }
    });

    return count > 0 ? totalDuration / count : null;
  }

  /**
   * Calculate average connection quality
   */
  calculateAverageConnectionQuality(roomId) {
    const analytics = this.meetingAnalytics.get(roomId);
    if (!analytics || analytics.participants.size === 0) return 'unknown';

    const qualityScores = { good: 3, fair: 2, poor: 1 };
    let totalScore = 0;
    let count = 0;

    analytics.participants.forEach(p => {
      totalScore += qualityScores[p.connectionQuality] || 0;
      count++;
    });

    const avgScore = count > 0 ? totalScore / count : 0;

    if (avgScore >= 2.5) return 'good';
    if (avgScore >= 1.5) return 'fair';
    return 'poor';
  }

  /**
   * Clear analytics for a specific meeting
   */
  clearMeetingAnalytics(roomId) {
    return this.meetingAnalytics.delete(roomId);
  }

  /**
   * Clear all analytics data
   */
  clearAllAnalytics() {
    this.meetingAnalytics.clear();
    this.userSessions.clear();
    this.talkTimeTracking.clear();
  }
}

// Export singleton instance
module.exports = new AnalyticsService();

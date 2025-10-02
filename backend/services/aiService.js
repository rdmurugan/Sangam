// AI Service for Translation and Meeting Intelligence
// This service integrates with OpenAI for AI capabilities

class AIService {
  constructor() {
    // In production, use environment variables for API keys
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = 'gpt-4-turbo-preview';
  }

  // Language detection
  async detectLanguage(text) {
    const languagePatterns = {
      'en': /^[a-zA-Z\s.,!?'-]+$/,
      'es': /[áéíóúñ¿¡]/i,
      'fr': /[àâçéèêëîïôùûü]/i,
      'de': /[äöüß]/i,
      'it': /[àèéìòù]/i,
      'pt': /[ãçõ]/i,
      'zh': /[\u4e00-\u9fa5]/,
      'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
      'ko': /[\uac00-\ud7af]/,
      'ar': /[\u0600-\u06ff]/,
      'hi': /[\u0900-\u097f]/,
      'ru': /[\u0400-\u04ff]/
    };

    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    return 'en'; // Default to English
  }

  // Translate text (mock implementation - in production use Google Translate API or DeepL)
  async translateText(text, targetLang, sourceLang = null) {
    // Mock translation for demonstration
    // In production, integrate with:
    // - Google Cloud Translation API
    // - DeepL API
    // - Azure Translator

    if (!sourceLang) {
      sourceLang = await this.detectLanguage(text);
    }

    // Return original if same language
    if (sourceLang === targetLang) {
      return { text, sourceLang, targetLang };
    }

    // Mock translation response
    return {
      text: `[${targetLang.toUpperCase()}] ${text}`,
      sourceLang,
      targetLang,
      translatedText: text // In production, this would be the actual translation
    };
  }

  // Generate meeting summary using AI
  async generateMeetingSummary(transcript) {
    if (!this.apiKey) {
      // Mock summary if no API key
      return this.generateMockSummary(transcript);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an AI meeting assistant. Analyze meeting transcripts and provide structured summaries with key points, action items, decisions, and follow-ups.'
            },
            {
              role: 'user',
              content: `Analyze this meeting transcript and provide:
1. Executive Summary (2-3 sentences)
2. Key Discussion Points (bullet points)
3. Decisions Made (bullet points)
4. Action Items (with assignees if mentioned)
5. Follow-up Topics

Transcript:
${transcript}

Format as JSON with keys: summary, keyPoints, decisions, actionItems, followUps`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const data = await response.json();
      const content = data.choices[0].message.content;

      try {
        return JSON.parse(content);
      } catch {
        return this.parseAIResponse(content);
      }
    } catch (error) {
      console.error('AI Summary Error:', error);
      return this.generateMockSummary(transcript);
    }
  }

  // Extract action items from transcript
  async extractActionItems(transcript) {
    const actionKeywords = [
      'will', 'should', 'must', 'need to', 'has to', 'action item',
      'todo', 'task', 'follow up', 'assign', 'responsible for'
    ];

    const lines = transcript.split('\n');
    const actionItems = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (actionKeywords.some(keyword => lowerLine.includes(keyword))) {
        // Extract person and task
        const match = line.match(/(@?\w+)\s+(will|should|must|need to|has to)\s+(.+)/i);
        if (match) {
          actionItems.push({
            assignee: match[1].replace('@', ''),
            task: match[3].trim(),
            priority: this.detectPriority(line),
            dueDate: this.extractDueDate(line)
          });
        } else {
          actionItems.push({
            assignee: 'Unassigned',
            task: line.trim(),
            priority: 'medium',
            dueDate: null
          });
        }
      }
    }

    return actionItems;
  }

  // Detect priority from text
  detectPriority(text) {
    const urgent = /urgent|asap|immediately|critical|high priority/i;
    const low = /when possible|eventually|low priority|nice to have/i;

    if (urgent.test(text)) return 'high';
    if (low.test(text)) return 'low';
    return 'medium';
  }

  // Extract due date from text
  extractDueDate(text) {
    const datePatterns = [
      /tomorrow/i,
      /next week/i,
      /by (\w+ \d+)/i,
      /due (\w+)/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  // Generate mock summary (fallback when no API key)
  generateMockSummary(transcript) {
    const lines = transcript.split('\n').filter(l => l.trim());
    const speakers = [...new Set(lines.map(l => l.split(':')[0]).filter(Boolean))];

    return {
      summary: `Meeting discussion involving ${speakers.length} participants. Key topics were covered with action items identified for follow-up.`,
      keyPoints: [
        'Discussion of project milestones and deliverables',
        'Review of current progress and blockers',
        'Planning for upcoming sprint',
        'Resource allocation and timeline updates'
      ],
      decisions: [
        'Approved new timeline for project delivery',
        'Assigned tasks to respective team members',
        'Scheduled follow-up meeting for next week'
      ],
      actionItems: [
        {
          assignee: speakers[0] || 'Unassigned',
          task: 'Prepare status report',
          priority: 'high',
          dueDate: 'End of week'
        },
        {
          assignee: speakers[1] || 'Unassigned',
          task: 'Review documentation',
          priority: 'medium',
          dueDate: 'Next Monday'
        }
      ],
      followUps: [
        'Schedule design review session',
        'Confirm availability for next sprint planning',
        'Share meeting notes with stakeholders'
      ],
      participants: speakers,
      duration: Math.floor(lines.length / 4), // Rough estimate
      timestamp: new Date().toISOString()
    };
  }

  // Parse AI response if not JSON
  parseAIResponse(content) {
    const sections = {
      summary: '',
      keyPoints: [],
      decisions: [],
      actionItems: [],
      followUps: []
    };

    const lines = content.split('\n');
    let currentSection = null;

    for (const line of lines) {
      if (line.includes('Summary') || line.includes('SUMMARY')) {
        currentSection = 'summary';
      } else if (line.includes('Key Points') || line.includes('DISCUSSION')) {
        currentSection = 'keyPoints';
      } else if (line.includes('Decision') || line.includes('DECISION')) {
        currentSection = 'decisions';
      } else if (line.includes('Action') || line.includes('ACTION')) {
        currentSection = 'actionItems';
      } else if (line.includes('Follow') || line.includes('FOLLOW')) {
        currentSection = 'followUps';
      } else if (line.trim() && currentSection) {
        if (currentSection === 'summary') {
          sections.summary += line.trim() + ' ';
        } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
          const text = line.trim().replace(/^[-•]\s*/, '');
          if (currentSection === 'actionItems') {
            sections[currentSection].push({
              task: text,
              assignee: 'Unassigned',
              priority: 'medium',
              dueDate: null
            });
          } else {
            sections[currentSection].push(text);
          }
        }
      }
    }

    return sections;
  }

  // Generate smart highlights
  async generateHighlights(transcript) {
    const highlights = [];
    const lines = transcript.split('\n').filter(l => l.trim());

    // Detect important moments
    const importantKeywords = [
      'important', 'key point', 'decision', 'agree', 'confirmed',
      'action item', 'deadline', 'milestone', 'priority', 'critical'
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      if (importantKeywords.some(keyword => lowerLine.includes(keyword))) {
        highlights.push({
          timestamp: i * 5, // Rough timestamp (5 seconds per line)
          text: line,
          type: this.classifyHighlight(lowerLine),
          speaker: line.split(':')[0] || 'Unknown'
        });
      }
    }

    return highlights;
  }

  // Classify highlight type
  classifyHighlight(text) {
    if (text.includes('decision') || text.includes('agree')) return 'decision';
    if (text.includes('action') || text.includes('task')) return 'action';
    if (text.includes('important') || text.includes('key')) return 'key-point';
    if (text.includes('deadline') || text.includes('due')) return 'deadline';
    return 'general';
  }

  // Format meeting summary as email
  formatAsEmail(summary, meetingTitle, participants) {
    return `
Subject: Meeting Summary - ${meetingTitle}

Dear Team,

Here's a summary of our meeting:

📝 EXECUTIVE SUMMARY
${summary.summary}

🔑 KEY DISCUSSION POINTS
${summary.keyPoints.map(p => `• ${p}`).join('\n')}

✅ DECISIONS MADE
${summary.decisions.map(d => `• ${d}`).join('\n')}

📋 ACTION ITEMS
${summary.actionItems.map(item => `• ${item.task} - Assigned to: ${item.assignee} ${item.dueDate ? `(Due: ${item.dueDate})` : ''}`).join('\n')}

🔄 FOLLOW-UP TOPICS
${summary.followUps.map(f => `• ${f}`).join('\n')}

---
Participants: ${participants.join(', ')}
Generated by Sangam AI Assistant
    `.trim();
  }
}

module.exports = new AIService();

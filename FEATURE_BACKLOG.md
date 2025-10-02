# Sangam Feature Backlog

**Last Updated**: 2025-10-02
**Purpose**: Track features removed from marketing website for future implementation

---

## Overview

This document tracks features that were claimed on the marketing website but removed due to incomplete or missing implementation. These are candidates for future development based on priority and business value.

---

## High Priority Features (Quarter 1-2)

### 1. Cloud Recording Storage

**Status**: 🔴 **REMOVED FROM WEBSITE**
**Category**: Recording & Transcription
**Business Value**: HIGH
**Complexity**: Medium

**Original Website Claim**:
> "Record meetings to the cloud with automatic storage and easy sharing capabilities"

**What Was Promised**:
- Automatic cloud storage
- Speaker view and gallery view
- Searchable recordings
- Shareable links

**Current State**:
- ✅ Recording indicator UI exists (`RecordingIndicator.js`)
- ✅ Recording flag in room settings
- ❌ No cloud storage integration
- ❌ No file upload to S3/Azure/GCS

**Implementation Requirements**:
1. **Backend**:
   - Integrate AWS S3 or Azure Blob Storage
   - Recording file upload service
   - Presigned URL generation for sharing
   - Storage quota management per license tier

2. **Frontend**:
   - Recording management UI
   - Download and share controls
   - Recording playback interface

3. **Infrastructure**:
   - Cloud storage bucket setup
   - CDN for video delivery
   - Storage cost monitoring

**Estimated Effort**: 3-4 weeks
**Dependencies**: License tier validation, storage infrastructure
**ROI**: High - frequently requested feature

---

### 2. Live Transcription

**Status**: 🔴 **REMOVED FROM WEBSITE**
**Category**: Recording & Transcription
**Business Value**: HIGH
**Complexity**: High

**Original Website Claim**:
> "AI-powered real-time transcription with speaker identification and keyword highlighting"

**What Was Promised**:
- Real-time captions
- Speaker identification
- Multiple language support
- Downloadable transcripts

**Current State**:
- ✅ Transcript storage infrastructure (`transcripts` Map in server.js)
- ❌ No speech-to-text integration
- ❌ No speaker identification
- ❌ No real-time caption display

**Implementation Requirements**:
1. **Speech-to-Text Integration** (Choose one):
   - Google Cloud Speech-to-Text API
   - AWS Transcribe
   - Azure Speech Services
   - Web Speech API (browser-based, free but limited)

2. **Backend**:
   - Audio stream processing
   - Real-time transcription websocket
   - Speaker diarization
   - Transcript storage and export

3. **Frontend**:
   - Live caption overlay
   - Transcript viewer
   - Download as TXT/SRT/VTT
   - Language selection UI

4. **Features**:
   - Multiple language support
   - Keyword highlighting
   - Edit and correct transcripts
   - Search within transcripts

**Estimated Effort**: 5-6 weeks
**Dependencies**: Cloud AI service account, audio processing pipeline
**ROI**: Very High - accessibility requirement, competitive feature

---

### 3. LMS Integration

**Status**: 🔴 **REMOVED FROM WEBSITE**
**Category**: Integration
**Business Value**: HIGH (for education segment)
**Complexity**: High

**Original Website Claim**:
> "Deep integration with learning management systems for education and training with grade sync and attendance tracking"

**What Was Promised**:
- Single sign-on (SSO)
- Grade sync
- Attendance tracking
- Assignment integration

**Current State**:
- ❌ No LMS integration at all
- ✅ Attendance tracking exists in analytics

**Implementation Requirements**:
1. **LTI (Learning Tools Interoperability) Standard**:
   - LTI 1.3 integration
   - OAuth 2.0 authentication
   - Grade passback
   - Deep linking

2. **Target LMS Platforms**:
   - Canvas
   - Moodle
   - Blackboard Learn
   - Google Classroom
   - Schoology

3. **Features**:
   - SSO from LMS
   - Automatic roster sync
   - Attendance tracking export
   - Meeting links in course modules
   - Grade sync for participation

4. **Backend**:
   - LTI authentication service
   - Grade passback API
   - Roster sync service
   - Assignment integration

5. **Frontend**:
   - LMS settings panel
   - Grade book interface
   - Assignment management

**Estimated Effort**: 8-10 weeks
**Dependencies**: LTI certification, LMS test accounts
**ROI**: High - unlocks education market segment

---

## Medium Priority Features (Quarter 3-4)

### 4. Virtual Backgrounds (Custom Upload)

**Status**: ⚠️ **DOWNGRADED ON WEBSITE**
**Category**: Video & Audio
**Business Value**: Medium
**Complexity**: Medium

**Original Website Claim**:
> "Professional virtual backgrounds and blur effects with custom image upload and green screen support"

**What Was Promised**:
- Pre-loaded professional backgrounds
- Custom image upload
- Background blur
- Green screen support

**Current State**:
- ⚠️ Basic concept only
- ❌ No background replacement implementation
- ❌ No custom upload

**Website Now Says**: "Camera & Audio Selection" (downgraded claim)

**Implementation Requirements**:
1. **Technology**:
   - TensorFlow.js for body segmentation
   - Canvas-based background replacement
   - GPU acceleration support

2. **Features**:
   - Background blur (Gaussian blur)
   - Virtual background images
   - Custom image upload
   - Background library
   - Green screen chroma keying

3. **Performance**:
   - Optimize for low-end devices
   - Resolution adjustment
   - Frame rate management

**Estimated Effort**: 4-5 weeks
**Dependencies**: TensorFlow.js model, GPU support
**ROI**: Medium - nice-to-have, competitive parity

---

### 5. Webhook System

**Status**: 🔴 **REMOVED FROM WEBSITE**
**Category**: Integration
**Business Value**: Medium
**Complexity**: Medium

**Original Website Claim**:
> "Powerful APIs and webhooks for custom integrations and workflow automation"

**What Was Promised**:
- Webhook events
- Custom integrations
- Automation capabilities

**Current State**:
- ✅ REST API exists
- ❌ No webhook system

**Website Now Says**: "REST API Access" (removed webhooks claim)

**Implementation Requirements**:
1. **Webhook Events**:
   - Meeting started/ended
   - Participant joined/left
   - Recording started/stopped
   - Chat messages
   - Room created/deleted

2. **Backend**:
   - Webhook registration API
   - Event queue system
   - Retry logic with exponential backoff
   - Webhook signature verification (HMAC)
   - Event delivery logs

3. **Frontend**:
   - Webhook management UI
   - Event log viewer
   - Test webhook interface

4. **Security**:
   - Webhook secret generation
   - Request signing
   - IP whitelisting option

**Estimated Effort**: 3-4 weeks
**Dependencies**: Queue system (Bull/Redis)
**ROI**: Medium - important for enterprise customers

---

### 6. Multi-Camera Switching

**Status**: ⚠️ **DOWNGRADED ON WEBSITE**
**Category**: Video & Audio
**Business Value**: Low-Medium
**Complexity**: High

**Original Website Claim**:
> "Switch between multiple cameras seamlessly during meetings for dynamic presentations"

**What Was Promised**:
- Switch between devices
- Picture-in-picture mode
- Document camera integration
- Smooth transitions

**Current State**:
- ✅ Camera selection in settings
- ❌ No real-time switching
- ❌ No PiP mode

**Website Now Says**: "Camera & Audio Selection" (downgraded to device selection)

**Implementation Requirements**:
1. **Features**:
   - Real-time camera hot-swapping
   - Multiple simultaneous camera streams
   - Picture-in-picture layout
   - Smooth transitions without connection drop

2. **Technical Challenges**:
   - WebRTC track replacement
   - Bandwidth management
   - Synchronization issues

3. **UI/UX**:
   - Camera switcher control
   - Preview thumbnails
   - Layout manager

**Estimated Effort**: 5-6 weeks
**Dependencies**: WebRTC expertise, bandwidth testing
**ROI**: Low - niche use case (product demos, teaching)

---

## Low Priority / Future Considerations

### 7. Enhanced Virtual Backgrounds

**Features**:
- AI-powered background removal (no green screen)
- Animated backgrounds
- Brand logo watermarks
- Custom background library

**Estimated Effort**: 3-4 weeks
**ROI**: Low - cosmetic feature

---

### 8. Advanced Recording Features

**Features**:
- Multi-track recording (separate audio per participant)
- Recording highlights/chapters
- Auto-editing (remove silence)
- Recording templates

**Estimated Effort**: 6-8 weeks
**ROI**: Medium - professional content creators

---

### 9. Advanced Transcription

**Features**:
- Custom vocabulary training
- Industry-specific language models
- Automatic punctuation
- Sentiment analysis
- Key moment detection

**Estimated Effort**: 4-5 weeks
**Dependencies**: After basic transcription implemented
**ROI**: Medium - enterprise feature

---

## Implementation Roadmap

### Phase 1: Q1 2026 (Critical)
1. **Cloud Recording Storage** (3-4 weeks)
   - Top customer request
   - Revenue impact: Enables premium tier features

2. **Live Transcription** (5-6 weeks)
   - Accessibility requirement
   - Competitive necessity

**Total Q1 Effort**: ~9 weeks

---

### Phase 2: Q2 2026 (High Value)
3. **LMS Integration** (8-10 weeks)
   - Opens education market
   - High revenue potential

**Total Q2 Effort**: ~10 weeks

---

### Phase 3: Q3 2026 (Enhancement)
4. **Webhook System** (3-4 weeks)
   - Enterprise feature
   - Integration enabler

5. **Virtual Backgrounds** (4-5 weeks)
   - Competitive parity
   - User experience

**Total Q3 Effort**: ~8 weeks

---

### Phase 4: Q4 2026 (Nice-to-Have)
6. **Multi-Camera Switching** (5-6 weeks)
   - Niche feature
   - Differentiation

**Total Q4 Effort**: ~6 weeks

---

## Resource Requirements

### Development Team
- **Backend Engineer**: 1 FTE (full year)
- **Frontend Engineer**: 1 FTE (full year)
- **DevOps**: 0.5 FTE (infrastructure, cloud setup)
- **QA Engineer**: 0.5 FTE (testing)

### Infrastructure Costs (Annual Estimates)
- **Cloud Storage** (S3/Azure): $500-2000/month (usage-based)
- **Transcription API**: $0.006-0.024 per minute (~$1000-5000/month)
- **AI Services**: $200-1000/month
- **CDN**: $100-500/month

**Total Infrastructure**: ~$22,000-102,000/year (scales with usage)

---

## Success Metrics

### Cloud Recording
- **Target**: 60% of paid users use recording
- **Metric**: Average 2 hours of recording per user/month
- **Revenue**: Potential upsell to higher storage tiers

### Live Transcription
- **Target**: 40% of meetings use transcription
- **Metric**: Accessibility compliance achieved
- **Revenue**: Premium feature for Startup+ tiers

### LMS Integration
- **Target**: 20% market share in education segment
- **Metric**: 1000+ educational institutions
- **Revenue**: $50-200/institution/month

---

## Decision Log

| Date | Feature | Decision | Reason |
|------|---------|----------|--------|
| 2025-10-02 | Virtual Backgrounds | DOWNGRADE | Incomplete implementation, misleading claim |
| 2025-10-02 | Multi-Camera | DOWNGRADE | Only device selection works, not real-time switching |
| 2025-10-02 | Cloud Recording | REMOVE | No cloud storage exists, only local recording |
| 2025-10-02 | Live Transcription | REMOVE | No implementation at all |
| 2025-10-02 | LMS Integration | REMOVE | Completely not implemented |
| 2025-10-02 | Webhooks | REMOVE | No webhook system exists |

---

## Related Documents

- `WEBSITE_CLAIMS_VS_IMPLEMENTATION.md` - Full audit of website claims
- `website/README.md` - Website documentation
- `LICENSING_SYSTEM.md` - License tier definitions

---

## Notes

- All estimates are for MVP (Minimum Viable Product) versions
- Production-ready versions may require 20-30% additional time
- Infrastructure costs scale with user base
- Some features require ongoing API costs (transcription, AI)
- LMS integration requires LTI certification process (additional 2-3 weeks)

---

**Maintained By**: Engineering Team
**Review Cycle**: Monthly
**Next Review**: 2025-11-02

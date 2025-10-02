# Sangam LMS Integration Plugin

Complete Learning Management System integration for Sangam video conferencing platform.

## Overview

The LMS plugin enables seamless integration between Sangam and major Learning Management Systems, providing:

- **LTI 1.3 Standard Compliance** - Industry-standard secure integration
- **4 Major LMS Platforms** - Canvas, Moodle, Blackboard, Google Classroom
- **Automated Roster Sync** - Keep student rosters up-to-date
- **Grade Book Integration** - Sync attendance and participation as grades
- **Assignment Management** - Create and manage assignments from LMS
- **Single Sign-On (SSO)** - Seamless authentication via LMS

## License Requirement

⚠️ **LMS Integration requires the INSTITUTIONAL tier license** ($999/month or $9,990/year)

Features included with INSTITUTIONAL tier:
- ✅ LMS Integration (Canvas, Moodle, Blackboard, Google Classroom)
- ✅ SSO Integration (SAML, OAuth)
- ✅ Student Roster Management
- ✅ Grade Book Sync
- ✅ Attendance Tracking
- ✅ Assignment Integration
- ✅ Up to 1,000 participants per meeting
- ✅ Unlimited storage and recording
- ✅ Dedicated support with 99.95% SLA

---

## Supported Platforms

### 1. Canvas LMS
- **API**: Canvas REST API v1
- **Authentication**: OAuth 2.0 with access tokens
- **Features**: Full support for courses, assignments, grades, rosters, announcements, modules
- **Setup Guide**: See [Canvas Setup](#canvas-setup)

### 2. Moodle
- **API**: Moodle Web Services API
- **Authentication**: Token-based authentication
- **Features**: Course management, assignments, grading, roster sync
- **Setup Guide**: See [Moodle Setup](#moodle-setup)

### 3. Blackboard Learn
- **API**: Blackboard REST API
- **Authentication**: OAuth 2.0 client credentials
- **Features**: Course access, grade book, roster management
- **Setup Guide**: See [Blackboard Setup](#blackboard-setup)

### 4. Google Classroom
- **API**: Google Classroom API v1
- **Authentication**: Google OAuth 2.0
- **Features**: Course management, assignments, student work, grading
- **Setup Guide**: See [Google Classroom Setup](#google-classroom-setup)

---

## Installation

### 1. Install Dependencies

The LMS plugin uses the following npm packages:

```bash
npm install googleapis axios jsonwebtoken jwks-rsa
```

### 2. Initialize Plugin

In your backend server initialization:

```javascript
const lmsPlugin = require('./plugins/lms/lmsPlugin');

// Initialize with configuration
await lmsPlugin.initialize({
  lti: {
    privateKey: process.env.LTI_PRIVATE_KEY,
    publicKey: process.env.LTI_PUBLIC_KEY,
    issuer: 'https://sangam.com'
  },
  platforms: {
    canvas: {
      enabled: true,
      baseUrl: process.env.CANVAS_BASE_URL,
      accessToken: process.env.CANVAS_ACCESS_TOKEN,
      lti: {
        clientId: process.env.CANVAS_CLIENT_ID,
        deploymentId: process.env.CANVAS_DEPLOYMENT_ID
      }
    },
    moodle: {
      enabled: true,
      baseUrl: process.env.MOODLE_BASE_URL,
      token: process.env.MOODLE_TOKEN,
      lti: {
        clientId: process.env.MOODLE_CLIENT_ID,
        deploymentId: process.env.MOODLE_DEPLOYMENT_ID
      }
    }
    // ... other platforms
  }
});
```

### 3. Add Routes to Server

```javascript
const lmsRoutes = require('./plugins/lms/routes/lmsRoutes');
app.use('/api/lms', lmsRoutes);
```

---

## Platform Setup Guides

### Canvas Setup

1. **Create Developer Key**
   - Go to Admin → Developer Keys → + Developer Key → + LTI Key
   - Configure:
     - Key Name: "Sangam Video Conferencing"
     - Redirect URIs: `https://your-domain.com/api/lms/lti/launch`
     - JWK Method: Public JWK URL: `https://your-domain.com/.well-known/jwks.json`
     - LTI Advantage Services:
       - ✅ Can create and view assignment data
       - ✅ Can view assignment data
       - ✅ Can view submission data
       - ✅ Can retrieve user data associated with the context
   - Save and copy the Client ID

2. **Generate Access Token**
   - Go to Account → Settings → + New Access Token
   - Purpose: "Sangam API Access"
   - Expiration: (set appropriate date)
   - Copy the token

3. **Environment Variables**
   ```bash
   CANVAS_BASE_URL=https://canvas.yourschool.edu
   CANVAS_ACCESS_TOKEN=your_access_token_here
   CANVAS_CLIENT_ID=your_client_id_here
   CANVAS_DEPLOYMENT_ID=1
   ```

4. **Deploy LTI Tool**
   - Go to your course → Settings → Apps → + App
   - Configuration Type: "By Client ID"
   - Client ID: (paste your client ID)
   - Submit

---

### Moodle Setup

1. **Enable Web Services**
   - Site Administration → Advanced features
   - ✅ Enable web services
   - ✅ Enable REST protocol

2. **Create Service User**
   - Site Administration → Users → Add a new user
   - Username: `sangam_api`
   - Assign system role: Manager or create custom role with capabilities:
     - `webservice/rest:use`
     - `moodle/course:view`
     - `moodle/user:viewalldetails`
     - `mod/assign:grade`

3. **Create Web Service**
   - Site Administration → Server → Web services → External services
   - Add: "Sangam LMS Integration"
   - Add functions:
     - `core_course_get_courses`
     - `core_enrol_get_enrolled_users`
     - `mod_assign_get_assignments`
     - `mod_assign_save_grade`

4. **Generate Token**
   - Site Administration → Server → Web services → Manage tokens
   - Create token for user `sangam_api`
   - Service: "Sangam LMS Integration"
   - Copy token

5. **Enable LTI**
   - Site Administration → Plugins → Activity modules → External tool
   - Manage tools → Configure a tool manually
   - Tool name: "Sangam Video"
   - Tool URL: `https://your-domain.com/api/lms/lti/launch`
   - LTI version: LTI 1.3
   - Public key type: Keyset URL
   - Public keyset: `https://your-domain.com/.well-known/jwks.json`

6. **Environment Variables**
   ```bash
   MOODLE_BASE_URL=https://moodle.yourschool.edu
   MOODLE_TOKEN=your_web_service_token_here
   MOODLE_CLIENT_ID=your_lti_client_id_here
   MOODLE_DEPLOYMENT_ID=1
   ```

---

### Blackboard Setup

1. **Register Application**
   - Developer Portal: https://developer.blackboard.com
   - My Apps → Register Application
   - Application Name: "Sangam LMS Integration"
   - Description: "Video conferencing integration"
   - Domain: `your-domain.com`

2. **Configure OAuth**
   - Grant Type: Client Credentials
   - Copy Application ID and Secret

3. **Set Permissions**
   - Required scopes:
     - `read` - Read course and user data
     - `write` - Write grades
     - `delete` - (optional) Delete assignments

4. **Install on Blackboard**
   - System Admin → Integrations → REST API Integrations
   - Create Integration
   - Application ID: (paste your app ID)
   - Learn User: Administrator
   - End User Access: Yes
   - Authorized To Act As User: Service Default

5. **Environment Variables**
   ```bash
   BLACKBOARD_BASE_URL=https://blackboard.yourschool.edu
   BLACKBOARD_CLIENT_ID=your_application_id
   BLACKBOARD_CLIENT_SECRET=your_application_secret
   BLACKBOARD_DEPLOYMENT_ID=1
   ```

---

### Google Classroom Setup

1. **Create Google Cloud Project**
   - Go to: https://console.cloud.google.com
   - Create Project: "Sangam LMS Integration"

2. **Enable APIs**
   - APIs & Services → Enable APIs and Services
   - Search and enable:
     - Google Classroom API
     - Google People API (for user info)

3. **Create OAuth Credentials**
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs: `https://your-domain.com/api/auth/google/callback`
   - Copy Client ID and Client Secret

4. **Configure OAuth Consent**
   - OAuth consent screen
   - User type: Internal (for school) or External
   - App name: "Sangam Video Conferencing"
   - Scopes:
     - `https://www.googleapis.com/auth/classroom.courses.readonly`
     - `https://www.googleapis.com/auth/classroom.rosters.readonly`
     - `https://www.googleapis.com/auth/classroom.coursework.students`

5. **Get Refresh Token**
   - Use OAuth flow to authenticate and get refresh token
   - Store securely

6. **Environment Variables**
   ```bash
   GOOGLE_CLASSROOM_CLIENT_ID=your_client_id
   GOOGLE_CLASSROOM_CLIENT_SECRET=your_client_secret
   GOOGLE_CLASSROOM_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
   GOOGLE_CLASSROOM_REFRESH_TOKEN=your_refresh_token
   ```

---

## API Endpoints

### Roster Management

#### Sync Roster from LMS
```http
POST /api/lms/roster/sync
Content-Type: application/json

{
  "organizationId": "org-123",
  "courseId": "course-456",
  "platform": "canvas"
}

Response:
{
  "success": true,
  "studentsCount": 45,
  "instructorsCount": 2
}
```

#### Get Roster
```http
GET /api/lms/roster/:organizationId/:courseId

Response:
{
  "success": true,
  "roster": {
    "courseId": "course-456",
    "students": [...],
    "instructors": [...],
    "lastSync": "2025-10-02T10:30:00Z"
  }
}
```

#### Export Roster to CSV
```http
GET /api/lms/roster/:organizationId/:courseId/export

Response: CSV file download
```

### Grade Book Integration

#### Create Grade Column
```http
POST /api/lms/grades/column
Content-Type: application/json

{
  "organizationId": "org-123",
  "courseId": "course-456",
  "name": "Meeting Attendance",
  "description": "Attendance for weekly meetings",
  "pointsPossible": 100
}
```

#### Record Grade
```http
POST /api/lms/grades/record
Content-Type: application/json

{
  "organizationId": "org-123",
  "courseId": "course-456",
  "assignmentId": "asn_123",
  "studentId": "student-789",
  "score": 95,
  "scoreMaximum": 100,
  "gradedBy": "instructor-456"
}
```

#### Sync Grades to LMS
```http
POST /api/lms/grades/sync
Content-Type: application/json

{
  "organizationId": "org-123",
  "courseId": "course-456",
  "assignmentId": "asn_123",
  "platform": "canvas"
}

Response:
{
  "success": true,
  "synced": 45,
  "failed": 0
}
```

#### Sync Attendance as Grades
```http
POST /api/lms/grades/attendance
Content-Type: application/json

{
  "organizationId": "org-123",
  "courseId": "course-456",
  "meetingId": "meeting-789",
  "platform": "canvas"
}

Response:
{
  "success": true,
  "assignmentId": "col_123",
  "gradesRecorded": 45,
  "syncedToLMS": 45
}
```

### Assignment Management

#### Create Assignment
```http
POST /api/lms/assignments
Content-Type: application/json

{
  "organizationId": "org-123",
  "courseId": "course-456",
  "name": "Week 5 Discussion",
  "description": "Join the video discussion",
  "type": "meeting",
  "pointsPossible": 10,
  "dueAt": "2025-10-15T23:59:00Z",
  "meetingId": "meeting-789"
}
```

#### Get Course Assignments
```http
GET /api/lms/assignments/:organizationId/:courseId

Response:
{
  "success": true,
  "assignments": [...]
}
```

#### Sync Assignment to LMS
```http
POST /api/lms/assignments/:organizationId/:courseId/:assignmentId/sync
Content-Type: application/json

{
  "platform": "canvas"
}

Response:
{
  "success": true,
  "lmsAssignmentId": "123456",
  "lmsUrl": "https://canvas.school.edu/courses/456/assignments/123456"
}
```

---

## Usage Examples

### 1. Auto-Sync Roster on Meeting Creation

```javascript
// When instructor creates a meeting from LMS
app.post('/api/room/create', async (req, res) => {
  const { courseId, platform, organizationId } = req.body;

  // Sync roster first
  await lmsPlugin.syncRoster(organizationId, courseId, platform);

  // Create meeting
  const meeting = await createMeeting(req.body);

  res.json({ meeting });
});
```

### 2. Auto-Submit Attendance After Meeting

```javascript
// After meeting ends
async function onMeetingEnd(meetingId) {
  const meeting = await Meeting.findById(meetingId);

  if (meeting.lmsContext) {
    // Sync attendance as grades
    await gradeBookService.syncAttendanceAsGrades(
      meeting.organizationId,
      meeting.courseId,
      meetingId,
      attendanceReport,
      connector
    );

    console.log('✓ Attendance synced to LMS grade book');
  }
}
```

### 3. LTI Deep Linking Launch

```javascript
// Student clicks "Join Meeting" in Canvas
// Canvas sends LTI launch request to /api/lms/lti/launch

// LMS Plugin:
// 1. Validates LTI token
// 2. Finds/creates user
// 3. Checks roster enrollment
// 4. Creates/finds meeting
// 5. Redirects to meeting URL
```

---

## Attendance Grade Calculation

The system automatically calculates attendance grades based on:

| Factor | Weight | Calculation |
|--------|--------|-------------|
| Attendance Duration | 80% | `(attended / total) * 80` |
| Joined On Time | +5% | Joined within 5 minutes of start |
| Stayed Until End | +5% | Stayed within 5 minutes of end |

**Example:**
- Meeting Duration: 60 minutes
- Student attended: 55 minutes (91%)
- Joined on time: Yes (+5%)
- Stayed until end: Yes (+5%)
- **Final Grade: 96/100**

---

## Security Considerations

### 1. LTI Security
- ✅ JWT token validation with signature verification
- ✅ JWKS public key fetching and caching
- ✅ Nonce validation to prevent replay attacks
- ✅ Issuer and audience validation
- ✅ Timestamp validation (5-minute window)

### 2. API Authentication
- ✅ OAuth 2.0 for all platforms
- ✅ Secure token storage
- ✅ Token refresh mechanisms
- ✅ Rate limiting on API calls

### 3. Data Privacy
- ✅ Student data encrypted at rest
- ✅ PII handling compliance (FERPA)
- ✅ Minimal data storage
- ✅ Automatic data purging

---

## Troubleshooting

### Issue: LTI Launch Fails

**Symptoms**: "Invalid token" or "Signature verification failed"

**Solutions**:
1. Check JWKS endpoint is accessible
2. Verify LTI private/public key pair
3. Check clock synchronization (NTP)
4. Validate issuer and client ID match

### Issue: Roster Sync Fails

**Symptoms**: "Failed to get roster" or empty roster

**Solutions**:
1. Verify API credentials are correct
2. Check API user has proper permissions
3. Validate course ID exists in LMS
4. Check network connectivity to LMS

### Issue: Grade Sync Fails

**Symptoms**: "Failed to send grade" errors

**Solutions**:
1. Verify assignment exists in LMS
2. Check student is enrolled in course
3. Validate grade value is within bounds
4. Check API user has grading permissions

---

## Support

For LMS integration support:

1. **Check logs**: Look for detailed error messages in server logs
2. **Test connection**: Use `/api/lms/status` endpoint
3. **Verify license**: Ensure INSTITUTIONAL tier is active
4. **Contact support**: support@sangam.com with:
   - Platform name (Canvas, Moodle, etc.)
   - Error message
   - Course ID and organization ID
   - Server logs

---

## Roadmap

### Coming Soon
- [ ] Microsoft Teams LMS integration
- [ ] Schoology connector
- [ ] Canvas Commons integration
- [ ] Moodle Competency framework support
- [ ] Automated prerequisite checking
- [ ] Learning analytics dashboard
- [ ] Custom grade rubrics
- [ ] Peer review assignments

---

## License

LMS Integration Plugin for Sangam
Copyright © 2025 Sangam

This plugin is available exclusively for INSTITUTIONAL tier license holders.
Unauthorized use or distribution is prohibited.

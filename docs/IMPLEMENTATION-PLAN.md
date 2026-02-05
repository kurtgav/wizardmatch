# Wizard Match - Full Implementation Plan

## Overview
Complete implementation of the Wizard Match Valentine's 2026 campaign following the master workflow document.

## Timeline (February 5-14, 2026)
- **Feb 5**: Survey opens (Google sign-in)
- **Feb 10**: Survey closes at 11:59 PM
- **Feb 11-13**: Profile update period + early messaging
- **Feb 14**: Results revealed on Valentine's Day

---

## Phase 1: Database Schema Updates

### 1.1 New Tables to Add

#### Campaigns Table
```sql
-- backend-go/migrations/003_campaigns.sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    survey_open_date TIMESTAMP,
    survey_close_date TIMESTAMP,
    profile_update_start_date TIMESTAMP, -- Feb 11
    profile_update_end_date TIMESTAMP, -- Feb 13
    results_release_date TIMESTAMP, -- Feb 14
    is_active BOOLEAN DEFAULT TRUE,
    total_participants INTEGER DEFAULT 0,
    total_matches_generated INTEGER DEFAULT 0,
    algorithm_version VARCHAR(50),
    config JSON, -- Stores weights and other algorithm params
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Crush Lists Table
```sql
CREATE TABLE crush_lists (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    campaign_id UUID REFERENCES campaigns(id),
    crush_email VARCHAR(255),
    crush_name VARCHAR(200),
    is_matched BOOLEAN DEFAULT FALSE,
    is_mutual BOOLEAN DEFAULT FALSE,
    nudge_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Messages Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    match_id UUID REFERENCES matches(id),
    sender_id UUID REFERENCES users(id),
    recipient_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);
```

### 1.2 Updates to Existing Tables

#### Matches Table - Add Fields
- `campaign_id UUID REFERENCES campaigns(id)`
- `rank_for_a INTEGER` - Ranking for user A (1-7)
- `rank_for_b INTEGER` - Ranking for user B (1-7)
- `messaging_unlocked BOOLEAN DEFAULT FALSE` - For Feb 11-13

#### Users Table - Add Fields
- `seeking_gender VARCHAR(50)` - Gender preference
- `phone_number VARCHAR(20)` - Additional contact option
- `contact_preference VARCHAR(50)` - Preferred contact method
- `profile_visibility VARCHAR(20)` - "Public", "Matches Only", "Private"

---

## Phase 2: Backend API Implementation

### 2.1 Campaign Management API

#### New Routes: `/api/campaigns`
- `GET /api/campaigns/active` - Get current active campaign
- `POST /api/campaigns` - Create new campaign (admin)
- `PUT /api/campaigns/:id` - Update campaign (admin)
- `GET /api/campaigns/:id/stats` - Campaign statistics

#### Implementation: `backend-go/internal/handler/campaign.go`
```go
- Get active campaign with date checks
- Validate user actions based on campaign dates
- Handle profile update period (Feb 11-13)
- Handle results release (Feb 14)
```

### 2.2 Crush List API

#### New Routes: `/api/crush-list`
- `POST /api/crush-list` - Submit crush list (up to 10)
- `GET /api/crush-list` - Get user's crush list
- `PUT /api/crush-list` - Update crush list (before Feb 10)

#### Implementation: `backend-go/internal/handler/crush.go`
```go
- Validate crush list (max 10 entries)
- Look up crush emails by Google account email
- Mark mutual crushes when both parties list each other
- Send anonymous nudges: "Someone listed you as a crush!"
```

### 2.3 Enhanced Matching Algorithm

#### New Service: `backend-go/internal/service/matching/matching.go` (Enhanced)

**Key Changes:**
1. **Preference Pool Filtering**
   - Filter by `seeking_gender` preference
   - Filter by year preference (if specified)

2. **Crush List Bonus**
   - Mutual crush: +20% to score
   - One-way crush: +10% to score
   - Crush overrides minimum threshold

3. **Hungarian Algorithm Implementation**
   ```typescript
   import { linear_sum_assignment } from 'scipy-optimize';

   // Create compatibility matrix for each preference pool
   // Run Hungarian algorithm for optimal pairings
   // Generate 4-7 matches per user, ranked by score
   ```

4. **Category Weights (from master doc)**
   - Personality: 30%
   - Values & Beliefs: 25%
   - Lifestyle: 20%
   - Interests & Hobbies: 15%
   - Demographics: 10%

### 2.4 Messaging API (Feb 11-13)

#### New Routes: `/api/messages`
- `GET /api/messages/:matchId` - Get message thread
- `POST /api/messages/send` - Send message to match
- `PUT /api/messages/read` - Mark messages as read
- `GET /api/messages/unread-count/:userId` - Get unread count

#### Implementation: `backend-go/internal/handler/message.go`
```go
- Only allow messaging during profile update period (Feb 11-13)
- Validate both users are matched
- Real-time message delivery (WebSocket or polling)
- Mark messages as read when viewed
```

### 2.5 Profile Management API

#### Enhanced Routes: `/api/profile`
- `PUT /api/profile/:userId` - Update profile (bio, photo, contact info, visibility)
- Only allow profile updates during specific periods:
  - Before survey close: Full editing
  - Feb 11-13: Profile polishing (no survey changes)
  - After Feb 14: Read-only

---

## Phase 3: Frontend Implementation

### 3.1 Campaign-Aware Components

#### `frontend/src/components/campaign/CountdownTimer.tsx`
```typescript
// Shows countdown to next important date:
// - Survey close (Feb 10)
// - Profile update period (Feb 11-13)
// - Results release (Feb 14)
```

#### `frontend/src/components/campaign/CampaignBanner.tsx`
```typescript
// Displays current campaign phase:
// - "Survey is Open! 📝"
// - "Profile Update Period - Polish Your Profile ✨"
// - "Matches Revealed! 💕"
```

### 3.2 Crush List UI

#### `frontend/src/app/survey/crush-list/page.tsx`
```typescript
// Multi-step crush list form:
// - Up to 10 crushes
// - Input: Google email (optional: name)
// - Real-time validation (check if email is registered)
// - Show "Registered" indicator
// - Save & continue
```

### 3.3 Messaging UI (Feb 11-13)

#### `frontend/src/components/messaging/MessageThread.tsx`
```typescript
// Chat interface for matches:
// - Message history
// - Real-time updates (polling or WebSocket)
// - Typing indicator
// - Read receipts
// - Only visible during profile update period
```

#### `frontend/src/app/messages/page.tsx`
```typescript
// List of all matches with message previews:
// - Unread count badges
// - Click to open conversation
// - Sort by most recent message
```

### 3.4 Profile Editor (Feb 11-13)

#### `frontend/src/app/profile/edit/page.tsx`
```typescript
// Profile editing form:
// - Upload/change profile photo
// - Edit bio (500 char max)
// - Add/edit contact info (Instagram, phone, etc.)
// - Set visibility preferences
// - Save changes
// - Only editable during Feb 11-13
```

### 3.5 Enhanced Match Cards

#### `frontend/src/components/matches/MatchCard.tsx` (Enhanced)
```typescript
// Show additional info:
// - Rank (1-7)
// - Mutual crush indicator
// - Shared interests highlighted
// - Message button (Feb 11-13 only)
// - Contact info reveal
```

---

## Phase 4: Integration & Workflow

### 4.1 Survey Flow Updates

**Step 1: Authentication**
- Google OAuth as before
- Check if active campaign exists
- Redirect to survey or results

**Step 2: Survey Completion**
- Existing survey questions
- NEW: Crush list step (optional, up to 10)
- NEW: Contact preferences step

**Step 3: Submission**
- Submit survey responses
- Submit crush list
- Mark `survey_completed = true`
- Redirect to confirmation page

### 4.2 Date-Based State Management

#### Campaign Phase Enum
```typescript
enum CampaignPhase {
  PRE_LAUNCH = 'pre_launch',           // Before Feb 5
  SURVEY_OPEN = 'survey_open',         // Feb 5-10
  SURVEY_CLOSED = 'survey_closed',     // Feb 10-11
  PROFILE_UPDATE = 'profile_update',   // Feb 11-13
  RESULTS_RELEASED = 'results_released' // Feb 14+
}
```

#### Phase Checker
```typescript
function getCampaignPhase(campaign: Campaign): CampaignPhase {
  const now = new Date();
  if (now < campaign.survey_open_date) return CampaignPhase.PRE_LAUNCH;
  if (now < campaign.survey_close_date) return CampaignPhase.SURVEY_OPEN;
  if (now < campaign.profile_update_start_date) return CampaignPhase.SURVEY_CLOSED;
  if (now < campaign.results_release_date) return CampaignPhase.PROFILE_UPDATE;
  return CampaignPhase.RESULTS_RELEASED;
}
```

### 4.3 Permission Matrix

| Action | Pre-Launch | Survey Open | Survey Closed | Profile Update | Results |
|--------|------------|-------------|---------------|-----------------|---------|
| View Landing | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sign Up | ❌ | ✅ | ❌ | ❌ | ❌ |
| Take Survey | ❌ | ✅ | ❌ | ❌ | ❌ |
| Edit Survey | ❌ | ✅ | ❌ | ❌ | ❌ |
| Submit Crush List | ❌ | ✅ | ❌ | ❌ | ❌ |
| Edit Profile | ❌ | ✅ | ❌ | ✅ (limited) | ❌ |
| View Matches | ❌ | ❌ | ❌ | ✅ (early) | ✅ |
| Send Messages | ❌ | ❌ | ❌ | ✅ | ✅* |

*Optional: Keep messaging enabled after reveal

---

## Phase 5: Algorithm Enhancements

### 5.1 Question Category Updates

**Current Schema:**
- coreValues, lifestyle, personality, academic, fun

**New Categories (from master doc):**
```typescript
const CATEGORIES = {
  DEMOGRAPHICS: { weight: 0.10, questions: [...] },
  PERSONALITY: { weight: 0.30, questions: [...] },
  VALUES: { weight: 0.25, questions: [...] },
  LIFESTYLE: { weight: 0.20, questions: [...] },
  INTERESTS: { weight: 0.15, questions: [...] }
};
```

### 5.2 Enhanced Scoring Methods

```typescript
// Gaussian similarity for political views
function gaussianSimilarity(val1: number, val2: number, tolerance: number = 1.5): number {
  const diff = Math.abs(val1 - val2);
  return Math.exp(-(diff * diff) / (2 * tolerance * tolerance));
}

// Jaccard similarity for interests
function jaccardSimilarity(set1: string[], set2: string[]): number {
  const intersection = set1.filter(x => set2.includes(x));
  const union = [...new Set([...set1, ...set2])];
  return intersection.length / union.length;
}

// Inverse distance for lifestyle questions
function inverseDistance(val1: number, val2: number, max: number = 10): number {
  return 1 - Math.abs(val1 - val2) / max;
}
```

### 5.3 Hungarian Algorithm Implementation

```typescript
import { linear_sum_assignment } from 'scipy-optimize';

async function generateOptimalMatches(users: User[]): Promise<Match[]> {
  // Separate users into preference pools
  const pools = separateByPreferences(users);

  const allMatches: Match[] = [];

  for (const pool of pools) {
    // Create compatibility matrix
    const matrix = createCompatibilityMatrix(pool);

    // Run Hungarian algorithm
    const [rowInd, colInd] = linear_sum_assignment(-matrix); // Negative for max

    // Create matches from assignment
    for (let i = 0; i < rowInd.length; i++) {
      const userA = pool[rowInd[i]];
      const userB = pool[colInd[i]];
      const score = matrix[rowInd[i]][colInd[i]];

      allMatches.push({
        user1Id: userA.id,
        user2Id: userB.id,
        compatibilityScore: score,
        // ... other fields
      });
    }
  }

  return allMatches;
}
```

---

## Phase 6: Email Notifications

### 6.1 Email Templates

#### Template 1: Survey Confirmation
```
Subject: You're in! 🎉 Your Wizard Match survey is complete

Body:
Thanks for completing the Wizard Match survey!

Your responses have been saved. You can edit them until February 10 at 11:59 PM.

What happens next:
• February 11-13: Polish your profile and start chatting early
• February 14: Your matches will be revealed! 💕

Stay tuned!
```

#### Template 2: Profile Update Period
```
Subject: Your matches are ready! Start chatting early ✨

Body:
Great news! We've found your matches and unlocked them early.

You can now:
• Update your profile photo and bio
• Add contact info you're comfortable sharing
• Start messaging your matches before Valentine's Day!

Full reveal happens February 14th. Get ready to meet your matches! 💕
```

#### Template 3: Valentine's Day Reveal
```
Subject: Your Valentine's matches are here! 💕

Body:
Happy Valentine's Day!

Your Wizard Match results are ready! Log in to see your 4-7 compatible matches.

[View Matches Button]

Good luck! May this Valentine's be magical! 🪄✨
```

#### Template 4: Crush Nudge
```
Subject: Someone has a crush on you! 😊

Body:
Hey there!

Someone listed you as their crush in Wizard Match! Want to see if you're a match?

Complete your survey by February 10 to find out! 💕

[Take Survey Button]
```

---

## Phase 7: Admin Features

### 7.1 Campaign Dashboard

#### `frontend/src/app/admin/campaigns/page.tsx`
```typescript
// Campaign management interface:
// - Create new campaign
// - Set dates (survey open/close, profile update, results)
// - Configure algorithm weights
// - View campaign stats
// - Trigger manual algorithm run
```

### 7.2 Algorithm Monitoring

```typescript
// Real-time algorithm execution stats:
// - Progress percentage
// - Current phase (preprocessing, scoring, matching)
// - Estimated time remaining
// - Error/warning logs
```

---

## Phase 8: Testing & Deployment

### 8.1 Testing Checklist

- [ ] Campaign date transitions work correctly
- [ ] Crush list submission and lookup works
- [ ] Mutual crush detection and bonus applied
- [ ] Hungarian algorithm produces optimal matches
- [ ] Profile editing restricted to correct periods
- [ ] Messaging only enabled during Feb 11-13
- [ ] Matches revealed on Feb 14
- [ ] Email notifications sent at correct times
- [ ] Mobile responsiveness verified
- [ ] Load testing for high traffic periods

### 8.2 Deployment Checklist

- [ ] Database migrations run successfully (Goose)
- [ ] Environment variables configured
- [ ] Email templates loaded
- [ ] Campaign created with correct dates
- [ ] Algorithm tested with sample data
- [ ] Monitoring and logging enabled
- [ ] Error tracking configured (Sentry)
- [ ] Backup plan in place

---

## Implementation Order

### Priority 1: Foundation (Week 1)
1. Database schema updates (Goose migrations)
2. Campaign model and basic API
3. Crush list model and API
4. Messages model and API

### Priority 2: Core Features (Week 2)
5. Enhanced matching algorithm with crush bonuses
6. Preference pool filtering
7. Survey integration with crush list
8. Campaign-aware permissions

### Priority 3: UI Components (Week 2-3)
9. Countdown timer component
10. Campaign banners
11. Crush list UI
12. Profile editor (Feb 11-13)
13. Messaging interface

### Priority 4: Polish & Testing (Week 3-4)
14. Email notification system
15. Admin dashboard
16. End-to-end testing
17. Performance optimization
18. Documentation

---

## Summary

This plan implements the complete Wizard Match workflow including:

✅ Campaign system with date-based phases
✅ Crush list with mutual detection and bonus
✅ Enhanced matching algorithm (Hungarian + preference pools)
✅ Profile update period (Feb 11-13)
✅ Early messaging system
✅ Email notifications
✅ Admin tools

All following the February 5-14, 2026 timeline from the master workflow document.

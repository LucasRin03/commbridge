# CommBridge — Technical Architecture Plan

**Project:** CommBridge Online Communication Practice Platform  
**For:** SPD Specialised Assistive Technology Centre (SATC)  
**Version:** 1.0 | March 2026

---

## 1. System Overview

CommBridge is a browser-based, real-time communication practice platform that enables AAC and AT users to practise communication skills through online sessions with peers, therapists, and caregivers.

The architecture is designed around three core requirements:
- **Real-time communication** — low-latency messaging between users in shared sessions
- **Accessibility-first** — full compatibility with switch access, eye-gaze, AAC apps, and symbol boards
- **Data safety** — strict protection for a vulnerable user population, PDPA compliant

---

## 2. Architecture Diagram (Text)

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                │
│  React.js + Next.js App                                   │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────────┐  │
│  │  AAC Board  │ │  Chat/Video  │ │  Therapist Panel  │  │
│  │  Component  │ │  Interface   │ │  Dashboard        │  │
│  └─────────────┘ └──────────────┘ └───────────────────┘  │
│  Accessibility: WCAG 2.1 AA | Switch | Eye-gaze | Touch   │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTPS / WSS
┌──────────────────────▼───────────────────────────────────┐
│                   APPLICATION LAYER                        │
│  Node.js + Express REST API                               │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────────┐  │
│  │  Socket.io  │ │  Session     │ │  AI Engine        │  │
│  │  RT Server  │ │  Manager     │ │  (Claude API)     │  │
│  └─────────────┘ └──────────────┘ └───────────────────┘  │
│  ┌─────────────┐ ┌──────────────┐                        │
│  │  Auth/RBAC  │ │  Media       │                        │
│  │  (JWT)      │ │  Handler     │                        │
│  └─────────────┘ └──────────────┘                        │
└──────────────────────┬───────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────┐
│                     DATA LAYER                             │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────────┐  │
│  │ PostgreSQL  │ │   Redis      │ │    AWS S3         │  │
│  │ Users,      │ │ Session      │ │ Symbols, media,   │  │
│  │ Sessions,   │ │ state cache  │ │ session assets    │  │
│  │ Progress    │ │              │ │                   │  │
│  └─────────────┘ └──────────────┘ └───────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Frontend

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | React.js + Next.js 14 | Component reusability, SSR for fast load, large ecosystem |
| AAC Board | Custom React component | Tailored for AAC symbol grid, switch-access compatible |
| Real-time client | Socket.io-client | Matches backend, handles reconnection gracefully |
| Styling | Tailwind CSS | Utility-first, consistent accessible design tokens |
| Accessibility | WCAG 2.1 AA | Mandatory for AT users; audited with axe-core |
| Symbol library | ARASAAC (open-source) | Free, widely used in AAC community |
| State management | Zustand | Lightweight, suitable for session/message state |

### 3.2 Backend

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Runtime | Node.js 20 LTS | Non-blocking I/O ideal for real-time apps |
| Framework | Express.js | Minimal, flexible REST API server |
| Real-time | Socket.io 4 | Reliable WebSocket layer with fallback to polling |
| Authentication | JWT + bcrypt | Stateless auth, role-based (user/therapist/admin) |
| AI Engine | Claude API (Anthropic) | Contextual conversation partner for solo practice |
| Session Logic | Custom module | Scenario state, participant management, turn-taking |
| Validation | Zod | Runtime type safety for API requests |

### 3.3 Data Layer

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Primary DB | PostgreSQL 15 | Relational data, ACID compliance, session history |
| Cache | Redis 7 | Real-time session state, sub-millisecond read |
| Object storage | AWS S3 | Scalable symbol images, optional session recordings |
| ORM | Prisma | Type-safe DB queries, schema migration support |
| Backups | AWS RDS automated | Daily snapshots, 30-day retention |

### 3.4 Infrastructure

| Component | Technology |
|-----------|-----------|
| Hosting | AWS EC2 / Render.com (for MVP) |
| CDN | CloudFront (symbol assets) |
| SSL | Let's Encrypt / AWS ACM |
| CI/CD | GitHub Actions |
| Monitoring | Sentry (errors) + Uptime Robot |
| Logs | AWS CloudWatch |

---

## 4. Key System Flows

### 4.1 User Login & Session Start

```
User → Browser → POST /auth/login
         ↓ JWT issued
User joins session → Socket.io event: join_room
         ↓
Server: validates JWT, adds user to room, broadcasts presence
         ↓
All participants receive: user_joined event
Session scenario state synced via Redis
```

### 4.2 AAC Message Flow

```
User taps symbols → Compose message → Press Send
         ↓
Socket.io event: send_message { roomId, userId, content, symbols[] }
         ↓
Server: validates, stores in PostgreSQL (session log)
         ↓
Broadcast to room participants → All clients receive message
         ↓
(Optional) Therapist panel shows message + timestamp
```

### 4.3 AI Solo Practice Flow

```
User selects Solo Practice
         ↓
Backend creates AI session context (scenario + user level)
         ↓
User message → POST /ai/respond { sessionId, message }
         ↓
Claude API called with: system prompt (scenario role) + conversation history
         ↓
AI response returned → Displayed as conversation partner turn
         ↓
Session logged for therapist review
```

---

## 5. Database Schema (Core Tables)

### users
```sql
id          UUID PRIMARY KEY
name        TEXT NOT NULL
role        ENUM('user', 'therapist', 'caregiver', 'admin')
dob         DATE  -- for minor vs adult data separation
created_at  TIMESTAMP
```

### sessions
```sql
id          UUID PRIMARY KEY
scenario_id INTEGER REFERENCES scenarios(id)
host_id     UUID REFERENCES users(id)
mode        ENUM('peer', 'guided', 'solo', 'caregiver')
started_at  TIMESTAMP
ended_at    TIMESTAMP
status      ENUM('active', 'completed', 'cancelled')
```

### messages
```sql
id          UUID PRIMARY KEY
session_id  UUID REFERENCES sessions(id)
sender_id   UUID REFERENCES users(id)
content     TEXT
symbols     JSONB   -- array of symbol ids used
sent_at     TIMESTAMP
```

### scenarios
```sql
id          INTEGER PRIMARY KEY
title       TEXT
icon        TEXT
difficulty  ENUM('beginner', 'intermediate', 'advanced')
prompts     JSONB   -- array of starter prompts
```

### progress
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES users(id)
scenario_id INTEGER REFERENCES scenarios(id)
sessions_completed  INTEGER
last_session_at     TIMESTAMP
therapist_notes     TEXT
```

---

## 6. Accessibility Architecture

### 6.1 Switch Access Support
- All interactive elements reachable via keyboard Tab/Space/Enter
- Custom scanning mode: highlight cycles through AAC grid at configurable speed
- No time-limited interactions by default; all timers are configurable

### 6.2 AAC Symbol Board
- Symbols stored as SVGs from ARASAAC (CC BY-NC-SA 4.0)
- Grid layout configurable: 2×2 up to 6×5 depending on user preference
- Symbol categories: Core vocabulary, Scenario-specific, Social phrases
- All symbols include alt text for screen readers

### 6.3 Visual Accessibility
- WCAG 2.1 AA contrast ratios enforced via design tokens
- High-contrast theme toggle available
- Font size adjustable (14px–24px) without layout breakage
- No critical information conveyed by colour alone

### 6.4 Motor Access
- Large tap targets (minimum 44×44px) per WCAG 2.5.5
- Dwell-click support for eye-gaze users (configurable dwell time)
- No hover-only interactions

---

## 7. Security & Privacy Design

### 7.1 Data Classification

| Data Type | Classification | Handling |
|-----------|---------------|----------|
| User identity (name, DOB) | Sensitive | Encrypted at rest, access-logged |
| Session chat logs | Sensitive | Stored only with explicit consent |
| Session recordings (audio/video) | Highly Sensitive | Opt-in only, therapist approval required |
| Progress/analytics | Internal | Aggregated, no PII in reports |
| Symbol usage data | Anonymous | Used for UX improvement |

### 7.2 Authentication & Authorisation

- JWT tokens expire in 8 hours; refresh tokens in 30 days
- Role-based access control (RBAC): users can only access own sessions; therapists can access assigned clients; admins have full access
- All API endpoints require authentication except `/auth/login`
- Rate limiting: 100 requests/min per user to prevent abuse

### 7.3 PDPA Compliance (Singapore)

- Data minimisation: only collect what is required for the platform
- Purpose limitation: data not used for any purpose beyond clinical support
- Consent collected at registration; separate consent for session logging
- Data deletion: users (or caregivers for minors) can request full account deletion
- Breach notification procedure documented and tested

---

## 8. Development & Deployment

### 8.1 Repository Structure

```
commbridge/
├── apps/
│   ├── web/           # Next.js frontend
│   └── api/           # Node.js backend
├── packages/
│   ├── ui/            # Shared component library
│   ├── aac-board/     # AAC symbol board component
│   └── types/         # Shared TypeScript types
├── infra/
│   └── docker/        # Docker Compose for local dev
└── docs/
    └── api/           # API documentation
```

### 8.2 Development Environment

```bash
# Local setup
git clone https://github.com/[team]/commbridge
cd commbridge
docker-compose up -d   # PostgreSQL + Redis
npm install
npm run dev            # Starts web + api concurrently
```

### 8.3 CI/CD Pipeline

```
Push to main branch
    ↓
GitHub Actions: lint → test → build
    ↓
Docker image built and pushed to ECR
    ↓
Render / AWS EC2 auto-deploys new image
    ↓
Smoke tests run against staging
    ↓
Manual approval → Production deploy
```

---

## 9. Scalability Considerations

For the school project MVP, a single-server deployment is sufficient. For future production scaling:

- **Horizontal scaling**: Socket.io rooms can be distributed using Redis Pub/Sub adapter
- **CDN**: Symbol assets (static) served via CloudFront with long cache TTL
- **Database read replicas**: PostgreSQL read replicas for session history queries
- **Session partitioning**: Active sessions kept in Redis; archived to PostgreSQL after completion
- **Estimated MVP capacity**: 50 concurrent sessions on a single $10/mo Render instance

---

## 10. Known Constraints & Mitigations

| Constraint | Risk | Mitigation |
|-----------|------|-----------|
| No WebRTC in MVP | No video/audio | Text + symbol messaging sufficient for Phase 1 |
| Claude API cost | Per-token billing | Rate-limit solo practice sessions; cache common responses |
| ARASAAC licensing | NC licence | Platform must be non-commercial; check with SPD |
| Minor user data | PDPA sensitivity | Separate DB schemas; therapist/parent consent required |
| Real device testing | Limited AAC devices in dev | Use browser-based switch emulator; test with SATC devices |

---

*Document maintained by: CommBridge Project Team*  
*Next review: Post Week 4 development sprint*

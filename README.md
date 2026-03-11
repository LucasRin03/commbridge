# CommBridge 🌉

**Online Communication Practice Platform for AAC & AT Users**

> *Bridging the gap between therapy and everyday life.*

Built in partnership with **SPD Specialised Assistive Technology Centre (SATC)** as part of an NUS School Project (2026).

---

## 🎯 Problem Statement

Many individuals with communication difficulties — including those who use Augmentative and Alternative Communication (AAC) or other Assistive Technologies (AT) — have limited opportunities to practise real-world communication skills. Going into the community is challenging due to safety, supervision, time, and accessibility constraints.

**How might we design technology-enabled solutions that allow users to practise real-world communication skills in everyday scenarios, in ways that are interactive, motivating, and relevant to their daily lives?**

— *SPD SATC Problem Statement*

---

## 💡 Our Solution

CommBridge is a browser-based platform where AAC & AT users can:

- 🗣 **Practise role-play scenarios** (hawker centre, grocery shopping, clinic visit, public transport)
- 👥 **Connect with peers** for real-time peer-to-peer communication practice
- 👩‍⚕️ **Join therapist-guided sessions** with live support and session logging
- 🤖 **Use solo AI practice mode** with an adaptive conversation partner
- 📈 **Track progress** and build confidence towards real-world independence

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **AAC Symbol Board** | Tap-to-compose with symbol grid, compatible with switch access & eye-gaze |
| **Real-Time Chat** | Socket.io powered live sessions between multiple participants |
| **Role-Play Scenarios** | 6+ everyday scenarios with contextual prompts and adaptive difficulty |
| **Therapist Dashboard** | Session hosting, participant monitoring, live feedback tools |
| **Accessibility First** | WCAG 2.1 AA, keyboard nav, switch access, high-contrast mode |
| **AI Practice Partner** | Solo mode powered by Claude API for pressure-free practice |

---

## 🏗 Tech Stack

```
Frontend:   React.js + Next.js 14, Tailwind CSS, Socket.io-client
Backend:    Node.js + Express, Socket.io, Claude API (Anthropic)
Database:   PostgreSQL + Redis (session cache)
Storage:    AWS S3 (symbol assets)
Auth:       JWT + Role-Based Access Control
Symbols:    ARASAAC (open-source AAC symbol library)
Hosting:    AWS / Render
```

---

## 📁 Project Structure

```
commbridge/
├── public/
│   └── index.html          # Interactive prototype demo
├── src/
│   ├── components/
│   │   ├── AACBoard.jsx    # Symbol board component
│   │   ├── ChatPanel.jsx   # Real-time chat interface
│   │   ├── ScenarioCard.jsx
│   │   └── TherapistPanel.jsx
│   ├── pages/
│   │   ├── index.jsx       # Landing / role selection
│   │   ├── dashboard.jsx   # User dashboard
│   │   ├── scenario.jsx    # Scenario lobby
│   │   └── practice.jsx    # Live practice room
│   └── styles/
│       └── globals.css
├── server/
│   ├── index.js            # Express + Socket.io server
│   ├── routes/
│   │   ├── auth.js
│   │   ├── sessions.js
│   │   └── ai.js           # Claude API integration
│   └── db/
│       └── schema.sql      # PostgreSQL schema
├── docs/
│   ├── CommBridge_Proposal.docx
│   ├── CommBridge_Architecture.md
│   └── CommBridge_Presentation.pptx
├── package.json
├── .env.example
└── README.md
```

---

## 🚀 Getting Started (Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/commbridge.git
cd commbridge

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys

# Set up database
psql -U postgres -f server/db/schema.sql

# Start development server
npm run dev
```

### Quick Demo (Prototype only)
Open `public/index.html` directly in any browser — no installation required.

---

## 🗓 Project Roadmap

| Phase | Timeline | Focus |
|-------|----------|-------|
| Discovery & Design | Week 1–2 | User interviews, wireframes, accessibility audit |
| Core Development | Week 3–4 | Real-time chat, AAC board, scenario engine |
| Testing & Iteration | Week 5–6 | User testing with SATC clients, accessibility QA |
| Pilot & Handover | Week 7+ | SATC pilot, documentation, SPD presentation |

---

## 👥 Target Users

- **AAC Users** (children & adults) — primary beneficiaries
- **Speech-Language Therapists** — session hosts & clinical support
- **Caregivers & Family** — home practice partners
- **Teachers & Support Staff** — classroom-based facilitation

---

## ♿ Accessibility

CommBridge is built accessibility-first:
- WCAG 2.1 Level AA compliance
- Switch access & scanning navigation
- Eye-gaze compatible (dwell-click)
- Screen reader support (ARIA labels)
- High-contrast & large-text themes
- ARASAAC symbol library integration

---

## 🔒 Privacy & Data

- PDPA (Singapore) compliant
- Separate data environments for minors and adults
- Session recording is opt-in only, with therapist approval
- Users can request full account deletion at any time

---

## 📄 Documentation

- [`docs/CommBridge_Architecture.md`](docs/CommBridge_Architecture.md) — Full technical architecture
- [`docs/CommBridge_Proposal.docx`](docs/CommBridge_Proposal.docx) — Project proposal
- [`docs/CommBridge_Presentation.pptx`](docs/CommBridge_Presentation.pptx) — Slide deck

---

## 🤝 Acknowledgements

- **SPD Specialised Assistive Technology Centre (SATC)** — Problem statement & domain expertise
- **ARASAAC** — Open-source AAC symbol library
- **Anthropic Claude API** — AI conversation partner engine
- NUS School of Computing — Academic supervision

---

## 📬 Contact

Built by the CommBridge NUS Project Team, 2026.  
For queries, contact via SPD SATC.

---

*"Every conversation is a step toward independence."*

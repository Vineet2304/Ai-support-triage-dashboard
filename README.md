# Branch Messaging & Intelligent Triage System

When I read the prompt, I didn't just want to build a simple chat interface.  
I wanted to build a **Support Engine** that helps agents work smarter, not harder.

My solution acts as an **AI Co-Pilot** — it automatically analyzes incoming messages for **urgency**, **sentiment**, and **intent** so agents can focus on the most critical issues first.

## 🚀 Key Features

### 1. Intelligent Triage (NLP)

The core differentiator is the analysis engine — it doesn't just store text; it **understands** it.

- **Urgency Scoring (0–10):** Scans for high-priority keywords (e.g., "rejected", "emergency", "disburse") and dynamically boosts score
- **Sentiment Analysis:** Detects frustration/anger → "Negative" tag + automatic urgency spike
- **Auto-Tagging:** Labels messages with topics like `Loan Query`, `Repayment`, `Tech Support`, `Urgent`, etc.

### 2. Real-Time Architecture

- Built with **WebSockets (Socket.IO)**
- Agents see new messages, urgency updates, and sentiment tags **instantly** — no page refresh required

### 3. Agent Efficiency Tools

- **Customer Context:** Mocked 360° view showing Credit Score, account status, etc., right next to the chat
- **Canned Responses:** Dropdown to insert common replies quickly

## 🛠 Tech Stack & Architecture

Chosen for speed, simplicity, and scalability:

- **Frontend:** React (Vite) + Tailwind CSS  
  → Rapid, responsive 3-column dashboard layout
- **Backend:** Python (Flask) + Flask-SocketIO + eventlet  
  → Lightweight, efficient async WebSocket handling
- **Database:** SQLite (SQLAlchemy)  
  → Auto-seeds from CSV on every restart (perfect for ephemeral Render environment)
- **NLP:** TextBlob (sentiment) + custom keyword rules (urgency & tags)  
  → Fast, no external LLM API latency/cost

### System Architecture

```mermaid
graph LR
    subgraph Client ["Client Layer"]
        Agent["👨‍💻 Agent Dashboard<br/>(React + Tailwind)"]
        Customer["👤 Customer / API<br/>(Curl / Postman)"]
    end
    subgraph Backend ["Backend Service"]
        API["⚡ Flask API Routes"]
        Socket["🔌 Socket.IO Manager"]
        Analyzer["🧠 NLP Analyzer<br/>(TextBlob + Keywords)"]
        DB[("📂 SQLite DB")]
    end

    Customer -- "POST /api/messages" --> API
    API -- "Analyze" --> Analyzer
    Analyzer -- "Score + Tags" --> API
    API -- "Save" --> DB
    API -- "New Message" --> Socket
    Socket -- "Push Update" --> Agent

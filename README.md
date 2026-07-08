# SnapML

SnapML is an **AI-First Machine Learning Platform** that acts as your autonomous ML Engineer. Upload a dataset, tell SnapML what you want to predict, and watch it build, train, evaluate, and deploy production-ready models—all from a single conversational interface.

![SnapML Logo](./public/snapml-logo.png)

## 🚀 Features

- **Conversational Interface:** No complex ML workflows. Just chat with your AI engineer.
- **Multi-Agent Architecture:** Specialized AI agents handle specific pipeline stages:
  - 🔵 **Data Engineer:** Cleans, deduplicates, and handles outliers.
  - 🟡 **Feature Engineer:** Encodes, scales, and selects important features.
  - 🟣 **ML Trainer:** Trains multiple models (XGBoost, Random Forest, LightGBM, etc.) in parallel.
  - 🟢 **Evaluator:** Cross-validates, ranks, and selects the champion model.
- **Proactive AI:** Automatically detects issues like missing values and class imbalances, and fixes them on the fly.
- **AI Explainability:** Understand *why* the champion model was selected with plain-English insights.
- **One-Click Reports:** Automatically generates and downloads detailed PDF/HTML executive summaries.
- **AI Memory:** Remembers your past projects, preferences, and results across sessions.

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React, Tailwind CSS, Framer Motion
- **UI Components:** Lucide React, Radix UI (via shadcn/ui)
- **AI Integration:** Groq API (Llama 3.3 70B)
- **Styling:** Premium glassmorphism aesthetics, dynamic animations

## ⚙️ Getting Started

To run SnapML locally, you will need Node.js (v18+) and a [Groq API Key](https://console.groq.com/keys). Run the following commands in your terminal to clone, configure, and start the app:

```bash
# 1. Clone the repository and install dependencies
git clone https://github.com/yourusername/snapml.git
cd snapml
npm install

# 2. Securely configure your environment
cp .env.example .env
# Edit .env and add: GROQ_API_KEY=your_groq_api_key_here
# Note: Ensure your .env file is never committed; the project is configured to safely ignore it.

# 3. Start the development server
npm run dev

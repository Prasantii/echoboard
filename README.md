# EchoBoard

EchoBoard is a customer feedback intelligence dashboard. It brings feedback from different channels into one place, uses AI to turn each entry into structured insights, and helps product teams identify trends and urgent issues.

## What it does

- Securely sign in and create an account with Supabase Authentication.
- Add feedback individually or import it from CSV, XLS, or XLSX files.
- Analyze feedback with AI to identify:
  - Bug or feature categories
  - Sentiment scores from 0 to 10
  - Concise summaries
  - Relevant tags
  - Low, medium, or high urgency
- View an overview of total feedback, average sentiment, and critical issues.
- Explore sentiment trends and feedback categories in dashboard charts.
- Receive newly added feedback through realtime updates.
- Export feedback insights as a PDF report.

## Tech stack

- [Next.js](https://nextjs.org/) with the App Router
- React and TypeScript
- [Supabase](https://supabase.com/) for authentication, database access, and realtime updates
- Groq's OpenAI-compatible API for AI analysis
- Tailwind CSS and shadcn/ui components
- Recharts for data visualization

## Getting started

### Prerequisites

- Node.js 20 or later
- A Supabase project
- A Groq API key

### Installation

Install the dependencies:

```bash
npm install
```

Create a `.env.local` file with the credentials for your Supabase project and Groq:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GROQ_API_KEY=your-groq-api-key
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

```bash
npm run dev    # Start the development server
npm run build  # Create a production build
npm run start  # Start the production server
npm run lint   # Run ESLint
```

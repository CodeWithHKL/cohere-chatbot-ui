# UNITEN Chatbot

A concept AI chatbot for **Universiti Tenaga Nasional (UNITEN)**, Malaysia. Ask about the university and get short, markdown-formatted answers. Built with Next.js and Cohere, deployed on Vercel.

> Unofficial concept project. Not affiliated with or endorsed by UNITEN. Answers are AI-generated and may be inaccurate.

## Features

- Chat with conversation memory (the last 10 messages are sent with each request)
- Markdown rendering for replies (bold, lists, links)
- UNITEN red theme with a lightning doodle background, light and dark mode following the system setting
- Responsive layout with a collapsible sidebar
- Input validation (400 character limit) and a maintenance switch for the API

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) and React 19 with the React Compiler
- [Tailwind CSS](https://tailwindcss.com) 4
- [Cohere](https://cohere.com) `command-r7b-12-2024` via the `cohere-ai` SDK
- [react-markdown](https://github.com/remarkjs/react-markdown), [lucide-react](https://lucide.dev)

## Getting started

```bash
npm install
```

Create `.env.local`:

```env
COHERE_API_KEY=your_cohere_api_key
```

Then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `COHERE_API_KEY` | Yes | Cohere API key used by `/api/chat`. |
| `TURNSTILE_SITE_KEY` | Yes | Cloudflare Turnstile site key. `proxy.ts` gates the whole site (pages and `/api/chat`) behind a Turnstile challenge and returns 500 if the keys are missing. |
| `TURNSTILE_SECRET_KEY` | Yes | Cloudflare Turnstile secret key. Also used to sign the 12-hour `ts_pass` cookie. |
| `MAINTENANCE_MODE` | No | Set to `true` to make `/api/chat` return 503. Redeploy after changing it. |

## How it works

The server is stateless. The browser keeps the conversation and sends the latest message plus up to 10 previous messages to `POST /api/chat`. The route validates the input, adds a UNITEN-focused system prompt, calls Cohere and returns `{ reply }`. Nothing is stored by this app.

Key files:

- `app/page.tsx` – chat UI
- `app/api/chat/route.ts` – Cohere API route
- `components/ChatSidebar.tsx`, `components/BrandMark.tsx` – sidebar and logo
- `app/globals.css` – theme colours and the doodle background

## Deploying to Vercel

1. Import the repository in Vercel (the Next.js preset is detected automatically).
2. Add `COHERE_API_KEY` under **Settings → Environment Variables**.
3. Deploy. The route sets `maxDuration = 30`, which fits the free plan.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |

## Credits

A concept project by [HKL](https://github.com/CodeWithHKL).

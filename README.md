# JobBrowser - Job Aggregator MVP

A modern web application for browsing and aggregating job listings from multiple sources.

Launch steps for the owner (database, Vercel env, affiliate keys, domain) are in [LAUNCH.md](LAUNCH.md).

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Package Manager**: npm
- **Node.js**: ≥18.17

## Prerequisites

- Node.js 18.17 or higher
- npm 9 or higher

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Configure required API keys and secrets in `.env.local`

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Mail uses the Resend HTTP API (`RESEND_API_KEY`, `EMAIL_FROM`). If the key is unset, messages are logged and not sent. The public site has a contact form and does not publish an owner address. `ADMIN_EMAIL` is server-only and is used for admin sign-in and optional form notifications.

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

### Linting

Run ESLint:

```bash
npm run lint
```

### Build

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

```
.
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── page.tsx           # Home page (to be created)
├── components/            # Reusable React components
├── public/                # Static assets
├── .env.example          # Environment variables template
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## Naming Conventions

- **Files/Folders**: kebab-case (e.g., `job-card.tsx`)
- **Variables/Functions**: camelCase (e.g., `jobTitle`)
- **React Components**: PascalCase (e.g., `JobCard.tsx`)

## Environment Variables

See `.env.example` for all available environment variables.

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Configuration is managed via `vercel.json`.

## License

Private - Proprietary

# Lumeron

A Next.js-based e-commerce platform for selling rave-themed stickers with AI-generated designs, integrated with Printify, Etsy, and Amazon.

## Features

- **Public Storefront**: Browse and view custom rave sticker products
- **Admin Dashboard**: Upload designs, generate AI art, manage listings, and view analytics
- **Multi-Channel Publishing**: Publish products to Etsy and Amazon
- **Print-on-Demand**: Integration with Printify for fulfillment
- **Sales Analytics**: Track revenue by channel and top-performing products

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + DaisyUI
- **Database**: SQLite via Prisma ORM
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Lumeron
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your admin password:
```env
ADMIN_PASSWORD="your-secure-password"
DATABASE_URL="file:./prisma/dev.db"
```

4. Initialize the database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### First-Time Setup

1. Navigate to `/login` and enter your admin password
2. Go to `/admin` to access the dashboard
3. Use the Upload tab to add your first sticker design
4. Configure API keys for Printify, Etsy, and Amazon in `.env` as needed

## Project Structure

```
Lumeron/
├── app/                      # Next.js app directory
│   ├── (site)/              # Public storefront pages
│   ├── (admin)/             # Admin dashboard
│   ├── api/                 # API routes
│   │   ├── admin/           # Admin operations
│   │   └── webhooks/        # Integration webhooks
│   └── login/               # Authentication
├── components/              # React components
├── lib/                     # Utilities and integrations
│   ├── db.ts               # Prisma client
│   ├── schema.ts           # Zod validation schemas
│   ├── auth.ts             # Authentication helpers
│   ├── storage.ts          # File storage
│   ├── printify.ts         # Printify integration
│   ├── etsy.ts             # Etsy integration
│   ├── amazon.ts           # Amazon SP-API integration
│   └── analytics.ts        # Analytics queries
├── prisma/                  # Database schema
└── styles/                  # Global styles

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push Prisma schema to database
- `npm run db:studio` - Open Prisma Studio GUI
- `npm run db:generate` - Generate Prisma client

## API Integration Setup

### Printify

1. Get API key from [Printify](https://printify.com)
2. Add to `.env`:
```env
PRINTIFY_API_KEY="your-api-key"
```

### Etsy

1. Create an app at [Etsy Developers](https://www.etsy.com/developers)
2. Set up OAuth credentials
3. Add to `.env`:
```env
ETSY_CLIENT_ID="your-client-id"
ETSY_CLIENT_SECRET="your-client-secret"
ETSY_ACCESS_TOKEN="your-access-token"
```

### Amazon SP-API

1. Register as an Amazon SP-API developer
2. Create an app and get credentials
3. Add to `.env`:
```env
AMAZON_CLIENT_ID="your-client-id"
AMAZON_CLIENT_SECRET="your-client-secret"
SPAPI_REFRESH_TOKEN="your-refresh-token"
```

## Deployment

This project can be deployed to Vercel, Netlify, or any Node.js hosting platform.

### Vercel Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Set environment variables in Vercel dashboard

Note: For production, consider using PostgreSQL instead of SQLite by updating the Prisma schema and DATABASE_URL.

## License

MIT

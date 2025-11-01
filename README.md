# SQL Agent

A Next.js application that provides an AI-powered SQL agent interface. Chat with the AI assistant to interact with your database using natural language queries.

## Features

- 🤖 **AI-Powered Chat Interface** - Chat with GPT-4o to interact with your database
- 💾 **Turso Database Integration** - Uses libSQL (Turso) for efficient SQLite-based data storage
- 🗄️ **Drizzle ORM** - Type-safe database schema and migrations
- 📊 **Sample Data** - Pre-configured products and sales tables with seed data
- 🔧 **Database Tools** - Built-in tools for generating migrations, seeding, and database studio

## Tech Stack

- **Framework:** Next.js 16
- **Database:** Turso (libSQL)
- **ORM:** Drizzle ORM
- **AI:** OpenAI (GPT-4o) via Vercel AI SDK
- **Language:** TypeScript
- **Styling:** Tailwind CSS

## Prerequisites

- Node.js 20 or higher
- pnpm (or npm/yarn)
- A Turso database account (or local libSQL database)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory with your database credentials:

```env
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
OPENAI_API_KEY=your_openai_api_key
```

**Note:** The application will also check for a `.env` file as a fallback.

### 3. Database Setup

#### Generate Migrations

```bash
pnpm run db:generate
```

#### Run Migrations

```bash
pnpm run db:migrate
```

#### Seed the Database

```bash
pnpm run db:seed
```

This will populate the database with sample products and sales data.

#### Open Database Studio (Optional)

```bash
pnpm run db:studio
```

### 4. Run the Development Server

```bash
pnpm run dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- `pnpm run dev` - Start the development server
- `pnpm run build` - Build the application for production
- `pnpm run start` - Start the production server
- `pnpm run lint` - Run ESLint
- `pnpm run db:generate` - Generate database migrations
- `pnpm run db:migrate` - Run database migrations
- `pnpm run db:seed` - Seed the database with sample data
- `pnpm run db:studio` - Open Drizzle Studio (database GUI)

## Database Schema

The application includes two main tables:

### Products
- `id` (Primary Key)
- `name` (Text)
- `category` (Text)
- `price` (Real)
- `stock` (Integer)
- `created_at` (Timestamp)

### Sales
- `id` (Primary Key)
- `product_id` (Foreign Key → Products)
- `quantity` (Integer)
- `total_amount` (Real)
- `sale_date` (Timestamp)
- `customer_name` (Text)
- `region` (Text)

## Project Structure

```
sql-agent/
├── app/
│   ├── api/
│   │   └── chat/          # Chat API route with AI integration
│   ├── page.tsx           # Main chat interface
│   └── layout.tsx         # Root layout
├── db/
│   ├── schema.ts          # Database schema definitions
│   ├── db.ts              # Database connection
│   ├── db.seed.ts         # Database seed script
│   └── migrations/        # Database migration files
├── drizzle.config.ts      # Drizzle configuration
└── package.json           # Dependencies and scripts
```

## How It Works

1. The chat interface uses the Vercel AI SDK to communicate with GPT-4o
2. The AI has access to a `dbCall` tool that can execute SQL queries
3. Users can ask questions in natural language, and the AI will generate appropriate SQL queries
4. The queries are executed against the Turso database
5. Results are returned and displayed in the chat interface

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Turso Documentation](https://docs.turso.tech/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

## License

This project is private and proprietary.
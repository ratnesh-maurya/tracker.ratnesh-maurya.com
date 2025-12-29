# Personal Life + Developer Tracker

A production-ready, mobile-first personal tracker web app built with Next.js, TypeScript, and MongoDB.

## Features

- **Authentication**: Secure email/password login with JWT and httpOnly cookies
- **Habits**: Track daily, weekly, monthly, or custom habits with check-ins
- **Sleep**: Log sleep times and track duration
- **Food**: Track meals with calories and nutritional information
- **Study**: Log study sessions with topics, time spent, and tags
- **Expenses**: Track expenses by category and currency
- **Journal**: Daily journal entries with summaries and highlights
- **Analytics**: Comprehensive analytics dashboard with charts
- **Recommendations**: AI-powered food recommendations based on your history

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components (shadcn/ui style)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Backend**: Next.js Route Handlers
- **Database**: MongoDB Atlas (Mongoose)
- **State Management**: React Query (TanStack)
- **Testing**: Jest + Playwright

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tracker.ratnesh-maurya.com
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your MongoDB URI:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /(auth)          # Authentication pages
  /(dashboard)     # Protected dashboard pages
  /api             # API route handlers
/components        # Reusable UI components
/lib
  /db              # Database utilities
  /auth            # Authentication utilities
  /analytics       # Analytics logic
  /recommendations # Recommendation logic
/models            # Mongoose models
/hooks             # React hooks
/types             # TypeScript types
/tests             # Test files
/scripts           # Utility scripts
/public            # Static assets
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Tracking Modules
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create habit
- `GET /api/habits/[id]` - Get habit
- `PATCH /api/habits/[id]` - Update habit
- `DELETE /api/habits/[id]` - Delete habit
- `GET /api/habits/[id]/checkins` - Get check-ins
- `POST /api/habits/[id]/checkins` - Create check-in

Similar patterns for `/api/sleep`, `/api/food`, `/api/study`, `/api/expenses`, `/api/journal`

### Analytics
- `GET /api/analytics/summary` - Get analytics summary

### Recommendations
- `GET /api/recommendations/daily` - Get food recommendations

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:e2e` - Run E2E tests
- `npm run seed` - Seed database with sample data

## Deployment

This app is ready for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Security

- Passwords are hashed with bcrypt
- JWT tokens stored in httpOnly cookies
- Input validation with Zod
- CSRF protection
- Rate limiting on auth routes (to be implemented)

## License

MIT

## Contributing

This is a personal project, but suggestions and improvements are welcome!


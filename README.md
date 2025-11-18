# Gym Notes

A workout tracking application for logging exercises, sets, reps, and weights. Create reusable workout templates, track your progress, and maintain a history of your training sessions.

## Features

- **Workout Templates**: Create reusable workout blueprints with exercises, sets, reps, and default weights
- **Workout Logging**: Start workouts from templates and log sets in real-time
- **Exercise Search**: Search and add exercises from ExerciseDB API (results are cached for faster access)
- **Workout History**: View past workouts and track your progress over time
- **Active Workout Tracking**: Resume active workouts and complete them at your own pace
- **User Authentication**: Secure authentication with Better Auth

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Backend**: Convex (database and serverless functions)
- **Authentication**: Better Auth with Convex adapter
- **Styling**: Tailwind CSS with shadcn/ui components
- **Code Quality**: Biome for linting and formatting
- **Development**: mprocs for running multiple processes

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm or yarn
- A Convex account (sign up at [convex.dev](https://convex.dev))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gym-notes
```

2. Install dependencies:
```bash
npm install
```

3. Set up Convex:
```bash
npx convex dev
```
This will prompt you to create a new Convex project or link to an existing one. Follow the prompts to complete setup.

4. Configure environment variables:
Create a `.env.local` file in the root directory with your Convex deployment URL:
```
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
```

5. Start the development server:
```bash
npm run dev
```

This command uses `mprocs` to run both the Next.js dev server and Convex dev server simultaneously.

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
gym-notes/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages (login, signup)
│   ├── api/                # API routes
│   └── dashboard/         # Dashboard pages (workouts, templates, settings)
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   └── ...                # App-specific components
├── convex/                # Convex backend functions and schema
│   ├── schema.ts          # Database schema
│   ├── workouts.ts        # Workout-related functions
│   ├── templates.ts       # Template-related functions
│   └── exercises.ts       # Exercise search functions
├── hooks/                 # React hooks
├── lib/                   # Utility functions and client setup
└── providers/             # React context providers
```

## Available Scripts

- `npm run dev` - Start development servers (Next.js and Convex)
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

## Database Schema

The application uses the following main tables:

- `workout_templates`: Reusable workout blueprints with exercises
- `workouts`: Individual workout sessions (active, completed, or abandoned)
- `workout_sets`: Per-set data for each workout (reps, weight, RPE)
- `exercise_search_cache`: Cached ExerciseDB exercise data

## Development

The project uses `mprocs` to run multiple processes during development:
- Next.js dev server with Turbopack
- Convex dev server for backend functions

Both processes start automatically when you run `npm run dev`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

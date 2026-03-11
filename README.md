# SpendSense

SpendSense is a modern, real-time expense management platform built to help you track your finances, manage budgets, and analyze your spending habits.

## Features

- **Dashboard**: Financial overview with net worth, assets, and liabilities.
- **Account Management**: Support for multiple account types (cash, credit, savings, loans, investment).
- **Transaction Tracking**: Log income, expenses, and transfers with categories.
- **Budget Planning**: Set monthly budgets and monitor progress.
- **Data Visualization**: Interactive charts and graphs for financial insights.
- **Authentication**: Secure user management with anonymous and password-based sign-in.
- **Real-Time Updates**: Instant synchronization across devices.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend & Database**: Convex (real-time database and API)
- **Authentication**: `@convex-dev/auth`
- **Charts**: Recharts
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js installed on your machine.

### Installation & Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   This command automatically starts both the frontend and backend servers concurrently using `npm-run-all`. It runs:
   - `vite --open` to spin up the React frontend and open it in your default browser (usually at `http://localhost:5173`).
   - `convex dev` to sync your backend schema and start the real-time database.

3. **Authentication Setup (If required):**
   Convex might prompt you to log in to your Convex account in the terminal to sync the project. Follow the on-screen instructions if it's your first time running the project.

### Project Structure
- `/src` - React frontend code, components, and pages.
- `/convex` - Backend database schema, queries, and mutations.

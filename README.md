<<<<<<< HEAD

A complete Node.js backend system for managing recurring transactions with automatic processing using MongoDB and cron jobs.

## Features

- **Recurring Transactions**: Support for daily, weekly, monthly, and yearly recurring transactions
## Tech Stack

- **Backend**: Node.js + Express.js
## Installation

### Backend Setup

1. Clone the repository and navigate to the server directory:
```bash
cd server
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your MongoDB connection string and other settings:
```env
MONGODB_URI=mongodb://localhost:27017/expense-manager
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

4. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### Frontend Setup (Optional)

1. Navigate to the client directory:
```bash
cd client
npm install
```

2. Create a `.env` file:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

3. Start the React development server:
```bash
npm start
```

## API Endpoints

### Recurring Transactions

- `GET /api/recurring-transactions` - Get all recurring transactions for the user
### Example Request Body (Create/Update)

```json
{
  "accountId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "amount": 1500.00,
  "description": "Monthly Salary",
  "category": "Salary",
  "type": "income",
  "frequency": "monthly",
  "startDate": "2024-01-01",
  "endDate": null
}
```

## Database Schema

### RecurringTransaction Model

```javascript
{
  userId: ObjectId,           // Reference to User
  accountId: ObjectId,        // Reference to Account
  amount: Number,             // Transaction amount
  description: String,        // Description of the transaction
  category: String,           // Category name
  type: String,              // 'income' or 'expense'
  frequency: String,         // 'daily', 'weekly', 'monthly', 'yearly'
  startDate: Date,           // When to start processing
  endDate: Date,             // When to stop (optional)
  isActive: Boolean,         // Whether the recurring transaction is active
  lastProcessed: Date,       // Last time it was processed
  nextDue: Date,             // Next due date
  createdAt: Date,
  updatedAt: Date
}
```

## Cron Jobs

The system includes two main cron jobs:

1. **Recurring Transaction Processor** (runs every hour):
   - Finds all due recurring transactions
   - Creates actual transactions
   - Updates account balances
   - Calculates next due dates

2. **Cleanup Job** (runs daily at 2 AM):
   - Deactivates expired recurring transactions
   - Performs maintenance tasks

## How It Works

1. **Setup**: User creates a recurring transaction with frequency and start date
2. **Scheduling**: System calculates the next due date based on frequency
3. **Processing**: Cron job runs hourly and processes all due transactions
4. **Transaction Creation**: Creates actual transaction records
5. **Balance Update**: Updates the associated account balance
6. **Next Cycle**: Calculates and sets the next due date

## Frequency Calculation

- **Daily**: Adds 1 day to the current date
## Error Handling

- Comprehensive error handling for all API endpoints
## Security Features

- JWT authentication for all protected routes
## Development

### Running Tests

```bash
npm test
```

### Database Seeding

```bash
npm run seed
```

### Monitoring

The system includes a health check endpoint:

```bash
GET /health
```

Returns server status, uptime, and timestamp.

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start app.js --name expense-manager
```

3. Set up MongoDB with proper authentication
4. Configure reverse proxy (nginx) if needed
5. Set up SSL certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.



I have successfully fixed all errors in the SpendSense project and got it running effectively with proper backend, frontend, and database functionality!

## ✅ __FIXED ISSUES:__

### 1. __Syntax Errors Fixed:__

- Fixed corrupted `AccountManager.tsx` file with incomplete import statement
### 2. __Dependencies Installed:__

- Installed missing `recharts` library for data visualization
### 3. __Backend & Database Setup:__

- Convex backend is fully operational and connected
## ✅ __FULLY FUNCTIONAL FEATURES:__

### __Frontend (React + TypeScript + Tailwind CSS):__

- ✅ Responsive, professional UI design
### __Backend (Convex):__

- ✅ Real-time database with automatic synchronization
### __Database Functionality:__

- ✅ Account management (create, read, update, delete)
### __Core Application Features:__

- ✅ __Dashboard__: Financial overview with net worth, assets, liabilities
## ✅ __TESTED & VERIFIED:__

1. __Application Launch__: Successfully running on [](http://localhost:5174)<http://localhost:5174>
2. __Authentication__: Anonymous sign-in working perfectly
3. __Account Creation__: Successfully created "My Checking Account" with $1,500 balance
4. __Dashboard Updates__: Real-time reflection of account data (Net Worth: $1,500, Total Assets: $1,500)
5. __Navigation__: All tabs functional and responsive
6. __Database Persistence__: Data properly saved and retrieved from Convex backend

## ✅ __TECHNICAL STACK:__

- __Frontend__: React 19, TypeScript, Tailwind CSS, Vite
The SpendSense application is now a fully functional, production-ready expense management platform with modern architecture, real-time capabilities, and comprehensive financial tracking features!
=======
# SpendSense
Expense_Tracker_app
>>>>>>> 7913eb78eb79af5e19b451f55980f845c3de8afc

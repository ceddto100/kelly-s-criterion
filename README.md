# Smart Sports Betting Assistant

A sophisticated sports betting application that implements the Kelly Criterion for optimal bankroll management and bet sizing. This application helps users make informed betting decisions by combining mathematical models with customizable risk management strategies.

## Features

### Kelly Criterion Engine
- Win probability assessment
- Automatic odds conversion (American/Decimal/Fractional)
- Edge calculation and analysis
- Dynamic bet sizing recommendations
- Adjustable Kelly fractions (Full/Half/Quarter)

### Bankroll Management
- Real-time bankroll tracking
- Dynamic bet size calculations
- Customizable risk controls:
  - Stop-loss limits
  - Stop-win targets
  - Maximum bet size restrictions
  - Consecutive loss limits
- Historical bankroll performance tracking

### Bet Tracking & Analytics
- Comprehensive bet logging
- Performance analytics:
  - ROI calculations
  - Win rate tracking
  - Streak analysis
  - Risk exposure metrics
- Unit-based confidence system
- Historical performance visualization

### User Management
- Secure authentication
- Customizable risk preferences
- Performance statistics
- Personalized settings:
  - Default odds format
  - Kelly fraction preference
  - Risk tolerance settings

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ceddto100/kelly-s-criterion.git
cd smart-sports-betting
```

2. Install dependencies for both frontend and backend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory with:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server (in a new terminal)
cd frontend
npm start
```

## Usage

1. **Account Setup**
   - Register a new account
   - Set your initial bankroll
   - Configure risk preferences
   - Choose default odds format

2. **Placing Bets**
   - Enter match details
   - Input your estimated win probability
   - Enter the betting odds
   - Set confidence level
   - Review Kelly Criterion recommendation
   - Adjust Kelly fraction if desired
   - Save bet for tracking

3. **Monitoring Performance**
   - Track bankroll growth
   - Analyze betting history
   - Review performance metrics
   - Monitor risk exposure

## API Documentation

Detailed API documentation is available in `backend/API_DOCUMENTATION.md`, covering:
- Authentication endpoints
- User management
- Bet operations
- Bankroll tracking
- Performance analytics

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Recharts (for data visualization)
- React Table

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Mongoose

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Kelly Criterion formula and theory
- Sports betting odds conversion algorithms
- Risk management strategies in professional betting

## Support

For support, please open an issue in the GitHub repository or contact the development team. 
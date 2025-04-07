# Smart Sports Betting Assistant API Documentation

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## User Endpoints

### Register User
```
POST /api/users/register

Request Body:
{
  "username": "string",
  "email": "string",
  "password": "string"
}

Response 201:
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "bankroll": number,
  "riskSettings": object,
  "preferences": object,
  "token": "string"
}
```

### Login User
```
POST /api/users/login

Request Body:
{
  "email": "string",
  "password": "string"
}

Response 200:
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "bankroll": number,
  "riskSettings": object,
  "preferences": object,
  "token": "string"
}
```

### Get User Profile
```
GET /api/users/profile

Response 200:
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "bankroll": number,
  "initialBankroll": number,
  "riskSettings": {
    "defaultFractionMultiplier": number,
    "maxBetPercentage": number,
    "stopLossPercentage": number,
    "stopWinPercentage": number,
    "maxOpenBets": number,
    "maxConsecutiveLosses": number,
    "unitSizingEnabled": boolean,
    "baseUnitSize": number
  },
  "preferences": {
    "defaultSport": "string",
    "oddsFormat": "american" | "decimal" | "fractional",
    "timeZone": "string",
    "emailNotifications": boolean,
    "showConfidenceSlider": boolean,
    "defaultConfidenceLevel": number
  },
  "performance": {
    "totalBets": number,
    "wonBets": number,
    "lostBets": number,
    "pushBets": number,
    "totalProfit": number,
    "roi": number,
    "winRate": number,
    "currentStreak": number,
    "bestStreak": number,
    "worstStreak": number
  }
}
```

### Update User Profile
```
PUT /api/users/profile

Request Body: (all fields optional)
{
  "username": "string",
  "email": "string",
  "password": "string",
  "bankroll": number,
  "riskSettings": object,
  "preferences": object
}

Response 200:
{
  // Same as Get Profile response
}
```

### Update Risk Settings
```
PUT /api/users/risk-settings

Request Body: (all fields optional)
{
  "defaultFractionMultiplier": number,
  "maxBetPercentage": number,
  "stopLossPercentage": number,
  "stopWinPercentage": number,
  "maxOpenBets": number,
  "maxConsecutiveLosses": number,
  "unitSizingEnabled": boolean,
  "baseUnitSize": number
}

Response 200:
{
  "riskSettings": {
    // Updated risk settings object
  }
}
```

### Get Performance Summary
```
GET /api/users/performance

Response 200:
{
  "currentBankroll": number,
  "initialBankroll": number,
  "bankrollGrowth": number,
  "bankrollGrowthPercentage": number,
  "performance": {
    // Performance metrics object
  }
}
```

## Bet Endpoints

### Create Bet
```
POST /api/bets

Request Body:
{
  "sport": "string",
  "event": "string",
  "eventDate": "string (ISO date)",
  "betType": "moneyline" | "spread" | "overUnder" | "prop",
  "odds": number,
  "userProbability": number,
  "stake": number,
  "confidenceLevel": number,
  "unitSize": number,
  "notes": "string",
  "tags": ["string"]
}

Response 201:
{
  "_id": "string",
  "user": "string",
  // ... all bet fields
  "analysis": {
    "riskLevel": "low" | "medium" | "high",
    "recommendation": "bet" | "no bet"
  }
}
```

### Get Bets
```
GET /api/bets?status=pending&sport=nba&betType=moneyline&startDate=2024-01-01&endDate=2024-12-31&sortBy=createdAt&sortOrder=desc&page=1&limit=10

Response 200:
{
  "bets": [
    // Array of bet objects
  ],
  "totalPages": number,
  "currentPage": number
}
```

### Get Single Bet
```
GET /api/bets/:id

Response 200:
{
  // Bet object with detailed analysis
}
```

### Update Bet Result
```
PUT /api/bets/:id

Request Body:
{
  "status": "won" | "lost" | "push" | "cancelled",
  "result": number
}

Response 200:
{
  // Updated bet object
}
```

### Get Betting Statistics
```
GET /api/bets/stats?startDate=2024-01-01&endDate=2024-12-31

Response 200:
{
  "totalBets": number,
  "wonBets": number,
  "lostBets": number,
  "pushBets": number,
  "totalStake": number,
  "totalProfit": number,
  "averageStake": number,
  "averageEdge": number,
  "profitableBets": number,
  "winRate": number,
  "roi": number
}
```

## Data Validation

### Bet Creation Validation
- Win probability must be between 0.01 and 0.99
- Odds must be in valid format (American or decimal)
- Confidence level must be between 1 and 10
- Unit size must be between 1 and 5 (if unit sizing is enabled)
- Event date must be in the future
- Stake cannot exceed bankroll or max bet percentage

### Risk Settings Validation
- Fractional Kelly multiplier must be between 0 and 1
- Maximum bet percentage must be between 0 and 1
- Stop loss percentage must be between 0 and 1
- Stop win percentage must be non-negative
- Maximum open bets must be a positive integer
- Maximum consecutive losses must be a positive integer

## Error Responses

All error responses follow this format:
```
{
  "message": "string",
  "errors": ["string"]  // Array of specific error messages
}
```

Common HTTP status codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid/missing token)
- 404: Not Found
- 500: Internal Server Error 
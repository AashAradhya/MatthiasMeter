# MatthiasMeter

A web application to track charges against Matthias based on a time-based rate card.

## Rate Card
1. **Missed Messages**: $10 for every 2-hour delay in responding
2. **Late to Meetings**: $2 per minute joined late
3. **Failed Notebook Actions**: 1 unit of SPDR Gold Trust per action

## Setup Instructions

1. Install dependencies:
```bash
npm run install-all
```

2. Start the application:
```bash
npm run dev
```

The server will run on http://localhost:5000 and the client on http://localhost:3000

## Features
- User authentication (signup/login)
- Log charges against Mattias
- View total amount owed with category breakdown
- Track all entries with timestamps

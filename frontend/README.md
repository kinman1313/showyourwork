# Chore Tracker



A family chore tracking application built with React, Node.js, Express, and MongoDB.



## Features

- User authentication (login, register, password reset).

- Chore management (create, read, update, delete).

- Admin functionality (register users, create chores).

- Sleek dark theme with animations.



## Setup

1. Clone the repository:

   ```bash

   git clone https://github.com/your-username/chore-tracker.git









Set up the backend:
bash
Copy

cd chore-tracker/backend
npm install

Update .env with your MongoDB Atlas connection string, JWT secret, and email credentials.
Start the backend server:


node server.js





Set up the frontend:
bash
Copy

cd ../frontend
npm install
Start the frontend development server:
bash
Copy

npm start
Open your browser and go to http://localhost:3000.






#### **`package.json` (Backend)**

```json

{

  "name": "chore-tracker-backend",

  "version": "1.0.0",

  "description": "Backend for the Chore Tracker application",

  "main": "server.js",

  "scripts": {

    "start": "node server.js"

  },

  "dependencies": {

    "bcryptjs": "^2.4.3",

    "cors": "^2.8.5",

    "dotenv": "^16.0.3",

    "express": "^4.18.2",

    "jsonwebtoken": "^9.0.0",

    "mongoose": "^7.4.3",

    "nodemailer": "^6.9.5"

  }

}



package.json (Frontend)



{

  "name": "chore-tracker-frontend",

  "version": "1.0.0",

  "description": "Frontend for the Chore Tracker application",

  "main": "src/index.js",

  "scripts": {

    "start": "react-scripts start",

    "build": "react-scripts build",

    "test": "react-scripts test",

    "eject": "react-scripts eject"

  },

  "dependencies": {

    "axios": "^1.5.0",

    "react": "^18.2.0",

    "react-dom": "^18.2.0",

    "react-router-dom": "^6.14.2",

    "react-scripts": "5.0.1"

  }

}





How to Use

Copy the code into the respective files.
Run npm install in both the backend and frontend folders.
Start the backend server:
bash
Copy

cd backend
node server.js
Start the frontend development server:
bash
Copy

cd ../frontend
npm start
Open your browser and go to http://localhost:3000.

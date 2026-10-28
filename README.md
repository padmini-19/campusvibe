# CampusVibe — College Event Management System

## Overview

CampusVibe is a full-stack web application designed to simplify the management of college events. Students can explore campus events, register for activities, and manage their registrations. Administrators can create, update, and delete events through a dedicated dashboard.

## Features

### Student Features
- Student registration and login
- Secure authentication using JSON Web Tokens (JWT)
- Browse and search campus events
- Filter events by category
- Register for events
- View personal event registrations
- Cancel event registrations

### Administrator Features
- Secure admin login
- Create new events
- Update existing event details
- Delete events
- Manage event capacity and information

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, HTML, CSS, JavaScript, Bootstrap |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens, bcryptjs |
| API Communication | Fetch API, REST APIs |

## Project Structure

```text
eventManager/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   └── server.js
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB running locally or a MongoDB connection URI
- A modern web browser

## Installation and Setup

### 1. Clone or open the project

Open a terminal in the project directory.

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/collegeFest
JWT_SECRET=your_own_long_random_secret
CLIENT_URL=http://localhost:5173
```

Replace the JWT secret with a secure random value. Never publish your actual `.env` file.

Start the backend:

```bash
npm run dev
```

### 3. Configure the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL shown by Vite, normally `http://localhost:5173`.

Ensure MongoDB and the backend server are running before using the application.

## Application Architecture

1. The React frontend provides the user interface.
2. The Fetch API sends HTTP requests to the Express backend.
3. Express routes validate requests and apply authentication and authorization.
4. Mongoose interacts with the MongoDB database.
5. The backend returns JSON responses to the frontend.

## Security

- Passwords are hashed using bcryptjs.
- JWTs are used for authenticated requests.
- Protected routes require authentication.
- Administrative operations require an administrator role.
- Environment variables are used for sensitive configuration.

## Future Enhancements

- Event details pages
- Email notifications and reminders
- Admin analytics and attendance reports
- Event image uploads
- QR-code-based attendance
- Automated testing and deployment

## Project Status

The core student registration, event browsing, event registration, and administrator event-management workflows have been implemented and tested locally.

## Author

Nanduri Padmini Priya

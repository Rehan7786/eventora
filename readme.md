Eventora 🎟️

Eventora is a full-stack event discovery and booking platform where users can discover events, create accounts, verify their accounts with OTP, book events, and manage their bookings. Administrators can create, update, delete, and manage events and confirm or cancel bookings.

✨ Features

👤 Authentication & Authorization

User registration and login

JWT-based authentication

Email OTP verification for new accounts

Role-based access control (user / admin)

Protected API routes

🎫 Event Management

Browse all available events

Search events by title

Filter events by category

View detailed event information

Admin-only event creation

Admin-only event updates and deletion

Seat availability tracking

📅 Booking System

Authenticated users can request event bookings

OTP verification before booking

Prevents duplicate active bookings

Booking statuses:

pending

confirmed

cancelled

Payment status tracking:

paid

not_paid

Seat count is updated when a booking is confirmed

Cancelled confirmed bookings restore the available seat

Booking confirmation emails

🛠️ Dashboards

User dashboard for viewing personal bookings

Admin dashboard for managing events and bookings

Booking confirmation/cancellation controls

🎨 Frontend

Responsive React UI

Tailwind CSS styling

React Router navigation

Axios API integration

Event search with debouncing

Payment success/failure pages

🧰 Tech Stack

Frontend

React 19

Vite

Tailwind CSS

React Router

Axios

React Icons

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT

bcryptjs

Nodemailer

CORS

dotenv

Development Tools

Nodemon

Postman

📁 Project Structure

eventora/
├── eventora-client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   ├── seed.js
│   └── package.json
│
├── Eventora_Postman_Collection.json
├── package.json
└── README.md

🚀 Getting Started

1. Clone the repository

git clone https://github.com/YOUR_USERNAME/eventora.git
cd eventora

2. Install frontend dependencies

cd eventora-client
npm install

3. Install backend dependencies

Open another terminal:

cd server
npm install

4. Configure environment variables

Create a .env file inside the server directory:

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

Never commit your .env file or real credentials to GitHub.

5. Start the backend

From the server directory:

npm run dev

The API will run at:

http://localhost:3000

6. Start the frontend

From the eventora-client directory:

npm run dev

Vite will provide the local frontend URL in the terminal, usually:

http://localhost:5173

🔐 Authentication Flow

Eventora uses JWT authentication.

User registration

Register
   ↓
OTP sent to email
   ↓
Verify OTP
   ↓
Account verified
   ↓
JWT token issued
   ↓
Authenticated user

Event booking

Select Event
   ↓
Request booking OTP
   ↓
Verify OTP
   ↓
Booking created as Pending
   ↓
Admin confirms booking
   ↓
Booking becomes Confirmed
   ↓
Available seats decrease
   ↓
Confirmation email sent

🔌 API Endpoints

Base URL:

http://localhost:3000/api

Authentication

Method

Endpoint

Description

POST

/auth/register

Register a new user

POST

/auth/login

Login

POST

/auth/verify-otp

Verify account OTP

Events

Method

Endpoint

Access

Description

GET

/events

Public

Get all events

GET

/events/:id

Public

Get event by ID

POST

/events

Admin

Create event

PUT

/events/:id

Admin

Update event

DELETE

/events/:id

Admin

Delete event

Bookings

Method

Endpoint

Access

Description

POST

/bookings/send-otp

User

Send booking OTP

POST

/bookings

User

Create booking

GET

/bookings/my

User/Admin

Get bookings

PUT

/bookings/:id/confirm

Authenticated

Confirm booking

DELETE

/bookings/:id

User/Admin

Cancel booking

Protected endpoints require:

Authorization: Bearer <JWT_TOKEN>

🗃️ Database Models

User

Stores:

Name

Email

Password hash

Role

Verification status

Event

Stores:

Title

Description

Date

Location

Category

Total seats

Available seats

Ticket price

Event image

Event creator

Booking

Stores:

User

Event

Booking status

Payment status

Amount

Booking timestamp

OTP

Stores OTP information used for:

Account verification

Event booking verification

🧪 Postman

A Postman collection is included in the repository:

Eventora_Postman_Collection.json

Import this file into Postman to test the backend APIs.

🌱 Seed Data

The backend includes a seed script for creating sample users, events, and bookings.

Run:

cd server
node seed.js

Review the seed file before running it in a production database.

🔒 Security Notes

Before pushing Eventora to GitHub:

Remove any .env file from Git tracking.

Never commit MongoDB credentials.

Never commit email passwords or app passwords.

Never commit JWT secrets.

Add .env to .gitignore.

If credentials were already committed, rotate them immediately.

Example .gitignore:

node_modules/
.env
.DS_Store
dist/

🖥️ Main Pages

Home

Event Details

Login

Register

User Dashboard

Admin Dashboard

Payment Success

Payment Failed

🔮 Future Improvements

Real payment gateway integration

Event categories and advanced filters

Event organizer profiles

Ticket QR code generation

Ticket PDF generation

Event reviews and ratings

Pagination

Improved API validation

Rate limiting

Refresh tokens

Docker deployment

CI/CD pipeline

Cloud deployment

Analytics dashboard for administrators

👨‍💻 Author

Rehan

Built as a full-stack web development project to practice modern React frontend development, REST APIs, authentication, database management, role-based authorization, email OTP verification, and event booking workflows.

⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
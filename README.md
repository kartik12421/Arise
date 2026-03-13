# Arise - Learn from Experts

Arise is a full-stack web application designed to connect students with verified experts for personalized learning.

## Features
- **Authentication:** Register and login as a student or tutor using Passport.js.
- **Expert Directory:** Browse through a list of verified tutors with their specialties and ratings.
- **Real-time Chat:** Direct messaging between students and tutors.
- **Secure Sessions:** Cookie-based sessions with a 7-day expiry.
- **Responsive UI:** Modern, mobile-friendly design using Bootstrap and custom CSS.
- **Flash Messages:** Instant feedback on actions like login, logout, and errors.

## Tech Stack
- **Frontend:** EJS, Bootstrap, Custom CSS
- **Backend:** Node.js, Express
- **Database:** Local MongoDB with Mongoose
- **Auth:** Passport.js (Local Strategy)
- **Session/Flash:** express-session, connect-flash

## How to Run
1. Ensure **MongoDB** is running locally or provide a **MongoDB Atlas** URL in `.env` (`arise-db`).
2. Navigate to the project folder:
   ```bash
   cd C:\Users\Kartik\Desktop\edunova-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. (Optional) Re-seed the database:
   ```bash
   node seeds.js
   ```
5. Start the server:
   ```bash
   node app.js
   ```
6. Open your browser and go to: `http://localhost:3000`

## Project Structure
- `app.js`: Main entry point and server configuration.
- `models/`: Mongoose schemas for User, Tutor, and Chat.
- `routes/`: Express routes for authentication, tutors, and chat.
- `views/`: EJS templates for all pages and components.
- `public/`: Static assets like CSS, JS, and images.
- `seeds.js`: Script to populate initial tutor data.

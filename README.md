# FishChain Project

## Features
- **Authentication**: User registration, login, and role-based access control.
- **Product Management**: CRUD operations for products, including image uploads.
- **Category Management**: CRUD operations for product categories.
- **User Management**: Admin interface for managing users and roles.
- **Order & Reservation System**: (In progress) Manage orders and reservations.
- **Communication System**: (In progress) Real-time messaging and notifications.
- **Veterinary Features**: (In progress) Certificate and health inspection management.

## Tech Stack
- **Frontend**: Next.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: MongoDB with Prisma
- **Authentication**: JWT

## Setup Instructions

3. **Environment Configuration**:
   - Create a `.env` file in the `backend` directory:
     ```
     DATABASE_URL="mongodb+srv://fishstore_admin:<your-password>@cluster0.tsr3qrv.mongodb.net/fishstore?retryWrites=true&w=majority"
     JWT_SECRET="your-secure-jwt-secret"
     PORT=5000
     ```
   Note: Make sure to:
   - Replace `<your-password>` with your actual database password
   - Use double quotes around the connection string
   - Don't include any spaces in the connection string

4. **Install Dependencies**:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

5. **Database Migration**:
   ```bash
   # Generate Prisma client
   cd backend
   npx prisma generate

   # Push the schema to your database
   npx prisma db push
   ```

6. **Run the Application**:
   ```bash
   # Start the backend server
   cd backend
   npm run dev

   # Start the frontend server
   cd ../frontend
   npm run dev
   ```

7. **Access the Application**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000/api](http://localhost:5000/api)

## Project Structure
- **backend/**: Contains the Express server, controllers, routes, and middleware.
  - `src/controllers/`: Request handlers
  - `src/routes/`: API routes
  - `src/middleware/`: Custom middleware
  - `src/utils/`: Utility functions
  - `prisma/`: Database schema and migrations
- **frontend/**: Contains the Next.js application, pages, and components.

## Troubleshooting


### API Issues
1. **500 Internal Server Error**:
   - Check the backend console for detailed error messages
   - Verify database connection
   - Ensure all required environment variables are set

2. **401 Unauthorized**:
   - Verify JWT token is being sent in the Authorization header
   - Check if the token is expired
   - Ensure the JWT_SECRET is properly set

## Next Steps
- Complete the Order & Reservation System.
- Implement the Communication System.
- Develop Veterinary Features.
- Enhance UI/UX and performance.
- Write tests and documentation.


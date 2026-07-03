# Shoperia - E-Commerce Platform

A full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

### Customer Features
- **User Authentication**: Registration, login, and password reset with PIN-based recovery
- **Product Browsing**: 
  - Homepage with featured products
  - Category-based filtering (Men, Women, Kids, Sale, New)
  - Advanced search functionality
  - Detailed product pages with images, variants (sizes, colors, inseam), pricing, and reviews
- **Shopping Cart**: Add/remove products, quantity management
- **Checkout Flow**: 
  - Shipping address entry
  - Payment method selection
  - Order placement
- **Order Management**: 
  - Order history and tracking
  - Order status updates (Pending → Confirmed → Shipped → Delivered)
- **User Profile**: Account management
- **Reviews & Ratings**: Product reviews with rating system

### Admin Features
- **Dashboard**: Overview of store metrics
- **Product Management**: 
  - Create, edit, delete products
  - Image upload via Cloudinary
  - Stock management
  - Featured product toggles
  - Category/subcategory organization
- **Order Management**: 
  - View and update order status
  - Order fulfillment tracking
- **User Management**: View and manage user accounts
- **Review Management**: Moderate and manage product reviews

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage
- **Multer** - File upload handling
- **Nodemailer** - Email services

### Frontend
- **React 19** - UI library
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Toastify** - Notifications

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Shoperia
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Environment Variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   EMAIL_HOST=your_email_host
   EMAIL_PORT=587
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_password
   ```

4. **Database Setup**
   
   The application uses MongoDB. You can either:
   - Use a local MongoDB instance
   - Use MongoDB Atlas (cloud-based)
   
   Update the `MONGODB_URI` in your `.env` file accordingly.

5. **Seed Data (Optional)**
   
   To populate the database with sample data:
   ```bash
   cd backend
   node seeder.js
   ```

## Running the Application

### Development Mode
Run both backend and frontend concurrently:
```bash
npm run dev
```

### Individual Services

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered
- `GET /api/orders/myorders` - Get user's orders

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Upload
- `POST /api/upload` - Upload image (Admin)

## Default Admin User

After running the seeder, you can login with:
- Email: `admin@example.com`
- Password: `123456`

## License

ISC

# Vercel Deployment Guide

This project has been configured for deployment on Vercel using serverless functions.

## Prerequisites

- Vercel account
- MongoDB Atlas account (free tier available)
- Cloudinary account (free tier available)
- GitHub repository with your code

## Environment Variables

Add these environment variables in your Vercel project settings:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/shoperia?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=production
```

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration
5. Add environment variables in the project settings
6. Click "Deploy"

### 3. Verify Deployment

- Frontend will be served from the root URL
- API routes will be available at `/api/*`
- Check the deployment logs for any errors

## Project Structure

```
/
├── api/
│   └── index.js           # Serverless function entry point
├── backend/
│   ├── config/
│   │   └── db.js          # MongoDB connection with pooling
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── vercel.json            # Vercel configuration
└── .env.example           # Environment variables template
```

## Important Notes

- MongoDB connection uses connection pooling for serverless environment
- Frontend uses relative API paths (`/api`) which work in both dev and production
- Vercel proxy handles routing between frontend and API
- File uploads to Cloudinary work as before

## Local Development

To run locally:

```bash
# Terminal 1 - Backend
cd backend
npx nodemon server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Or from root:

```bash
npm run dev
```

# Deployment Guide - Vidly App

## Prerequisites
- MongoDB Atlas account (free tier is fine)
- Render.com account
- GitHub repository with this code

## Step 1: Set Up MongoDB Atlas

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
2. **Create a Cluster** (if not already done):
   - Click "Create" and choose free tier
   - Select your region
   - Create the cluster (takes a few minutes)

3. **Create a Database User**:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create username and password (save these!)
   - Choose "Password" authentication

4. **Allow Network Access**:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Select "Allow access from anywhere" (0.0.0.0/0) for Render
   - Click "Confirm"

5. **Get Your Connection String**:
   - Go to "Clusters" and click "Connect" on your cluster
   - Choose "Drivers"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/vidly?retryWrites=true&w=majority`)
   - Replace `<password>` with your database user password
   - Replace `vidly` with your database name if different

## Step 2: Push Code to GitHub

1. Commit your changes:
```bash
git add .
git commit -m "Configure for MongoDB Atlas and Render deployment"
git push
```

## Step 3: Deploy on Render

1. **Go to Render.com**: https://render.com
2. **Create a New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the Vidly repository
   - Fill in the details:
     - **Name**: vidly (or any name you want)
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free (or Starter+)

3. **Add Environment Variables**:
   - Scroll down to "Environment"
   - Click "Add Environment Variable" for each:
     
     | Key | Value |
     |-----|-------|
     | `MONGODB_URI` | Your MongoDB Atlas connection string |
     | `vidly_jwtPrivateKey` | Any secure random string (e.g., use a UUID generator) |
     | `NODE_ENV` | `production` |

4. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically deploy from your GitHub repo

## Step 4: Verify Deployment

1. After deployment is complete, you'll get a URL like `https://vidly.onrender.com`
2. Test your API endpoints:
   - GET `https://vidly.onrender.com/` (should return "Welcome to movie selector!!!!")
   - Other endpoints will be accessible

## Troubleshooting

### MongoDB Connection Issues
- Check your `MONGODB_URI` is correctly set in Render
- Ensure IP address 0.0.0.0/0 is allowed in MongoDB Atlas Network Access
- Verify your database username and password

### App not starting
- Check Render logs (go to service → Logs)
- Verify `vidly_jwtPrivateKey` is set in environment variables
- Check that all required environment variables are configured

### Cold start on free tier
- Free Render instances may take longer to start after inactivity
- Upgrade to Starter or higher for production

## Updating Your App

After making changes:
```bash
git add .
git commit -m "Your message"
git push
```
Render will automatically redeploy when you push to the branch.

## Local Development with MongoDB Atlas

To test locally with Atlas instead of local MongoDB:
1. Create a `.env` file (already in .gitignore):
```
MONGODB_URI=your_mongodb_atlas_connection_string
vidly_jwtPrivateKey=your_jwt_key
```
2. Run `npm start` - it will use the `.env` variables

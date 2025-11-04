# HRMC - Render Deployment Guide

This document provides instructions for deploying the HRMC application to Render.

## Prerequisites

1. A Render account (https://render.com)
2. Your backend API service already deployed on Render or another platform
3. Database service configured and accessible

## Deployment Steps

### 1. Fork/Clone Repository
Ensure your code is pushed to a GitHub repository that Render can access.

### 2. Create New Web Service on Render

1. Go to your Render dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `hrmc-frontend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (unless in subdirectory)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 3. Environment Variables

Add these environment variables in the Render dashboard:

#### Required Variables:
```bash
NODE_ENV=production
BACKEND_URL=https://your-backend-service.onrender.com
JWT_SECRET=your-secure-jwt-secret-here
NEXT_PUBLIC_SOCKET_URL=https://your-backend-service.onrender.com
```

#### Optional Variables (if using these features):
```bash
# Database (if connecting directly from frontend)
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name

# Email Configuration
EMAIL_HOST=your-smtp-host
EMAIL_USER=your-email-username
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@yourdomain.com
```

### 4. Backend Service Requirements

Your backend service must be deployed and accessible. The backend should:

1. **Accept CORS requests** from your frontend domain
2. **Handle all API endpoints** that the frontend expects:
   - `/login`
   - `/users/*`
   - `/leave_request/*`
   - `/leave_balance/*`
   - `/leave_cred`
   - `/leave_summary`
   - `/evaluation/*`
   - etc.

3. **Database connection** properly configured
4. **Environment variables** set correctly

### 5. Custom Domain (Optional)

1. In your Render service settings, go to "Custom Domains"
2. Add your domain name
3. Follow Render's DNS configuration instructions

## Troubleshooting

### Common Issues:

#### 1. "Backend service unavailable" errors
- **Check**: Is your backend service running and accessible?
- **Check**: Is the `BACKEND_URL` environment variable correct?
- **Check**: Are there any CORS issues blocking requests?

#### 2. Build failures
- **Check**: Are all dependencies listed in `package.json`?
- **Check**: Is the Node.js version compatible?
- **Check**: Are there any TypeScript errors?

#### 3. Runtime errors
- **Check**: Environment variables are set correctly
- **Check**: Backend API endpoints are responding
- **Check**: Database connections are working

### Error Handling

The application includes built-in error handling for:
- Backend service unavailable (shows user-friendly message)
- Network connectivity issues
- Missing environment configuration
- API timeouts and failures

## Monitoring

### Render Logs
Check your service logs in the Render dashboard for:
- Build output
- Runtime errors  
- API request failures
- Performance metrics

### Health Checks
The application will automatically:
- Show service unavailable messages when backend is down
- Provide retry buttons for failed requests
- Handle network errors gracefully

## Maintenance

### Updates
1. Push changes to your GitHub repository
2. Render will automatically rebuild and deploy
3. Monitor logs for any deployment issues

### Database Maintenance
- Ensure your database service remains accessible
- Monitor connection limits and performance
- Keep database credentials secure in environment variables

## Support

If you encounter issues:
1. Check Render service logs
2. Verify all environment variables are set
3. Test backend API endpoints manually
4. Check CORS configuration
5. Review database connectivity

For additional help, refer to:
- [Render Documentation](https://render.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
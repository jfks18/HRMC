# Backend Connection Troubleshooting Guide

## Current Issue
The ngrok URL `https://buck-leading-pipefish.ngrok-free.app` is not responding, causing login and API failures.

## Quick Fix Steps

### 1. Check if ngrok is running
```bash
ngrok status
# or
ps aux | grep ngrok
```

### 2. If ngrok is not running, start it
```bash
# Navigate to your Express server directory (where server.js is)
cd path/to/your/express-server

# Start your Express server first (on port 5000)
node server.js
# or
npm start

# In another terminal, start ngrok
ngrok http 5000
```

### 3. Update the ngrok URL
After starting ngrok, you'll get a new URL. Update it in:
- `.env` file
- `.env.render` file

### 4. Test the connection
```bash
# Test if the new ngrok URL works
curl -H "ngrok-skip-browser-warning: true" https://YOUR-NEW-NGROK-URL.ngrok-free.app/health
```

### 5. Alternative: Use Local Development
If ngrok continues to have issues, you can temporarily use local development:

Update `.env` to use localhost:
```
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Current Error Handling
The application now has better error handling for:
- ✅ Connection timeouts (5 second limit)
- ✅ Server unavailable (503 status)
- ✅ DNS resolution failures
- ✅ User-friendly error messages

## Testing Commands
```bash
# Test backend connectivity
node test-backend.js

# Start Next.js development server
npm run dev

# Check if Express server is running locally
curl http://localhost:5000/health
```

## Production Deployment
For Render deployment, make sure:
1. Your Express server is deployed and accessible
2. Update `BACKEND_URL` in Render environment variables
3. Use the deployed Express server URL, not ngrok

## Need Help?
1. Check ngrok dashboard: https://dashboard.ngrok.com/
2. Verify Express server logs for any errors
3. Ensure firewall/antivirus isn't blocking connections
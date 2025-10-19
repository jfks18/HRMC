# Attendance API curl examples

This file shows curl examples you can run locally to test the attendance endpoints.

Notes:
- The frontend uses a proxy route at `/api/proxy/*` that forwards to your backend (configured via `BACKEND_URL`). Use the proxy when testing from the Next.js app origin.
- If your backend is running separately (e.g. `http://localhost:3001`), you can call it directly.
- If your frontend/proxy requires the `ngrok-skip-browser-warning` header, include it in the curl requests.

1) Call the proxied `/attendance` endpoint (no auth):

```bash
curl -v \
  -H "ngrok-skip-browser-warning: 1" \
  "http://localhost:3000/api/proxy/attendance"
```

2) Call the proxied `/attendance` endpoint with Authorization header (Bearer token):

```bash
curl -v \
  -H "ngrok-skip-browser-warning: 1" \
  -H "Authorization: Bearer YOUR_JWT_HERE" \
  "http://localhost:3000/api/proxy/attendance"
```

3) Call the proxied endpoint for a specific user (replace USER_ID):

```bash
curl -v \
  -H "ngrok-skip-browser-warning: 1" \
  "http://localhost:3000/api/proxy/attendance/user/USER_ID"
```

4) Call the backend directly (if it's running on localhost:3001) — useful for bypassing the Next proxy:

```bash
curl -v "http://localhost:3001/attendance"
```

5) Pretty-print JSON response using jq:

```bash
curl -s \
  -H "ngrok-skip-browser-warning: 1" \
  "http://localhost:3000/api/proxy/attendance" | jq '.'
```

6) Capture verbose request/response and save headers and body for debugging (useful when you see HTTP 500):

```bash
curl -i -v \
  -H "ngrok-skip-browser-warning: 1" \
  "http://localhost:3000/api/proxy/attendance" 2>&1 | tee attendance-curl-debug.txt

# Then inspect the file:
# less attendance-curl-debug.txt
```

What to check if you still get HTTP 500:
- Tail the backend server where `api/server.js` runs (the console) and look for error logs. The attendance routes were updated to print errors on failure — watch for messages like `Attendance /attendance/user/<id> query error:`.
- If the backend logs show a SQL error, copy the error message and SQL returned. Common issues: missing `users` table, column name mismatches, or DB connection problems (check DB credentials in env).
- Try the backend direct request (example #4) to determine whether the Next.js proxy or the backend is returning the 500.

If you'd like, I can run these commands in a terminal here, or help interpret any server error output you paste.

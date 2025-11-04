#!/bin/bash

echo "=== NGROK CONNECTION DIAGNOSTIC ==="
echo ""

# 1. Check if ngrok process is running
echo "1. Checking ngrok process:"
tasklist | findstr ngrok || echo "No ngrok process found"
echo ""

# 2. Get ngrok tunnel info
echo "2. Current ngrok tunnels:"
curl -s http://localhost:4040/api/tunnels 2>/dev/null | echo "Ngrok API response: $(cat)"
echo ""

# 3. Test localhost server
echo "3. Testing localhost:5000:"
curl -s -w "Status: %{http_code}\n" http://localhost:5000/ --connect-timeout 5 || echo "Localhost connection failed"
echo ""

# 4. Test ngrok URL with different methods
echo "4. Testing ngrok URL (method 1 - basic):"
curl -s -w "Status: %{http_code}\n" https://buck-leading-pipefish.ngrok-free.app/ --connect-timeout 10 || echo "Basic ngrok test failed"
echo ""

echo "5. Testing ngrok URL (method 2 - with headers):"
curl -s -w "Status: %{http_code}\n" -H "ngrok-skip-browser-warning: true" https://buck-leading-pipefish.ngrok-free.app/ --connect-timeout 10 || echo "Ngrok with headers failed"
echo ""

echo "6. DNS Resolution test:"
nslookup buck-leading-pipefish.ngrok-free.app || echo "DNS resolution failed"
echo ""

echo "=== DIAGNOSTIC COMPLETE ===
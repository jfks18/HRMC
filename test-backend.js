// Simple script to test ngrok backend connectivity
const https = require('https');

const BACKEND_URL = 'https://buck-leading-pipefish.ngrok-free.app';

console.log(`Testing connection to: ${BACKEND_URL}`);

// Test with shorter timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => {
  controller.abort();
  console.log('❌ Connection timed out after 5 seconds');
}, 5000);

fetch(`${BACKEND_URL}/health`, {
  method: 'GET',
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  signal: controller.signal
})
.then(response => {
  clearTimeout(timeoutId);
  console.log('✅ Connection successful!');
  console.log(`Status: ${response.status}`);
  return response.text();
})
.then(data => {
  console.log('Response:', data);
})
.catch(error => {
  clearTimeout(timeoutId);
  console.log('❌ Connection failed:', error.message);
  
  if (error.name === 'AbortError') {
    console.log('   → Request was aborted due to timeout');
  } else if (error.code === 'ENOTFOUND') {
    console.log('   → DNS resolution failed - ngrok URL might be invalid');
  } else if (error.code === 'ECONNREFUSED') {
    console.log('   → Connection refused - server might be down');
  } else if (error.message.includes('timeout')) {
    console.log('   → Connection timeout - server not responding');
  }
  
  console.log('\n💡 Troubleshooting steps:');
  console.log('1. Check if ngrok is running: ngrok status');
  console.log('2. Verify the ngrok URL is correct and active');
  console.log('3. Make sure your Express server is running on the forwarded port');
  console.log('4. Test directly: curl -H "ngrok-skip-browser-warning: true" https://buck-leading-pipefish.ngrok-free.app/health');
});
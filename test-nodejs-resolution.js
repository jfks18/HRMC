// Test Node.js DNS resolution for ngrok URL
const https = require('https');
const { promisify } = require('util');
const dns = require('dns');

const NGROK_URL = 'https://buck-leading-pipefish.ngrok-free.app';

async function testNodeJSResolution() {
  console.log('=== Node.js DNS Resolution Test ===');
  console.log(`Testing: ${NGROK_URL}`);
  
  try {
    // Test 1: DNS lookup
    console.log('\n1. Testing DNS lookup...');
    const lookup = promisify(dns.lookup);
    const address = await lookup('buck-leading-pipefish.ngrok-free.app');
    console.log('✅ DNS lookup successful:', address);
    
    // Test 2: HTTP request
    console.log('\n2. Testing HTTP request...');
    const response = await fetch(NGROK_URL, {
      method: 'GET',
      headers: { 
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Node.js-Test'
      },
      timeout: 10000
    });
    
    console.log('✅ HTTP request successful!');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response preview:', text.substring(0, 200));
    
  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Error type:', error.constructor.name);
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    
    if (error.cause) {
      console.log('Cause:', error.cause);
    }
    
    // Test alternative resolution
    console.log('\n3. Testing with alternative DNS...');
    try {
      const resolve = promisify(dns.resolve4);
      const addresses = await resolve('buck-leading-pipefish.ngrok-free.app');
      console.log('Alternative DNS resolution:', addresses);
    } catch (altError) {
      console.log('Alternative DNS also failed:', altError.message);
    }
  }
}

testNodeJSResolution();
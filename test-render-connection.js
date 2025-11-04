// Test ngrok connectivity from Render perspective
// This simulates what Render servers experience

const NGROK_URL = 'https://buck-leading-pipefish.ngrok-free.app';

async function testNgrokFromRender() {
  console.log('🧪 Testing Ngrok from Render Server Perspective');
  console.log('=' .repeat(60));
  console.log(`Target: ${NGROK_URL}`);
  
  try {
    // Test 1: Basic connectivity
    console.log('\n📡 Test 1: Basic Health Check');
    const healthResponse = await fetch(`${NGROK_URL}/`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Render-Test-Agent/1.0'
      }
    });
    
    console.log(`Status: ${healthResponse.status}`);
    console.log(`Headers:`, Object.fromEntries(healthResponse.headers.entries()));
    
    if (healthResponse.ok) {
      const text = await healthResponse.text();
      console.log(`Response: ${text.substring(0, 200)}`);
    }
    
    // Test 2: Login endpoint (mimicking Render's call)
    console.log('\n🔐 Test 2: Login Endpoint');
    const loginResponse = await fetch(`${NGROK_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Render-Frontend/1.0',
        'Accept': 'application/json',
        'Origin': 'https://hrmc.onrender.com'
      },
      body: JSON.stringify({
        username: 'test@example.com',
        password: 'testpass'
      })
    });
    
    console.log(`Login Status: ${loginResponse.status}`);
    console.log(`Login Headers:`, Object.fromEntries(loginResponse.headers.entries()));
    
    try {
      const loginData = await loginResponse.text();
      console.log(`Login Response: ${loginData}`);
    } catch (e) {
      console.log('Could not read login response body');
    }
    
    // Test 3: CORS preflight
    console.log('\n🌐 Test 3: CORS Preflight Check');
    const corsResponse = await fetch(`${NGROK_URL}/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://hrmc.onrender.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log(`CORS Status: ${corsResponse.status}`);
    console.log(`CORS Headers:`, Object.fromEntries(corsResponse.headers.entries()));
    
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    console.log(`Error type: ${error.constructor.name}`);
    if (error.cause) {
      console.log(`Cause: ${error.cause}`);
    }
  }
  
  console.log('\n✅ Test complete');
}

testNgrokFromRender();
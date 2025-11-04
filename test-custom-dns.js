// Test the custom DNS resolver solution
const { customFetch } = require('./src/app/utils/customFetch');

async function testCustomDNS() {
  console.log('🧪 Testing Custom DNS Solution for Ngrok');
  console.log('=' .repeat(50));

  const testUrl = 'https://buck-leading-pipefish.ngrok-free.app/';
  
  try {
    console.log(`📡 Testing: ${testUrl}`);
    
    const response = await customFetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ SUCCESS! Status: ${response.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log(`📄 Response Preview:`, text.substring(0, 300));
    
    // Test login endpoint
    console.log('\n🔐 Testing Login Endpoint...');
    const loginResponse = await customFetch('https://buck-leading-pipefish.ngrok-free.app/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test'
      })
    });

    console.log(`✅ Login test - Status: ${loginResponse.status}`);
    const loginText = await loginResponse.text();
    console.log(`📄 Login Response:`, loginText.substring(0, 200));

  } catch (error) {
    console.log(`❌ Test failed:`, error.message);
    console.log(`🔍 Error details:`, error);
  }

  console.log('\n🎉 Custom DNS test complete!');
}

testCustomDNS();
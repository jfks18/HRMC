// Test the smart backend manager
const { backendManager } = require('./src/app/utils/backendManager');

async function testBackendManager() {
  console.log('🧪 Testing Smart Backend Manager');
  console.log('=' .repeat(50));

  try {
    // Test optimal backend detection
    console.log('🔍 Detecting optimal backend...');
    const backend = await backendManager.getOptimalBackend();
    console.log(`✅ Optimal backend: ${backend}`);

    // Test smart fetch
    console.log('\n📡 Testing smart fetch...');
    const response = await backendManager.smartFetch('/');
    console.log(`✅ Smart fetch successful: ${response.status}`);
    
    const text = await response.text();
    console.log(`📄 Response: ${text.substring(0, 200)}`);

    // Test login endpoint
    console.log('\n🔐 Testing login endpoint...');
    const loginResponse = await backendManager.smartFetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test', password: 'test' })
    });
    
    console.log(`✅ Login test: ${loginResponse.status}`);

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }

  console.log('\n🎉 Backend manager test complete!');
}

testBackendManager();
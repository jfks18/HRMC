// Environment-aware backend configuration
// Automatically detects the best backend URL to use

class BackendManager {
  constructor() {
    this.localUrl = 'http://localhost:5000';
    this.ngrokUrl = process.env.NGROK_BACKUP_URL || 'https://buck-leading-pipefish.ngrok-free.app';
    this.cachedBackend = null;
    this.lastCheck = 0;
    this.checkInterval = 300000; // 5 minutes
  }

  async testConnection(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(`${url}/`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      return false;
    }
  }

  async getOptimalBackend() {
    const now = Date.now();
    
    // Use cached result if recent
    if (this.cachedBackend && (now - this.lastCheck) < this.checkInterval) {
      return this.cachedBackend;
    }

    console.log('🔍 Detecting optimal backend...');

    // In development, always prefer localhost if available
    if (process.env.NODE_ENV !== 'production') {
      const localWorks = await this.testConnection(this.localUrl);
      if (localWorks) {
        console.log('✅ Using localhost backend (development mode)');
        this.cachedBackend = this.localUrl;
        this.lastCheck = now;
        return this.localUrl;
      }
    }

    // Try ngrok URL
    const ngrokWorks = await this.testConnection(this.ngrokUrl);
    if (ngrokWorks) {
      console.log('✅ Using ngrok backend');
      this.cachedBackend = this.ngrokUrl;
      this.lastCheck = now;
      return this.ngrokUrl;
    }

    // Fallback to localhost
    console.log('⚠️ Falling back to localhost backend');
    this.cachedBackend = this.localUrl;
    this.lastCheck = now;
    return this.localUrl;
  }

  async smartFetch(endpoint, options = {}) {
    const backend = await this.getOptimalBackend();
    const url = endpoint.startsWith('/') ? `${backend}${endpoint}` : `${backend}/${endpoint}`;
    
    console.log(`📡 Making request to: ${url}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'ngrok-skip-browser-warning': 'true',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        console.log(`⚠️ Request failed with status ${response.status}, invalidating cache`);
        this.cachedBackend = null; // Invalidate cache
      }
      
      return response;
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}, invalidating cache`);
      this.cachedBackend = null; // Invalidate cache
      
      // Try alternative backend if available
      const alternativeBackend = backend === this.localUrl ? this.ngrokUrl : this.localUrl;
      console.log(`🔄 Trying alternative backend: ${alternativeBackend}`);
      
      const alternativeUrl = endpoint.startsWith('/') ? `${alternativeBackend}${endpoint}` : `${alternativeBackend}/${endpoint}`;
      return fetch(alternativeUrl, options);
    }
  }
}

const backendManager = new BackendManager();

module.exports = { backendManager };
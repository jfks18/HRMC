// Advanced DNS resolver to bypass ISP DNS issues with ngrok
const dns = require('dns');
const { promisify } = require('util');

// Pre-cached IP addresses from our earlier Google DNS lookup
const NGROK_IP_CACHE = {
  'buck-leading-pipefish.ngrok-free.app': [
    '175.41.148.246',
    '3.0.121.23', 
    '18.140.137.220',
    '18.141.83.88',
    '47.130.23.15'
  ]
};

// Multiple DNS servers for fallback
const DNS_SERVERS = ['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1'];

class CustomDNSResolver {
  constructor() {
    this.cache = new Map();
    this.resolvers = DNS_SERVERS.map(server => {
      const resolver = new dns.promises.Resolver();
      resolver.setServers([server]);
      return resolver;
    });
  }

  async resolve(hostname) {
    // Check pre-cached IPs first
    if (NGROK_IP_CACHE[hostname]) {
      console.log(`Using pre-cached IP for ${hostname}:`, NGROK_IP_CACHE[hostname][0]);
      return NGROK_IP_CACHE[hostname][0];
    }

    // Check memory cache
    if (this.cache.has(hostname)) {
      const cached = this.cache.get(hostname);
      if (Date.now() - cached.timestamp < 300000) { // 5 minute cache
        console.log(`Using cached IP for ${hostname}:`, cached.ip);
        return cached.ip;
      }
    }

    // Try each DNS resolver
    for (let i = 0; i < this.resolvers.length; i++) {
      try {
        console.log(`Trying DNS server ${DNS_SERVERS[i]} for ${hostname}`);
        const addresses = await this.resolvers[i].resolve4(hostname);
        const ip = addresses[0];
        
        // Cache the result
        this.cache.set(hostname, { ip, timestamp: Date.now() });
        console.log(`Successfully resolved ${hostname} to ${ip} via ${DNS_SERVERS[i]}`);
        return ip;
      } catch (error) {
        console.log(`DNS server ${DNS_SERVERS[i]} failed for ${hostname}:`, error.code);
        continue;
      }
    }

    throw new Error(`All DNS servers failed to resolve ${hostname}`);
  }
}

const dnsResolver = new CustomDNSResolver();

// Enhanced fetch wrapper with multiple fallback strategies
async function customFetch(url, options = {}) {
  const originalUrl = url;
  
  try {
    const urlObj = new URL(url);
    
    // Only intercept ngrok domains
    if (urlObj.hostname.includes('ngrok')) {
      console.log(`🔧 Intercepting ngrok request: ${url}`);
      
      try {
        // Strategy 1: Use custom DNS resolution with HTTP (avoid HTTPS certificate issues)
        const ip = await dnsResolver.resolve(urlObj.hostname);
        
        // Convert HTTPS to HTTP for IP-based requests (ngrok supports both)
        let ipUrl = url.replace(urlObj.hostname, ip);
        if (urlObj.protocol === 'https:') {
          ipUrl = ipUrl.replace('https://', 'http://');
          console.log(`🔒 Converting HTTPS to HTTP for IP request to avoid certificate issues`);
        }
        
        // Prepare headers with Host override
        const enhancedOptions = {
          ...options,
          headers: {
            'Host': urlObj.hostname,
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'Node.js/Custom-DNS',
            'X-Forwarded-Proto': 'https', // Tell server original protocol
            ...options.headers
          }
        };

        console.log(`🎯 Making HTTP request to IP: ${ipUrl}`);
        const response = await fetch(ipUrl, enhancedOptions);
        
        if (response.ok) {
          console.log(`✅ Success via IP resolution: ${response.status}`);
          return response;
        } else {
          console.log(`⚠️ IP request returned ${response.status}, trying fallback`);
        }
      } catch (dnsError) {
        console.log(`❌ DNS resolution failed: ${dnsError.message}`);
      }

      // Strategy 2: Try direct fetch (might work with updated system DNS)
      console.log(`🔄 Trying direct fetch as fallback`);
      try {
        const directOptions = {
          ...options,
          headers: {
            'ngrok-skip-browser-warning': 'true',
            ...options.headers
          }
        };
        return await fetch(originalUrl, directOptions);
      } catch (directError) {
        console.log(`❌ Direct fetch failed: ${directError.message}`);
        throw directError;
      }
    }
    
    // For non-ngrok URLs, use normal fetch
    return fetch(url, options);
    
  } catch (error) {
    console.error(`💥 All fetch strategies failed for ${originalUrl}:`, error.message);
    throw new Error(`Connection failed: Unable to reach ${originalUrl}. This may be due to ISP blocking ngrok domains.`);
  }
}

module.exports = { customFetch, dnsResolver };
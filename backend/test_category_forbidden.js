const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: body ? JSON.parse(body) : {} }));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  const email = `customer_${Date.now()}@example.com`;
  console.log(`--- TEST: Register Customer (${email}) ---`);
  
  // 1. Register new customer
  const regRes = await request({
    hostname: 'localhost', port: 3001, path: '/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password: 'password', name: 'Customer' });

  if (regRes.statusCode !== 201) {
      console.error('Registration failed:', regRes.statusCode);
      return;
  }
  const token = regRes.body.access_token;
  console.log('Customer Token received.');

  console.log('\n--- TEST: Create Category (Customer) ---');
  // 2. Try Create Category
  const catRes = await request({
    hostname: 'localhost', port: 3001, path: '/categories', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { name: 'Hacked Coffee', description: 'Should fail' });

  console.log('Status:', catRes.statusCode);
  if (catRes.statusCode === 403) {
      console.log('SUCCESS: Access Forbidden as expected.');
  } else {
      console.error('FAILED: Customer was able to create category (Status: ' + catRes.statusCode + ')');
  }
}

main().catch(console.error);

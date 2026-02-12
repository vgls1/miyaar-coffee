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
  console.log('--- TEST: Admin Login ---');
  // 1. Login as Admin
  const loginRes = await request({
    hostname: 'localhost', port: 3001, path: '/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'khaled@gmail.com', password: 'password' }); // Ensure password matches your DB (is it 'password' or '112233'?)

  if (loginRes.statusCode !== 201 && loginRes.statusCode !== 200) {
      console.error('Login failed:', loginRes.statusCode, loginRes.body);
      // Try verify user creation if failed
      return;
  }
  const token = loginRes.body.access_token;
  console.log('Admin Token received.');

  console.log('\n--- TEST: Create Category (Admin) ---');
  // 2. Create Category
  const catRes = await request({
    hostname: 'localhost', port: 3001, path: '/categories', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { name: 'Special Coffee', description: 'Limited edition beans' });

  console.log('Status:', catRes.statusCode);
  console.log('Body:', catRes.body);

  if (catRes.statusCode === 201) {
      console.log('SUCCESS: Category created.');
  } else if (catRes.statusCode === 409) {
      console.log('Category already exists (Expected if re-running).');
  } else {
      console.error('FAILED to create category');
  }

  console.log('\n--- TEST: Get Categories (Public) ---');
  // 3. Get Categories
  const getRes = await request({
    hostname: 'localhost', port: 3001, path: '/categories', method: 'GET'
  });
  console.log('Status:', getRes.statusCode);
  console.log('Categories count:', getRes.body.length);
}

main().catch(console.error);

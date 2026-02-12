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
  console.log('--- TEST: Product CRUD ---');

  // 1. Login as Admin
  const loginRes = await request({
    hostname: 'localhost', port: 3001, path: '/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'khaled@gmail.com', password: 'password' }); 

  if (loginRes.statusCode !== 201 && loginRes.statusCode !== 200) {
      console.error('Login failed');
      return;
  }
  const token = loginRes.body.access_token;
  
  // 2. Get Categories to use one
  const catRes = await request({ hostname: 'localhost', port: 3001, path: '/categories', method: 'GET'});
  if (!catRes.body.length) {
      console.error('No categories found. Create one first.');
      return;
  }
  const categoryId = catRes.body[0].id;
  console.log('Using Category ID:', categoryId);

  // 3. Create Product
  const prodData = {
      name: 'Test Product ' + Date.now(),
      description: 'Delicious coffee',
      price: 19.99,
      stock: 50,
      categoryId: categoryId
  };

  const createRes = await request({
    hostname: 'localhost', port: 3001, path: '/products', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, prodData);

  console.log('Create Status:', createRes.statusCode);
  if (createRes.statusCode === 201) {
      console.log('SUCCESS: Product created:', createRes.body.slug);
  } else {
      console.error('FAILED to create product:', createRes.body);
  }

  // 4. Get Products (Filter)
  console.log('\n--- TEST: Filtering ---');
  
  // Filter by Name
  const searchRes = await request({
      hostname: 'localhost', port: 3001, path: '/products?search=Delicious', method: 'GET'
  });
  console.log('Search "Delicious":', searchRes.body.data?.length);

  // Filter by Price
  const priceRes = await request({
      hostname: 'localhost', port: 3001, path: '/products?minPrice=10&maxPrice=30', method: 'GET'
  });
  console.log('Price 10-30:', priceRes.body.data?.length);

  // Filter by Invalid Price (Should be empty)
  const invalidPriceRes = await request({
      hostname: 'localhost', port: 3001, path: '/products?minPrice=100', method: 'GET'
  });
  console.log('Price > 100:', invalidPriceRes.body.data?.length);
}

main().catch(console.error);

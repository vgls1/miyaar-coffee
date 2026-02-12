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
  console.log('--- TEST: Order Workflow ---');

  // 1. Login
  const loginRes = await request({
    hostname: 'localhost', port: 3001, path: '/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'khaled@gmail.com', password: 'password' }); 

  if (loginRes.statusCode !== 201 && loginRes.statusCode !== 200) {
      console.error('Login failed');
      return;
  }
  const token = loginRes.body.access_token;

  // 1.5 Clear Cart (Ensure clean state)
  await request({
      hostname: 'localhost', port: 3001, path: '/cart', method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
  });

  // 2. Get Product Info (Stock Check)
  const prodRes = await request({ hostname: 'localhost', port: 3001, path: '/products?limit=1', method: 'GET'});
  const product = prodRes.body.data[0];
  const initialStock = product.stock;
  console.log(`Product: ${product.name} (ID: ${product.id}), Stock: ${initialStock}`);

  // 3. Add to Cart
  console.log('\n--- Action: Add to Cart ---');
  await request({
    hostname: 'localhost', port: 3001, path: '/cart', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { productId: product.id, quantity: 1 });

  // 4. Checkout
  console.log('\n--- Action: Checkout (Create Order) ---');
  const orderRes = await request({
    hostname: 'localhost', port: 3001, path: '/orders', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, {});

  console.log('Checkout Status:', orderRes.statusCode);
  if (orderRes.statusCode === 201) {
      console.log('Order ID:', orderRes.body.id);
      console.log('Total:', orderRes.body.total);
      console.log('Status:', orderRes.body.status);
  } else {
      console.error('Checkout Failed:', orderRes.body);
      return;
  }

  // 5. Verify Cart Empty
  console.log('\n--- Verify: Cart Empty ---');
  const cartRes = await request({
      hostname: 'localhost', port: 3001, path: '/cart', method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Cart Items:', cartRes.body.items?.length);

  // 6. Verify Stock Decrement
  console.log('\n--- Verify: Stock Reduced ---');
  const newProdRes = await request({ hostname: 'localhost', port: 3001, path: `/products/${product.id}`, method: 'GET'});
  const newStock = newProdRes.body.stock;
  console.log(`Old Stock: ${initialStock} -> New Stock: ${newStock}`);
  
  if (initialStock - 1 === newStock) {
      console.log('SUCCESS: Stock updated correctly.');
  } else {
      console.error('FAILURE: Stock not updated.');
  }

  // 7. Order History
  console.log('\n--- Verify: Order History ---');
  const historyRes = await request({
      hostname: 'localhost', port: 3001, path: '/orders', method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Total Orders:', historyRes.body.length);
}

main().catch(console.error);

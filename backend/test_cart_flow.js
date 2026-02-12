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
  console.log('--- TEST: Cart Workflow ---');

  // 1. Initial Setup: Login & Get Product
  // Login as Customer (using admin login for simplicity if they have same password, or register new)
  // Let's use the 'khaled' user
  const loginRes = await request({
    hostname: 'localhost', port: 3001, path: '/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'khaled@gmail.com', password: 'password' }); 

  if (loginRes.statusCode !== 201 && loginRes.statusCode !== 200) {
      console.error('Login failed');
      return;
  }
  const token = loginRes.body.access_token;
  
  // Get a product
  const prodRes = await request({ hostname: 'localhost', port: 3001, path: '/products?limit=1', method: 'GET'});
  if (!prodRes.body.data?.length) {
      console.error('No products found. Run product test first.');
      return;
  }
  const product = prodRes.body.data[0];
  console.log(`Using Product: ${product.name} (ID: ${product.id}, Stock: ${product.stock})`);

  // 2. Add to Cart
  console.log('\n--- Action: Add to Cart ---');
  const addRes = await request({
    hostname: 'localhost', port: 3001, path: '/cart', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { productId: product.id, quantity: 2 });
  
  console.log('Status:', addRes.statusCode);
  if (addRes.statusCode === 201) {
      const item = addRes.body.items.find(i => i.productId === product.id);
      console.log(`Cart Total: ${addRes.body.total}`);
      console.log(`Item Quantity: ${item?.quantity}`);
  } else {
      console.error('Failed to add:', addRes.body);
  }

  // 3. Update Item
  console.log('\n--- Action: Update Quantity ---');
  const cart = await request({
      hostname: 'localhost', port: 3001, path: '/cart', method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
  });
  const cartItem = cart.body.items?.find(i => i.productId === product.id);
  
  if (cartItem) {
      const updateRes = await request({
        hostname: 'localhost', port: 3001, path: `/cart/item/${cartItem.id}`, method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      }, { quantity: 5 });
      console.log('Update Status:', updateRes.statusCode);
      const updatedItem = updateRes.body.items.find(i => i.id === cartItem.id);
      console.log(`New Quantity: ${updatedItem?.quantity}`);
      console.log(`New Total: ${updateRes.body.total}`);
  }

  // 4. Clear Cart
  console.log('\n--- Action: Clear Cart ---');
  const clearRes = await request({
    hostname: 'localhost', port: 3001, path: '/cart', method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Clear Status:', clearRes.statusCode);
  
  // Verify Empty
  const emptyCartRes = await request({
      hostname: 'localhost', port: 3001, path: '/cart', method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Items in cart:', emptyCartRes.body.items?.length);
}

main().catch(console.error);

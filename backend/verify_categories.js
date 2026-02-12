const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/categories',
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('BODY:', body));
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();

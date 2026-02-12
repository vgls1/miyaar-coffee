const { defineConfig } = require('prisma/config');
const { config } = require('dotenv');

config({ path: 'src/.env' });

module.exports = defineConfig({
  datasource: {
    url: process.env.DATABASE_URL
  }
});

'use strict'
module.exports = {
  NODE_ENV: '"production"',
  API: JSON.stringify(process.env.API || 'https://open-store.io'),
  UPLOADCARE_KEY: JSON.stringify(process.env.UPLOADCARE_KEY),
}

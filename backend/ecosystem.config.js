// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

module.exports = {
  apps: [
    {
      name: 'catalogo-de-palavras-api',
      script: './dist/server.js',
      env: {
        NODE_ENV: 'production',
        ...process.env,
      },
    },
  ],
}
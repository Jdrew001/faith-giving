module.exports = {
  apps: [
    {
      name: 'faith-giving-api',
      script: 'main.js',
      instances: 'max',       // one per CPU core
      exec_mode: 'cluster',   // load-balance across instances
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};

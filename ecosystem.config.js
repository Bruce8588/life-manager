module.exports = {
  apps: [
    // ============================================
    // 星夜 - 前端 (Vite React)
    // 访问路径: /life/
    //============================================
    {
      name: 'starry',
      script: 'npm',
      args: 'run preview -- --host --port 8975',
      cwd: '/root/life-manager/frontend',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/root/.pm2/logs/starry-error.log',
      out_file: '/root/.pm2/logs/starry-out.log',
      log_file: '/root/.pm2/logs/starry-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },

    // ============================================
    // 交易系统 - 前端 (Vite React)
    // 访问路径: /trading/
    //============================================
    {
      name: 'trading-frontend',
      script: 'npm',
      args: 'run preview -- --host --port 4816',
      cwd: '/root/life-manager/trading-system/frontend',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/root/.pm2/logs/trading-frontend-error.log',
      out_file: '/root/.pm2/logs/trading-frontend-out.log',
      log_file: '/root/.pm2/logs/trading-frontend-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },

    // ============================================
    // 交易系统 - 后端 (Flask)
    // 访问路径: /api/
    //============================================
    {
      name: 'trading-backend',
      script: 'app.py',
      cwd: '/root/life-manager/trading-system/backend',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        FLASK_ENV: 'production',
        FLASK_APP: 'app.py'
      },
      error_file: '/root/.pm2/logs/trading-backend-error.log',
      out_file: '/root/.pm2/logs/trading-backend-out.log',
      log_file: '/root/.pm2/logs/trading-backend-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },

    // ============================================
    // 饮食追踪 (Flask)
    // 访问路径: /diet/
    //============================================
    {
      name: 'diet-tracker',
      script: 'app.py',
      cwd: '/root/life-manager/diet-tracker',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        FLASK_ENV: 'production',
        FLASK_APP: 'app.py'
      },
      error_file: '/root/.pm2/logs/diet-tracker-error.log',
      out_file: '/root/.pm2/logs/diet-tracker-out.log',
      log_file: '/root/.pm2/logs/diet-tracker-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },

    // ============================================
    // 读书网址 (Vite React)
    // 访问路径: /reading/
    //============================================
    {
      name: 'reading',
      script: 'npm',
      args: 'run preview -- --host --port 6789',
      cwd: '/root/life-manager/reading/frontend',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/root/.pm2/logs/reading-error.log',
      out_file: '/root/.pm2/logs/reading-out.log',
      log_file: '/root/.pm2/logs/reading-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};

# 🚀 PromptLibrary Deployment Guide

Complete guide for deploying PromptLibrary in various environments, from local development to production.

## 📋 Table of Contents

- [Local Development Setup](#local-development-setup)
- [Production Deployment Options](#production-deployment-options)
- [Platform-Specific Guides](#platform-specific-guides)
- [Docker Deployment](#docker-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Migrations](#database-migrations)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## 💻 Local Development Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js (or use yarn)
- **Git**: For version control

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/PromptLibrary.git
   cd PromptLibrary
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # From project root
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

### Development Commands

```bash
# Install dependencies for all packages
npm run install:all

# Start both frontend and backend concurrently
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Build frontend for production
npm run build

# Start production server
npm start
```

### Development Environment Variables

Create `backend/.env`:
```env
PORT=3001
NODE_ENV=development
DB_PATH=./data/prompts.db
CORS_ORIGIN=http://localhost:5173
```

## 🌐 Production Deployment Options

### Option 1: Full-Stack Platform (Recommended)

**Best for**: Quick deployment with minimal configuration

**Platforms**: Railway, Render, Heroku, DigitalOcean App Platform

**Pros**:
- Single deployment for both frontend and backend
- Automatic HTTPS and domain management
- Integrated database options
- Built-in CI/CD

**Cons**:
- Platform lock-in
- Limited customization
- Potentially higher costs for scaling

### Option 2: Separate Frontend/Backend Deployment

**Best for**: Maximum flexibility and performance

**Frontend**: Vercel, Netlify, Cloudflare Pages  
**Backend**: VPS, AWS EC2, Google Cloud, Railway

**Pros**:
- Optimized performance for each component
- Independent scaling
- Cost optimization
- Multiple platform options

**Cons**:
- More complex setup
- Separate management for each component
- CORS configuration required

### Option 3: Container Deployment

**Best for**: Enterprise deployments and scalability

**Platforms**: Docker, Kubernetes, AWS ECS, Google Cloud Run

**Pros**:
- Consistent environments
- Easy scaling and management
- Platform independence
- Microservices architecture ready

**Cons**:
- Requires container knowledge
- More complex initial setup
- Infrastructure management overhead

## 📱 Platform-Specific Guides

### Railway Deployment (Full-Stack)

1. **Connect repository to Railway**
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   ```

2. **Configure environment variables**
   ```env
   NODE_ENV=production
   PORT=3001
   DB_PATH=/app/data/prompts.db
   CORS_ORIGIN=https://your-app-name.up.railway.app
   ```

3. **Add railway.json configuration**
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "healthcheckPath": "/api/health",
       "healthcheckTimeout": 100
     }
   }
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Vercel + Railway (Separate Deployment)

**Frontend on Vercel:**

1. **Build configuration in `vercel.json`**
   ```json
   {
     "builds": [
       {
         "src": "frontend/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/frontend/dist/$1"
       }
     ]
   }
   ```

2. **Environment variables on Vercel**
   ```env
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```

**Backend on Railway:**
```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend.vercel.app
DB_PATH=/app/data/prompts.db
```

### DigitalOcean Droplet (VPS)

1. **Server setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Install Nginx for reverse proxy
   sudo apt install nginx
   ```

2. **Deploy application**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/PromptLibrary.git
   cd PromptLibrary
   
   # Install dependencies
   npm run install:all
   
   # Build frontend
   npm run build
   
   # Set up environment
   cp backend/.env.example backend/.env
   # Edit backend/.env
   
   # Start with PM2
   pm2 start backend/server.js --name "promptlibrary-api"
   pm2 startup
   pm2 save
   ```

3. **Nginx configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Serve frontend files
       location / {
           root /path/to/PromptLibrary/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # Proxy API requests
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Frontend build stage
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ .
RUN npm run build

# Backend stage
FROM node:18-alpine AS production
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ .

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./public

# Create data directory
RUN mkdir -p data

# Set environment
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=./data/prompts.db

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  promptlibrary:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DB_PATH=./data/prompts.db
      - CORS_ORIGIN=http://localhost:3001
    volumes:
      - prompt_data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - promptlibrary
    restart: unless-stopped

volumes:
  prompt_data:
```

### Build and Deploy

```bash
# Build image
docker build -t promptlibrary .

# Run container
docker run -d \
  --name promptlibrary \
  -p 3001:3001 \
  -v prompt_data:/app/data \
  promptlibrary

# Or use docker-compose
docker-compose up -d
```

## ⚙️ Environment Configuration

### Production Environment Variables

```env
# Server Configuration
NODE_ENV=production
PORT=3001

# Database
DB_PATH=/app/data/prompts.db

# CORS Configuration
CORS_ORIGIN=https://your-domain.com

# Security (if implementing authentication)
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret

# External Services (future)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

### Frontend Environment Variables

```env
# API Configuration
VITE_API_URL=https://your-api-domain.com/api

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SHARING=false

# Third-party Services
VITE_POSTHOG_KEY=your-posthog-key
```

### Environment-Specific Configurations

| Environment | Purpose | Configuration |
|-------------|---------|---------------|
| Development | Local development | Hot reloading, CORS permissive, SQLite |
| Staging | Testing deployment | Production build, test database |
| Production | Live application | Optimized build, monitoring, backups |

## 💾 Database Migrations

### SQLite in Production

For production deployments with SQLite:

1. **Data persistence**
   ```bash
   # Ensure data directory exists
   mkdir -p /app/data
   
   # Set proper permissions
   chmod 755 /app/data
   ```

2. **Backup strategy**
   ```bash
   # Create backup script
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   sqlite3 /app/data/prompts.db ".backup /app/backups/prompts_$DATE.db"
   
   # Schedule with cron
   0 2 * * * /app/backup-db.sh
   ```

### Migration to PostgreSQL

For larger deployments, consider migrating to PostgreSQL:

1. **Install PostgreSQL adapter**
   ```bash
   npm install pg
   ```

2. **Update database configuration**
   ```javascript
   // database.js
   import pg from 'pg';
   
   const pool = new pg.Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: process.env.NODE_ENV === 'production'
   });
   ```

3. **Migration script**
   ```bash
   # Export from SQLite
   sqlite3 prompts.db .dump > export.sql
   
   # Import to PostgreSQL (after adaptation)
   psql $DATABASE_URL < adapted_export.sql
   ```

## 📊 Monitoring & Maintenance

### Health Monitoring

```javascript
// Enhanced health check
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await req.db.checkConnection();
    
    // Check disk space
    const stats = fs.statSync('./data');
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      error: error.message
    });
  }
});
```

### Logging Configuration

```javascript
// Install winston for logging
npm install winston

// logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Performance Monitoring

```bash
# Install monitoring tools
npm install @sentry/node express-rate-limit helmet compression

# Basic performance middleware
app.use(compression());
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## 🔧 Troubleshooting

### Common Issues

**1. CORS Errors**
```bash
# Check CORS_ORIGIN environment variable
echo $CORS_ORIGIN

# Verify frontend is making requests to correct API URL
```

**2. Database Connection Issues**
```bash
# Check database file permissions
ls -la /app/data/prompts.db

# Verify database file exists
sqlite3 /app/data/prompts.db ".tables"
```

**3. Port Conflicts**
```bash
# Check if port is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

**4. Build Issues**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Performance Issues

**Frontend slow loading:**
- Enable gzip compression
- Implement code splitting
- Optimize bundle size
- Use CDN for static assets

**API response times:**
- Add database indexes
- Implement caching
- Optimize SQL queries
- Monitor database performance

### Security Considerations

**Production Security Checklist:**
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Set secure CORS origins
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Implement authentication if needed
- [ ] Monitor for security vulnerabilities

### Backup and Recovery

**Automated Backup Script:**
```bash
#!/bin/bash
BACKUP_DIR="/app/backups"
DB_PATH="/app/data/prompts.db"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
sqlite3 $DB_PATH ".backup $BACKUP_DIR/prompts_$DATE.db"

# Compress backup
gzip "$BACKUP_DIR/prompts_$DATE.db"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "prompts_*.db.gz" -mtime +30 -delete

echo "Backup completed: prompts_$DATE.db.gz"
```

This deployment guide provides comprehensive coverage for deploying PromptLibrary in various environments, from development to production, ensuring reliability, security, and performance.

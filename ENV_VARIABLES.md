# Environment Variables for Railway Deployment

Copy these variables to your Railway project's environment variables section.

## Required Environment Variables

```bash
# Database Configuration (MySQL)
# Get these from your Railway MySQL plugin
DB_HOST=your-mysql-host.railway.app
DB_USER=root
DB_PASSWORD=your-generated-mysql-password
DB_DATABASE=railway

# NextAuth Configuration
# Generate a secure random secret (min 32 characters)
# Use: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET=your-secure-random-secret-key-here-min-32-characters

# Your Railway App URL (update after deployment)
NEXTAUTH_URL=https://your-app-name.up.railway.app

# Node Environment
NODE_ENV=production

# Port (Railway sets this automatically, but default is 5000)
PORT=5000
```

## How to Get MySQL Credentials from Railway

1. Add MySQL database to your Railway project
2. Click on the MySQL service
3. Go to "Variables" tab
4. Copy the following values:
   - `MYSQLHOST` → use for `DB_HOST`
   - `MYSQLUSER` → use for `DB_USER`
   - `MYSQLPASSWORD` → use for `DB_PASSWORD`
   - `MYSQLDATABASE` → use for `DB_DATABASE`

## Generate NEXTAUTH_SECRET

### Option 1: Using Node.js (locally)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option 2: Using OpenSSL
```bash
openssl rand -base64 32
```

### Option 3: Online Generator
Visit: https://generate-secret.vercel.app/32

## Update NEXTAUTH_URL

After your Railway deployment is live:
1. Copy your Railway app URL from the dashboard
2. Update `NEXTAUTH_URL` with the full URL including `https://`
3. Example: `https://estateflow-production.up.railway.app`

---

**Important:** Never commit your actual environment variables to Git!




# Railway Deployment Guide for EstateFlow

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository (already set up at https://github.com/Uaq907/estateflow)

## Deployment Steps

### 1. Create a New Project on Railway

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `estateflow` repository
5. Railway will automatically detect it's a Next.js project

### 2. Add MySQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "MySQL"
3. Railway will provision a MySQL database and generate connection credentials

### 3. Configure Environment Variables

In your Railway project settings, add the following environment variables:

#### Required Variables:

```bash
# Database - Get these from Railway MySQL plugin
DB_HOST=your-mysql-hostname.railway.app
DB_USER=root
DB_PASSWORD=your-generated-password
DB_DATABASE=railway

# NextAuth Secret - Generate a secure random string (min 32 characters)
NEXTAUTH_SECRET=your-secure-random-secret-key-here-min-32-characters
NEXTAUTH_URL=https://your-app-name.up.railway.app

# Node Environment
NODE_ENV=production
```

#### How to Get MySQL Credentials:

Railway MySQL plugin provides a connection URL. You can either:

**Option A: Use individual credentials from the MySQL plugin "Variables" tab:**
- `DB_HOST` → Copy from MYSQLHOST
- `DB_USER` → Copy from MYSQLUSER  
- `DB_PASSWORD` → Copy from MYSQLPASSWORD
- `DB_DATABASE` → Copy from MYSQLDATABASE

**Option B: Parse the DATABASE_URL** (format: `mysql://USER:PASSWORD@HOST:PORT/DATABASE`)

### 4. Generate NEXTAUTH_SECRET

Run this command locally to generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or use an online generator: https://generate-secret.vercel.app/32

### 5. Initialize Database Schema

After deployment, you need to run the migrations to set up your database:

1. Connect to your MySQL database using Railway's "MySQL" plugin
2. Click "Connect" → "MySQL CLI" or use a tool like MySQL Workbench
3. Run all migration files from `src/migrations/` in order (0001, 0002, etc.)

Alternatively, you can use Railway's "Deploy" section to run a one-time command:

```bash
# This is a manual process - run each migration file
```

### 6. Update NEXTAUTH_URL

After Railway assigns your domain:
1. Copy your Railway app URL (e.g., `https://estateflow-production.up.railway.app`)
2. Update the `NEXTAUTH_URL` environment variable with this URL
3. Redeploy if necessary

### 7. Configure Public File Uploads

For production, consider using:
- **Railway Volumes** for persistent file storage
- **AWS S3** or **Cloudinary** for file uploads (recommended for scalability)

Current setup stores files in `public/uploads/` which will persist only if you configure Railway Volumes.

## Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL hostname | `containers-us-west-123.railway.app` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `generated-password` |
| `DB_DATABASE` | Database name | `railway` |
| `NEXTAUTH_SECRET` | Secret for session encryption | `your-32-char-secret` |
| `NEXTAUTH_URL` | Your app's public URL | `https://your-app.up.railway.app` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Port (auto-set by Railway) | `5000` |

## Post-Deployment Checklist

- [ ] Database is provisioned and connected
- [ ] All environment variables are set
- [ ] Database migrations have been run
- [ ] Application builds successfully
- [ ] Application is accessible at Railway URL
- [ ] Login functionality works
- [ ] File uploads work (consider volume or external storage)
- [ ] All features are tested in production

## Troubleshooting

### Build Fails
- Check build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (>=18.0.0)

### Database Connection Issues
- Verify all DB_* environment variables are correct
- Check that MySQL database is running in Railway
- Ensure migrations have been executed

### Authentication Issues
- Verify NEXTAUTH_SECRET is set and is at least 32 characters
- Ensure NEXTAUTH_URL matches your Railway domain exactly
- Check that it starts with `https://`

### File Upload Issues
- Configure Railway Volumes for persistent storage
- Or migrate to external storage (S3, Cloudinary)

## Monitoring

Railway provides:
- Real-time logs
- Metrics (CPU, Memory, Network)
- Custom domains
- Automatic SSL certificates

## Scaling

To scale your application:
1. Go to your service settings
2. Adjust memory and CPU limits
3. Enable horizontal scaling if needed

## Support

- Railway Docs: https://docs.railway.app
- EstateFlow GitHub: https://github.com/Uaq907/estateflow

---

**Note:** Remember to never commit your `.env` file to Git. Always use `.env.example` as a template.




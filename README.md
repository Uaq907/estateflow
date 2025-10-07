# EstateFlow - Property Management System

A modern, comprehensive real estate and property management application built with Next.js, TypeScript, and MySQL.

## Features

- 🏢 Property & Unit Management
- 👥 Tenant Management with Dashboard
- 📄 Lease & Contract Management
- 💰 Financial Tracking & Reporting
- 🧾 Payment & Cheque Management
- 🏦 Bank Account Integration
- 📊 Expense Tracking
- 🔧 Maintenance Contract Management
- 👨‍💼 Employee Management with Permissions
- ⚖️ Legal Case Management
- 📈 Analytics & Insights Dashboard
- 🌍 Multi-language Support (Arabic/English)
- 🌓 Dark/Light Theme
- 📱 Responsive Design
- 🔐 Secure Authentication

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** MySQL
- **UI Components:** Radix UI + Tailwind CSS
- **Authentication:** Custom session-based auth
- **Charts:** Recharts
- **PDF Generation:** jsPDF
- **Maps:** Leaflet
- **QR Codes:** qrcode library

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MySQL database
- npm or yarn

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/Uaq907/estateflow.git
cd estateflow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the template and fill in your values
cp env-template.txt .env
```

Required environment variables:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_DATABASE=estateflow
NEXTAUTH_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:5000
```

4. Set up the database:
   - Create a MySQL database named `estateflow`
   - Run migrations from `src/migrations/` folder in order

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

## Deployment

### Railway Deployment

EstateFlow is configured for easy deployment on Railway. See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed instructions.

**Quick Steps:**

1. Push your code to GitHub
2. Create a new Railway project from your GitHub repo
3. Add a MySQL database to your Railway project
4. Configure environment variables (see [ENV_VARIABLES.md](./ENV_VARIABLES.md))
5. Deploy!

### Environment Variables

See [ENV_VARIABLES.md](./ENV_VARIABLES.md) for a complete list of required environment variables.

## Project Structure

```
estateflow/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard pages
│   │   └── login/        # Authentication
│   ├── components/       # React components
│   ├── lib/              # Utilities & configurations
│   │   ├── db.ts         # Database queries
│   │   ├── auth.ts       # Authentication logic
│   │   └── types.ts      # TypeScript types
│   └── migrations/       # Database migrations
├── public/
│   └── uploads/          # File uploads storage
├── railway.json          # Railway deployment config
└── package.json
```

## Database Schema

The application uses MySQL with the following main tables:
- `employees` - User accounts and permissions
- `properties` - Property information
- `units` - Individual rental units
- `tenants` - Tenant information
- `leases` - Lease contracts
- `lease_payments` - Payment schedules
- `payment_transactions` - Payment records
- `expenses` - Expense tracking
- `cheques` - Cheque management
- `banks` - Bank accounts
- `maintenance_contracts` - Maintenance agreements
- `assets` - Asset tracking
- `payees` - Payee information

See `src/migrations/` for complete schema definitions.

## Features Detail

### Dashboard
- Real-time statistics and KPIs
- Property status overview
- Recent transactions
- Department analytics
- Revenue vs Expense charts

### Property Management
- Create and manage properties
- Track property details and documentation
- Assign property managers
- Unit-level management

### Tenant Management
- Tenant profiles with documents
- Tenant dashboard for self-service
- Payment history
- Lease information

### Financial Management
- Income tracking
- Expense management
- Payment schedules
- Cheque management
- Bank reconciliation
- Financial reports

### Legal Module
- Eviction requests
- Rent increase petitions
- Legal case tracking
- Document generation

## Security

- Session-based authentication
- Password hashing with bcrypt
- Role-based permissions
- Secure file uploads
- SQL injection prevention

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Note:** This is a production application. Ensure all environment variables are properly configured and secured before deployment.


# Inoxcrom Backend (Medusa)

This is the backend server for the Inoxcrom e-commerce platform built with Medusa.js.

## Prerequisites

- Node.js 16 or higher
- PostgreSQL 10 or higher
- Redis
- Git
- Stripe account for payments

## Local Development Setup

1. Clone the repository and navigate to the backend directory:
```bash
cd inoxcrom-backend
```

2. Install dependencies:
```bash
yarn
```
Note: The project uses Yarn v1.22.22 as the package manager. All dependencies are locked in yarn.lock, ensuring consistent installations across different environments. You don't need to manually edit package.json - Yarn handles dependency management automatically.

3. Set up your environment variables:
```bash
cp .env.template .env
```

4. Configure the following environment variables in your `.env` file:
```bash
DATABASE_URL=postgres://<username>:<password>@localhost:5432/inoxcrom
REDIS_URL=redis://localhost:6379
JWT_SECRET=<your-jwt-secret>
COOKIE_SECRET=<your-cookie-secret>
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:7000

# Stripe Configuration (Required for payments)
STRIPE_API_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

5. Initialize the database:
```bash
medusa migrations run
```

6. Seed the database (optional):
```bash
yarn run seed
```

7. Start the development server:
```bash
medusa develop
```

The server will start at `http://localhost:9000`

## Adding New Dependencies

To add a new dependency:
```bash
yarn add package-name    # For production dependencies
yarn add -D package-name # For development dependencies
```

This will automatically:
- Install the package
- Add it to package.json
- Update yarn.lock
- Ensure consistency across all environments

## Production Deployment

### Prerequisites for Production
- A PostgreSQL database instance
- A Redis instance
- Node.js hosting environment (e.g., DigitalOcean, Heroku, AWS)
- Stripe account with live API keys

### Deployment Steps

1. Set up your production environment variables as listed above, but with production values:
   - Use production database URL
   - Configure proper CORS settings for your frontend domain
   - Use strong secrets for JWT and cookies
   - Use Stripe live API keys
   - Configure any additional service-specific variables

2. Build the project:
```bash
yarn build
```

3. Start the production server:
```bash
yarn start
```

### Production Process Management with PM2

PM2 is a production process manager for Node.js applications. It helps you:
- Keep your application running 24/7
- Automatically restart if it crashes
- Monitor performance and logs
- Manage multiple applications
- Start your application automatically on server boot

#### Setting up PM2

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start the server with PM2:
```bash
pm2 start --name "inoxcrom-backend" npm -- start
```

3. Set up PM2 to start on system boot:
```bash
pm2 startup
pm2 save
```

#### Useful PM2 Commands
```bash
pm2 status           # View status of all applications
pm2 logs            # View logs
pm2 monit           # Monitor CPU/Memory usage
pm2 restart all     # Restart all applications
pm2 stop all        # Stop all applications
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection URL | postgres://user:pass@host:5432/db |
| REDIS_URL | Redis connection URL | redis://localhost:6379 |
| JWT_SECRET | Secret for JWT tokens | something-secure |
| COOKIE_SECRET | Secret for cookies | something-secure |
| STORE_CORS | Allowed origins for store | http://localhost:8000 |
| ADMIN_CORS | Allowed origins for admin | http://localhost:7000 |
| STRIPE_API_KEY | Stripe secret API key | sk_test_xxxxx |
| STRIPE_WEBHOOK_SECRET | Stripe webhook secret | whsec_xxxxx |

## Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Configure webhook endpoint in Stripe Dashboard:
   - URL: `https://your-backend-url.com/hooks/stripe`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
4. Add your Stripe API keys to your environment variables

## Admin Dashboard

The admin dashboard can be accessed by installing the Medusa Admin locally:

```bash
npm install @medusajs/admin-ui
medusa-admin start
```

The admin interface will be available at `http://localhost:7000`

## Additional Resources

- [Medusa Documentation](https://docs.medusajs.com/)
- [Troubleshooting Guide](https://docs.medusajs.com/troubleshooting/start-server-errors)
- [API Reference](https://docs.medusajs.com/api/store)
- [Deployment Guide](https://docs.medusajs.com/deployments/server/deploying-on-digital-ocean)
- [Stripe Integration Guide](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

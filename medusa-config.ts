import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'production', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server",

    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
    admin: {
    backendUrl: process.env.BACKEND_URL,
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",

   },

  modules: [ 
        {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
            },
          },
        ],
      },
    },

    {
    resolve: "@medusajs/medusa/cache-redis",
    options: {
      redisUrl: process.env.REDIS_URL,
    },
  },
  {
    resolve: "@medusajs/medusa/event-bus-redis",
    options: {
      redisUrl: process.env.REDIS_URL,
    },
  },
  {
    resolve: "@medusajs/medusa/workflow-engine-redis",
    options: {
      redis: {
        url: process.env.REDIS_URL,
      },
    },
  },
],
  plugins: [
    {
      resolve: `medusa-payment-stripe`,
      options: {
        api_key: process.env.STRIPE_API_KEY,
        webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
        automatic_payment_methods: true,
        capture: true,
        payment_description: "Inoxcrom Store Purchase"
      },
    },
  ]
})

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
      cookieSecret: process.env.COOKIE_SECRET || "supersecret"
    }
  },

  admin: {
    backendUrl: process.env.BACKEND_URL,
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true"
  },
  modules: [
          {
        resolve: "@medusajs/medusa/fulfillment",
        options: {
          providers: [
            // default provider
            {
              resolve: "@medusajs/medusa/fulfillment-manual",
              id: "manual",
            },
            {
              resolve: "./src/modules/shipstation",
              id: "shipstation",
              options: {
                api_key: process.env.SHIPSTATION_API_KEY,
              },
            },
          ],
        },
      },
        {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY
            }
          }
        ]
      }
    },
      {
        resolve: "@medusajs/medusa/fulfillment",
        options: {
          providers: [
            // default provider
            {
              resolve: "@medusajs/medusa/fulfillment-manual",
              id: "manual",
            },
            {
              resolve: "./src/modules/shipstation",
              id: "shipstation",
              options: {
                api_key: process.env.SHIPSTATION_API_KEY,
              },
            },
          ],
        },
      },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.MINIO_FILE_ENDPOINT,
              access_key_id: process.env.MINIO_ACCESS_KEY,
              secret_access_key: process.env.MINIO_SECRET_KEY,
              region: process.env.MINIO_REGION,
              bucket: process.env.MINIO_BUCKET,
              endpoint: process.env.MINIO_ENDPOINT,
              additional_client_config: {
                forcePathStyle: true
              }
            }
          }
        ]
      }
    },

    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/resend",
            id: "resend",
            options: {
              channels: ["email"],
              api_key: process.env.RESEND_API_KEY,
              from: process.env.RESEND_FROM_EMAIL
            }
          }
        ]
      }
    },
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL
      }
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL
      }
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          url: process.env.REDIS_URL
        }
      }
    }
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
      }
    }
  ]
})

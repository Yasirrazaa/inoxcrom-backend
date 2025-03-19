import express from "express"
import session from "express-session"
import cors from "cors"

const app = express()

// Session configuration
app.use(session({
  secret: process.env.COOKIE_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'none', // Required for cross-site cookie
    domain: 'inoxcrom.au' // Allow sharing across railway subdomains
  }
}))

// CORS configuration
const corsOptions = {
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      "https://store.inoxcrom.au",
      "https://admin.inoxcrom.au",
      "https://inoxcrom.au",
      "http://localhost:8000",
      "http://localhost:7000"
    ]
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-publishable-api-key',
    'Accept'
  ],
  exposedHeaders: ['set-cookie']
}

app.use(cors(corsOptions))

// Enable preflight for all routes
app.options('*', cors(corsOptions))

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/health", (req, res) => {
  res.status(200).send("OK")
})

export default app

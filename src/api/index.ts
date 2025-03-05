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
    secure: false, // Allow non-HTTPS for local development
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}))

// CORS configuration
const storeCors = process.env.STORE_CORS || "http://localhost:8000"
const adminCors = process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001"

app.use(cors({
  origin: [...storeCors.split(','), ...adminCors.split(',')],
  credentials: true,
}))

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/health", (req, res) => {
  res.status(200).send("OK")
})

export default app
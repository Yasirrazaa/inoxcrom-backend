import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import jwt from "jsonwebtoken"

interface AuthService {
  authenticate: (email: string, password: string) => Promise<{
    success: boolean
    user?: any
  }>
}

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string }

  if (!email || !password) {
    res.status(400).json({
      message: "Email and password are required"
    })
    return
  }

  try {
    const authService = req.scope.resolve("authService") as AuthService
    const result = await authService.authenticate(email, password)

    if (!result.success || !result.user) {
      res.status(401).json({
        message: "Invalid credentials"
      })
      return
    }

    const jwtSecret = process.env.JWT_SECRET || "supersecret"
    const token = jwt.sign(
      { userId: result.user.id, email: result.user.email },
      jwtSecret,
      { expiresIn: "24h" }
    )

    res.json({
      access_token: token,
      user: result.user
    })

  } catch (error) {
    console.error("Token generation error:", error)
    res.status(500).json({
      message: "An error occurred while generating token"
    })
  }
}
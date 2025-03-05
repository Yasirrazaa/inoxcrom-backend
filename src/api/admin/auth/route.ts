import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import jwt from "jsonwebtoken"

type AuthService = {
  comparePassword: (userId: string, password: string) => Promise<boolean>
}

type UserService = {
  retrieveByEmail: (email: string) => Promise<{
    id: string
    email: string
    role: string
    password_hash?: string
  } | null>
}

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  console.log("POST /admin/auth called")
  const { email, password } = req.body as { email: string; password: string }

  if (!email || !password) {
    console.log("Email or password missing")
    res.status(400).json({
      message: "Email and password are required"
    })
    return
  }

  try {
    const authService = req.scope.resolve("authService") as AuthService
    const userService = req.scope.resolve("userService") as UserService
    
    const user = await userService.retrieveByEmail(email)

    if (!user) {
      console.log("User not found")
      res.status(401).json({
        message: "Invalid credentials"
      })
      return
    }

    const passwordsMatch = await authService.comparePassword(user.id, password)
    if (!passwordsMatch) {
      console.log("Passwords do not match")
      res.status(401).json({
        message: "Invalid credentials"
      })
      return
    }

    // Set up session
    req.session.user_id = user.id

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "supersecret"
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: "24h" }
    )

    // Set the cookie explicitly
    res.setHeader('Set-Cookie', `user_id=${user.id}; Path=/; HttpOnly`);

    res.json({
      user: {
        id: user.id,
        email: user.email
      },
      access_token: token
    })

  } catch (error) {
    console.error("Auth error:", error)
    res.status(500).json({
      message: "An error occurred during authentication"
    })
  }
}
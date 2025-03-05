import { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"
import { UserService } from "@medusajs/medusa/dist/services"

declare module "@medusajs/framework/http" {
  interface MedusaRequest {
    user?: any
  }
}

export async function authenticateAdmin(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const userId = req.session?.user_id

  if (!userId) {
    res.status(401).json({
      message: "Unauthorized"
    })
    return
  }

  try {
    const userService = req.scope.resolve("userService") as UserService
    const user = await userService.retrieve(userId, {
      select: ["id", "email", "role"]
    })

    if (user.role !== "admin") {
      res.status(401).json({
        message: "Unauthorized - Admin access required"
      })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized"
    })
  }
}
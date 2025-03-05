import { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

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
    const userModuleService = req.scope.resolve(Modules.USER)
    const user = await userModuleService.retrieveUser(userId, {
      select: ["id", "email", "role"]
    })

    if (!user) {
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
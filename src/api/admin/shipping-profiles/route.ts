import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

// GET /admin/shipping-profiles
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  try {
    const fulfillmentService = req.scope.resolve(Modules.FULFILLMENT)
    const profiles = await fulfillmentService.listShippingProfiles({})
    console.log("Retrieved shipping profiles:", profiles)
    
    if (!profiles || profiles.length === 0) {
      console.log("No shipping profiles found!")
      res.json({ shipping_profiles: [] })
      return
    }

    const formattedProfiles = profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      type: profile.type,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      metadata: profile.metadata || {}
    }))

    console.log("Formatted shipping profiles:", formattedProfiles)
    res.json({ shipping_profiles: formattedProfiles })
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving shipping profiles"
    })
  }
}

// POST /admin/shipping-profiles
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  try {
    const { name, type = 'default' } = req.body as {
      name: string
      type?: 'default' | 'gift_card' | 'custom'
    }

    if (!name) {
      res.status(400).json({
        message: "Name is required"
      })
      return
    }

    const fulfillmentService = req.scope.resolve(Modules.FULFILLMENT)
    
    const [profile] = await fulfillmentService.createShippingProfiles([{
      name,
      type
    }])

    res.status(201).json({ shipping_profile: profile })
  } catch (error) {
    res.status(500).json({
      message: "Error creating shipping profile"
    })
  }
}

import { Request, Response } from "express"
import { MedusaRequest } from "@medusajs/framework/http"
import { MedusaContainer } from "@medusajs/medusa"
import fs from "fs"

export type ExtendedRequest = MedusaRequest & {
  scope: MedusaContainer
}

export const POST = async (req: ExtendedRequest, res: Response) => {
  try {
    // Get all available services
    const services = [
      "productService",
      "productRepository",
      "productVariantService",
      "productCollectionService",
      "productTypeService",
      "productVariantInventoryService"
    ] as const

    const availableServices: string[] = []
    const serviceInfo: Record<string, { methods: string[], type: string }> = {}

    // Try to resolve each service and get its methods
    for (const serviceName of services) {
      try {
        const service = req.scope.resolve(serviceName)
        if (service) {
          availableServices.push(serviceName)
          serviceInfo[serviceName] = {
            methods: Object.getOwnPropertyNames(Object.getPrototypeOf(service)),
            type: typeof service
          }
        }
      } catch (error) {
        console.log(`Service ${serviceName} not available:`, error.message)
      }
    }

    // Try to get the main product service
    const productService = req.scope.resolve("productService")

    if (!productService) {
      throw new Error("Product service not found")
    }

    console.log("Product service found!")
    console.log("Available methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(productService)))

    res.json({
      success: true,
      message: "Service check completed",
      availableServices,
      serviceInfo,
      productServiceMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(productService))
    })

  } catch (error: any) {
    console.error("Error during service check:", error)
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred",
      stack: error.stack
    })
  }
}
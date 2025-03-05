import Medusa from "@medusajs/medusa-js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Custom type to handle missing TypeScript definitions
type CustomAdminProductsResource = {
  batchVariantInventoryItems: (
    productId: string,
    updates: {
      create?: Array<{
        inventory_item_id: string
        variant_id: string
        required_quantity: number
      }>
      update?: Array<{
        inventory_item_id: string
        variant_id: string
        required_quantity: number
      }>
      delete?: Array<{
        inventory_item_id: string
        variant_id: string
      }>
    }
  ) => Promise<{
    created: any[]
    updated: any[]
    deleted: any[]
  }>
}

const medusa = new Medusa({ 
  baseUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000", 
  maxRetries: 3, 
  apiKey: process.env.MEDUSA_API_KEY || "test"
})

// Cast the products resource to include our custom method
const adminProducts = medusa.admin.products as unknown as CustomAdminProductsResource

async function listProducts() {
  try {
    const { products } = await medusa.admin.products.list({
      expand: "variants"
    })

    console.log("\nAvailable Products and Variants:")
    console.log("-------------------------------")
    
    products.forEach(product => {
      console.log(`\nProduct: ${product.title} (${product.id})`)
      if (product.variants && product.variants.length > 0) {
        console.log("Variants:")
        product.variants.forEach(variant => {
          const inventoryItemId = variant.inventory_items?.[0]?.id || 'No inventory item'
          console.log(`- Variant ID: ${variant.id}`)
          console.log(`  SKU: ${variant.sku || 'No SKU'}`)
          console.log(`  Inventory Item ID: ${inventoryItemId}`)
        })
      } else {
        console.log("No variants found for this product")
      }
    })

    return products
  } catch (error) {
    console.error("Error listing products:", error)
    return null
  }
}

async function updateInventory(productId: string, updates: {
  create?: Array<{
    inventory_item_id: string
    variant_id: string
    required_quantity: number
  }>
  update?: Array<{
    inventory_item_id: string
    variant_id: string
    required_quantity: number
  }>
  delete?: Array<{
    inventory_item_id: string
    variant_id: string
  }>
}) {
  try {
    const result = await adminProducts.batchVariantInventoryItems(productId, updates)

    console.log("\nInventory Update Results:")
    console.log("------------------------")
    console.log("Created:", result.created)
    console.log("Updated:", result.updated)
    console.log("Deleted:", result.deleted)

    return result
  } catch (error) {
    console.error("Error updating inventory:", error)
    return null
  }
}

async function main() {
  try {
    // First, list all products and variants
    const products = await listProducts()
    
    if (!products) {
      throw new Error("Failed to fetch products")
    }

    console.log("\nTo update inventory, use the updateInventory function with:")
    console.log("- Product ID from the list above")
    console.log("- Update object containing create, update, and/or delete arrays")
    console.log("\nExample:")
    console.log(`
updateInventory("product_id", {
  create: [{
    inventory_item_id: "iitem_id",
    variant_id: "variant_id",
    required_quantity: 10
  }],
  update: [{
    inventory_item_id: "iitem_id",
    variant_id: "variant_id",
    required_quantity: 20
  }],
  delete: [{
    inventory_item_id: "iitem_id",
    variant_id: "variant_id"
  }]
})`)
    
  } catch (error) {
    console.error("Error in main:", error)
    process.exit(1)
  }
}


main()

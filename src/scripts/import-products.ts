import fs from "fs"
import { resolve } from "path"
import { 
  loadContainer,
} from "@medusajs/framework/modules/container"
import { createRegistry } from "@medusajs/framework/modules/registry"

interface CSVProduct {
  title: string
  description: string
  handle?: string
  variant_title?: string
  variant_sku?: string
  price?: string
  inventory_quantity?: string
  collection?: string
}

async function readCSV(filePath: string): Promise<CSVProduct[]> {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const products: CSVProduct[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const values = lines[i].split(',').map(v => v.trim())
    const product: any = {}
    headers.forEach((header, index) => {
      product[header.toLowerCase().replace(/\s+/g, '_')] = values[index]
    })
    products.push(product)
  }

  return products
}

export default async function (): Promise<void> {
  try {
    console.log("Starting product import...")

    // Initialize container
    const container = await loadContainer({
      directory: process.cwd(),
      containerConfig: {},
    })

    // Get the registry
    const registry = createRegistry({
      container,
    })

    // Get required services
    const productService = registry.resolve("productService")
    const variantService = registry.resolve("productVariantService")
    const collectionService = registry.resolve("productCollectionService")

    // Read CSV file
    const products = await readCSV(resolve(__dirname, "../../medusa_products.csv"))
    console.log(`Found ${products.length} products to import`)

    // Process each product
    for (const csvProduct of products) {
      try {
        if (!csvProduct.title) {
          console.log("Skipping product with no title")
          continue
        }

        // Create product
        const product = await productService.create({
          title: csvProduct.title,
          description: csvProduct.description || "",
          handle: csvProduct.handle,
          status: "draft",
          options: [{ title: "Size" }],
        })

        // Create variant if variant data exists
        if (csvProduct.variant_title || csvProduct.variant_sku) {
          await variantService.create(product.id, {
            title: csvProduct.variant_title || "Default Variant",
            sku: csvProduct.variant_sku,
            inventory_quantity: parseInt(csvProduct.inventory_quantity || "0"),
            prices: [
              {
                currency_code: "usd",
                amount: Math.round(parseFloat(csvProduct.price || "0") * 100)
              }
            ],
            options: [{ value: "Default" }]
          })
        }

        // Add to collection if specified
        if (csvProduct.collection) {
          const collections = await collectionService.list({ title: csvProduct.collection })
          let collection = collections[0]
          
          if (!collection) {
            collection = await collectionService.create({ title: csvProduct.collection })
          }

          await productService.addToCollection(product.id, collection.id)
        }

        console.log(`Imported product: ${csvProduct.title}`)
      } catch (error: any) {
        console.error(
          "Error processing product:",
          csvProduct.title,
          error.response?.data || error.message
        )
      }
    }

    console.log("Import completed successfully!")
  } catch (error: any) {
    console.error(
      "Error during import:",
      error.response?.data || error.message
    )
    throw error
  }
}
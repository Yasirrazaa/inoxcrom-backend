import { DataSource } from "typeorm"
import * as fs from "fs"
import { resolve } from "path"

interface Product {
  id: string
  title: string
  description: string
  handle: string
  status: string
  thumbnail: string
  options: any[]
  variants: any[]
  profile_id: string
  created_at: Date
  updated_at: Date
}

interface ProductVariant {
  id: string
  title: string
  product_id: string
  prices: any[]
  sku: string
  inventory_quantity: number
  options: any[]
  created_at: Date
  updated_at: Date
}

const seedProducts = async (dataSource: DataSource): Promise<void> => {
  // Read the CSV file
  const fileContent = fs.readFileSync(resolve(__dirname, "../../medusa_products.csv"), "utf-8")
  const lines = fileContent.split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  
  const productRepo = dataSource.getRepository("product")
  const variantRepo = dataSource.getRepository("product_variant")
  const profileRepo = dataSource.getRepository("shipping_profile")
  
  console.log("Starting product import...")
  
  // Get default shipping profile
  const defaultProfile = await profileRepo.findOne({ where: { type: "default" } })
  if (!defaultProfile) {
    throw new Error("No default shipping profile found")
  }
  
  // Process each line
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    
    const values = lines[i].split(',').map(v => v.trim())
    const data: Record<string, string> = {}
    
    headers.forEach((header, index) => {
      data[header.toLowerCase().replace(/\s+/g, '_')] = values[index]
    })
    
    try {
      if (!data.product_title && !data.title) {
        console.log("Skipping row - no product title found")
        continue
      }

      // Create the product
      const product = await productRepo.save({
        title: data.product_title || data.title,
        description: data.product_description || data.description || "",
        handle: data.product_handle || data.handle,
        is_giftcard: false,
        status: "draft",
        thumbnail: data.product_thumbnail || data.thumbnail,
        profile_id: defaultProfile.id,
        options: [{ title: "Size" }]
      })
      
      // Create the variant
      const variant = await variantRepo.save({
        title: data.variant_title || "Default Variant",
        product_id: product.id,
        sku: data.variant_sku,
        inventory_quantity: parseInt(data.variant_inventory_quantity || "0"),
        prices: [
          {
            currency_code: "usd",
            amount: Math.round(parseFloat(data.price_usd || "0") * 100)
          },
          {
            currency_code: "eur",
            amount: Math.round(parseFloat(data.price_eur || "0") * 100)
          }
        ],
        options: [{ value: data.option_1_value || "Default" }]
      })
      
      console.log(`Imported product: ${product.title}`)
    } catch (error) {
      console.error(`Error importing product at line ${i + 1}:`, error.message)
    }
  }
  
  console.log("Product import completed!")
}

export default async function (): Promise<void> {
  const dataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [
      resolve(__dirname, "../../node_modules/@medusajs/medusa/dist/models/*.js")
    ],
    logging: true
  })
  
  await dataSource.initialize()
  
  try {
    await seedProducts(dataSource)
  } catch (error) {
    console.error("Error during seeding:", error)
    throw error
  } finally {
    await dataSource.destroy()
  }
}
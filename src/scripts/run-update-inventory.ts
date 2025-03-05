import Medusa from "@medusajs/medusa-js"

const medusa = new Medusa({ baseUrl: "http://localhost:9000", maxRetries: 3 })

async function updateInventoryAndLinkProducts() {
  try {
    // Step 1: Authenticate (replace with your actual credentials)
    await medusa.admin.auth.createSession({
email: "admin@medusa-test.com",
password: "supersecret"
    })

    // Step 2: Get all products
    const { products } = await medusa.admin.products.list()

    // Step 3: Get or create a stock location
    let location
    const { stock_locations } = await medusa.admin.stockLocations.list()
    if (stock_locations.length > 0) {
      location = stock_locations[0]
    } else {
      const { stock_location } = await medusa.admin.stockLocations.create({
        name: "Main Warehouse"
      })
      location = stock_location
    }

    // Step 4: Update inventory for each product variant
    for (const product of products) {
      for (const variant of product.variants) {
        // Create or update inventory item
        const { inventory_item } = await medusa.admin.inventoryItems.create({
          sku: variant.sku,
          origin_country: "us",
          hs_code: "123456",
          mid_code: "123",
          material: "cotton",
          weight: 100,
          length: 10,
          height: 10,
          width: 10,
          title: `${product.title} - ${variant.title}`,
          description: "Product description",
          thumbnail: "https://example.com/thumbnail.jpg",
        })

        // Create or update inventory level
        await medusa.admin.inventoryItems.createLocationLevel(inventory_item.id, {
          location_id: location.id,
          stocked_quantity: 10, // Set your desired quantity
        })

        console.log(`Updated inventory for ${product.title} - ${variant.title}`)
      }
    }

    console.log("Inventory update complete!")
  } catch (error) {
    console.error("Error updating inventory:", error)
  }
}

updateInventoryAndLinkProducts()
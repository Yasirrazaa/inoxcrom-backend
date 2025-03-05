import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ExecArgs } from "@medusajs/framework/types"
import { DataSource } from "typeorm"

export default async function deleteProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const dataSource: DataSource = container.resolve("database")

  try {
    logger.info("Starting to delete products and related data...")

    await dataSource.transaction(async (manager) => {
      // Delete in correct order to handle foreign key constraints
      logger.info("Deleting money amounts...")
      await manager.query("DELETE FROM money_amount WHERE variant_id IN (SELECT id FROM product_variant)")
      
      logger.info("Deleting variants...")
      await manager.query("DELETE FROM product_variant")
      
      logger.info("Deleting options...")
      await manager.query("DELETE FROM product_option_value")
      await manager.query("DELETE FROM product_option")
      
      logger.info("Deleting related data...")
      await manager.query("DELETE FROM product_tag")
      await manager.query("DELETE FROM product_image")
      await manager.query("DELETE FROM product_collection_product")
      await manager.query("DELETE FROM product_category_product")
      
      logger.info("Deleting products...")
      await manager.query("DELETE FROM product")
    })

    logger.info("Successfully deleted all products and related data")
    return { success: true, message: "All products deleted successfully" }
  } catch (error) {
    logger.error("Error deleting products:", error)
    throw error
  }
}

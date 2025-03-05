import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { deletePaymentSessionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function deletePaymentSession({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    logger.info("Starting payment session deletion...")
    
    // Run the delete payment sessions workflow
    const { result } = await deletePaymentSessionsWorkflow(container).run({
      input: {
        ids: ["payses_01JNH19FEJRSM092JJEM9G5H5W"] // Replace with actual session ID or get from args
      }
    })

    logger.info("Successfully deleted payment session:")
    return { success: true, message: "Payment session deleted successfully" }
  } catch (error) {
    logger.error("Error deleting payment session:", error)
    throw error
  }
}
import CustomerModel from "../models/Customer.js";
import ServiceProviderModel from "../models/ServiceProvider.js";

export const getAnalytics = async (req, res) => {
  try {
    // Get customer and service provider counts in parallel
    const [totalCustomers, totalServiceProviders] = await Promise.all([
      CustomerModel.countDocuments({ role: "customer" }),
      ServiceProviderModel.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalServiceProviders
      }
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics data",
      error: error.message
    });
  }
}; 
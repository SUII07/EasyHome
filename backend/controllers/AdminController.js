import ServiceProviderModel from "../models/ServiceProvider.js";
import CustomerModel from "../models/Customer.js";

// Get pending service provider requests
export const getPendingProviders = async (req, res) => {
  try {
    const pendingProviders = await ServiceProviderModel.find(
      { verificationStatus: "pending" },
<<<<<<< HEAD
      "fullName email phoneNumber serviceType price createdAt"
=======
      "FullName Email PhoneNumber serviceType price createdAt"
>>>>>>> bac57379d8024ffd9c5f0dc786aa7042a3207979
    ).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      providers: pendingProviders
    });
  } catch (error) {
    console.error("Error fetching pending providers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending providers",
      error: error.message
    });
  }
};

// Approve service provider
export const approveProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const provider = await ServiceProviderModel.findById(providerId);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found"
      });
    }

    if (provider.verificationStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Provider is not in pending status"
      });
    }

    provider.verificationStatus = "approved";
    provider.isVerified = true;
    await provider.save();

    res.status(200).json({
      success: true,
      message: "Service provider approved successfully",
      provider
    });
  } catch (error) {
    console.error("Error approving provider:", error);
    res.status(500).json({
      success: false,
      message: "Error approving provider",
      error: error.message
    });
  }
};

// Reject service provider
export const rejectProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const provider = await ServiceProviderModel.findById(providerId);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found"
      });
    }

    if (provider.verificationStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Provider is not in pending status"
      });
    }

    provider.verificationStatus = "rejected";
    await provider.save();

    res.status(200).json({
      success: true,
      message: "Service provider rejected successfully",
      provider
    });
  } catch (error) {
    console.error("Error rejecting provider:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting provider",
      error: error.message
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Try to delete from both collections
    const [customerResult, providerResult] = await Promise.all([
      CustomerModel.findByIdAndDelete(userId),
      ServiceProviderModel.findByIdAndDelete(userId)
    ]);

    if (!customerResult && !providerResult) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

// Delete service provider
export const deleteServiceProvider = async (req, res) => {
  try {
    const { id } = req.params;
    
    const provider = await ServiceProviderModel.findByIdAndDelete(id);
    
    if (!provider) {
      return res.status(404).json({ 
        success: false,
        message: "Service provider not found" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Service provider deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting service provider:", error);
    res.status(500).json({ 
      success: false,
      message: "Error deleting service provider", 
      error: error.message 
    });
  }
};

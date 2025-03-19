import AdminModel from "../models/admin.js";
import CustomerModel from "../models/Customer.js";
import ServiceProviderModel from "../models/ServiceProvider.js";

// Get all users
export const Getuser = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { FullName: { $regex: search, $options: "i" } },
        { Email: { $regex: search, $options: "i" } },
        { PhoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    const users = await ServiceProviderModel.find(query);
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Delete user
export const deletUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await ServiceProviderModel.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

// Get user counts
export const GetUserCounts = async (req, res) => {
  try {
    const customerCount = await CustomerModel.countDocuments();
    const serviceProviderCount = await ServiceProviderModel.countDocuments();
    res.json({ customerCount, serviceProviderCount });
  } catch (error) {
    console.error("Error fetching user counts:", error);
    res.status(500).json({ message: "Error fetching user counts" });
  }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await CustomerModel.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ customer });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Error fetching customer" });
  }
};

// Get service provider by ID
export const getServiceProviderById = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await ServiceProviderModel.findById(id);
    if (!provider) {
      return res.status(404).json({ message: "Service provider not found" });
    }
    res.json({ provider });
  } catch (error) {
    console.error("Error fetching service provider:", error);
    res.status(500).json({ message: "Error fetching service provider" });
  }
};

// Update a service provider by ID
export const updateServiceProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the service provider
    const provider = await ServiceProviderModel.findById(id);
    if (!provider) {
      return res.status(404).json({ message: "Service provider not found" });
    }

    // Update the provider's details
    Object.keys(updates).forEach((key) => {
      if (key !== "password") {
        // Don't update password through this endpoint
        provider[key] = updates[key];
      }
    });

    // Save the updated provider
    const updatedProvider = await provider.save();

    res.json({
      message: "Service provider updated successfully",
      provider: updatedProvider,
    });
  } catch (error) {
    console.error("Error updating service provider:", error);
    res
      .status(500)
      .json({ message: "Error updating service provider", error: error.message });
  }
};
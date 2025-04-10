import AdminModel from "../models/admin.js";
import CustomerModel from "../models/Customer.js";
import ServiceProviderModel from "../models/ServiceProvider.js";

// Get all users
export const Getuser = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { FullName: { $regex: search, $options: "i" } },
        { Email: { $regex: search, $options: "i" } },
        { PhoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    let users;
    if (role === "customer") {
      users = await CustomerModel.find(query).select('-password');
    } else if (role === "serviceprovider") {
      users = await ServiceProviderModel.find(query).select('-password');
    } else {
      // If no role specified, fetch both customers and service providers
      const [customers, serviceProviders] = await Promise.all([
        CustomerModel.find(query).select('-password'),
        ServiceProviderModel.find(query).select('-password')
      ]);
      users = [...customers, ...serviceProviders];
    }

    // Transform the data to ensure consistent field names
    const transformedUsers = users.map(user => ({
      _id: user._id,
      FullName: user.FullName || user.fullName,
      Email: user.Email || user.email,
      PhoneNumber: user.PhoneNumber || user.phoneNumber,
      Address: user.Address || user.address,
      role: user.role || (role === "customer" ? "customer" : "serviceprovider"),
      verificationStatus: user.verificationStatus || "approved",
      createdAt: user.createdAt,
      serviceType: user.serviceType,
      price: user.price,
      rating: user.rating
    }));

    res.json({ users: transformedUsers });
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

// Update a customer by ID
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the customer
    const customer = await CustomerModel.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Update the customer's details
    Object.keys(updates).forEach((key) => {
      if (key !== "password") {
        // Don't update password through this endpoint
        customer[key] = updates[key];
      }
    });

    // Save the updated customer
    const updatedCustomer = await customer.save();

    res.json({
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res
      .status(500)
      .json({ message: "Error updating customer", error: error.message });
  }
};

// Get admin profile by ID
export const getAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the admin
    const admin = await AdminModel.findById(id).select('-password');
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: "Admin not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      admin
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching admin profile", 
      error: error.message 
    });
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the admin
    const admin = await AdminModel.findById(id);
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: "Admin not found" 
      });
    }

    // Update the admin's details
    Object.keys(updates).forEach((key) => {
      if (key !== "password" && key !== "role") {
        // Don't update password or role through this endpoint
        admin[key] = updates[key];
      }
    });

    // Save the updated admin
    const updatedAdmin = await admin.save();
    
    // Remove password from response
    const adminResponse = updatedAdmin.toObject();
    delete adminResponse.password;

    res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      admin: adminResponse
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({ 
      success: false,
      message: "Error updating admin profile", 
      error: error.message 
    });
  }
};

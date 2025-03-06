import AdminModel from "../models/admin.js";
import CustomerModel from "../models/Customer.js";
import ServiceProviderModel from "../models/ServiceProvider.js";

// Fetch users based on role with pagination and search
const Getuser = async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search = "" } = req.query; // Default values
    const skip = (page - 1) * limit;

    // Create a search query object
    const searchQuery = search ? { FullName: { $regex: search, $options: "i" } } : {};

    let users;
    let totalUsers;

    if (role === "admin") {
      users = await AdminModel.find(searchQuery).skip(skip).limit(limit);
      totalUsers = await AdminModel.countDocuments(searchQuery);
    } else if (role === "customer") {
      users = await CustomerModel.find(searchQuery).skip(skip).limit(limit);
      totalUsers = await CustomerModel.countDocuments(searchQuery);
    } else if (role === "serviceprovider") {
      users = await ServiceProviderModel.find(searchQuery).skip(skip).limit(limit);
      totalUsers = await ServiceProviderModel.countDocuments(searchQuery);
    } else {
      // Fetch all users from all collections with pagination and search
      const [admins, customers, serviceProviders] = await Promise.all([
        AdminModel.find(searchQuery).skip(skip).limit(limit),
        CustomerModel.find(searchQuery).skip(skip).limit(limit),
        ServiceProviderModel.find(searchQuery).skip(skip).limit(limit),
      ]);
      users = [...admins, ...customers, ...serviceProviders];
      totalUsers = await Promise.all([
        AdminModel.countDocuments(searchQuery),
        CustomerModel.countDocuments(searchQuery),
        ServiceProviderModel.countDocuments(searchQuery),
      ]).then(([adminCount, customerCount, serviceProviderCount]) => adminCount + customerCount + serviceProviderCount);
    }

    res.status(200).json({ users, totalUsers, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a user (service provider or customer)
const deletUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the user is an admin
    const admin = await AdminModel.findById(userId);
    if (admin) {
      return res.status(409).json({ message: "Admin cannot delete own account" });
    }

    // Check if the user is a customer
    const customer = await CustomerModel.findByIdAndDelete(userId);
    if (customer) {
      return res.status(200).json({ message: "Customer Deleted Successfully", user: customer });
    }

    // Check if the user is a service provider
    const serviceProvider = await ServiceProviderModel.findByIdAndDelete(userId);
    if (serviceProvider) {
      return res.status(200).json({ message: "Service Provider Deleted Successfully", user: serviceProvider });
    }

    // If no user is found
    res.status(404).json({ message: "User Not Found" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user counts (customers and service providers)
const GetUserCounts = async (req, res) => {
  try {
    const [customerCount, serviceProviderCount] = await Promise.all([
      CustomerModel.countDocuments({}),
      ServiceProviderModel.countDocuments({}),
    ]);
    res.status(200).json({ customerCount, serviceProviderCount });
  } catch (error) {
    console.error("Error fetching user counts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch a single customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await CustomerModel.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ customer });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch a single service provider by ID
const getServiceProviderById = async (req, res) => {
  try {
    const serviceProvider = await ServiceProviderModel.findById(req.params.id);
    if (!serviceProvider) {
      return res.status(404).json({ message: "Service Provider not found" });
    }
    res.status(200).json({ serviceProvider });
  } catch (error) {
    console.error("Error fetching service provider:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Export all functions
export { Getuser, deletUser, GetUserCounts, getCustomerById, getServiceProviderById };
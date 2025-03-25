import express from "express";
import { verifyToken, isCustomer } from "../middleware/verifyToken.js";
import {
  getUser,
  updateUser,
  deleteUser
} from "../controllers/Auth.js";

const CustomerRoutes = express.Router();

// Get customer profile
CustomerRoutes.get("/profile", verifyToken, isCustomer, getUser);

// Update customer profile
CustomerRoutes.put("/profile", verifyToken, isCustomer, updateUser);

// Delete customer account
CustomerRoutes.delete("/profile", verifyToken, isCustomer, deleteUser);

export default CustomerRoutes; 
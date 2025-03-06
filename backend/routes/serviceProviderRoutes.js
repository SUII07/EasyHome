import express from "express";
import ServiceProvider from "../models/ServiceProvider.js";

const router = express.Router();

// Fetch service providers by service type
router.post("/getPrice", async (req, res) => {
  const { serviceType } = req.body;

  try {
    const providers = await ServiceProvider.find({ serviceType });
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching service providers", error });
  }
});

export default router;
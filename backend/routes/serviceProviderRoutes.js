import express from 'express';
import ServiceProvider from "../models/ServiceProvider.js";

const router = express.Router();

router.post("/create", async (req, res) => {
    try {
      const { fullName, address, phoneNumber, serviceType, description } = req.body;
  
      const newRequest = new ServiceProvider({
        fullName,
        address,
        phoneNumber,
        serviceType,
        description
      });
  
      await newRequest.save();
      res.status(201).json({ message: "Service request created successfully!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.get("/requests", async (req, res) => {
    try {
      const requests = await ServiceProvider.find();
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

export default router;
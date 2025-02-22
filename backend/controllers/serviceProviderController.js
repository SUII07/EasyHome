import ServiceProvider from '../models/ServiceProvider.js';

const getServiceProviders = async (req, res) => {
  const { service, address } = req.body;

  try {
    const providers = await ServiceProvider.find({
      serviceType: service,
      location: address,
    });

    res.status(200).json({ providers });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export { getServiceProviders };
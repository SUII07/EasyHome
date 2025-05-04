import { processGeocoding } from '../utils/geocoding.js';
import { logger } from '../utils/logger.js';

export const register = async (req, res) => {
  try {
    const { role } = req.body;
    let user;

    if (role === 'serviceprovider') {
      user = new ServiceProvider(req.body);
    } else {
      user = new Customer(req.body);
    }

    await user.save();

    // Process geocoding asynchronously
    processGeocoding(user.constructor, user)
      .catch(error => {
        logger.error(`Error in geocoding process for ${user.constructor.modelName} ${user._id}:`, error);
      });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 
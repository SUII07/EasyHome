import { OpenLocationCode } from 'open-location-code';
import { logger } from './logger.js';

const olc = new OpenLocationCode();

// Rate limiting configuration
const RATE_LIMIT = 1; // requests per second
const requestQueue = [];
let lastRequestTime = 0;

// Function to handle rate limiting
const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const minTimeBetweenRequests = 1000 / RATE_LIMIT;

  if (timeSinceLastRequest < minTimeBetweenRequests) {
    const waitTime = minTimeBetweenRequests - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();
};

// Function to geocode an address
export const geocodeAddress = async (address) => {
  try {
    // Encode the address for URL
    const encodedAddress = encodeURIComponent(address);
    
    // Make request to Nominatim API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'EasyHome/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.error('No results found for address:', address);
      return {
        address,
        latitude: null,
        longitude: null,
        plusCode: null
      };
    }

    const { lat, lon } = data[0];
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    // Generate Plus Code
    const plusCode = olc.encode(latitude, longitude);

    return {
      address,
      latitude,
      longitude,
      plusCode
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      address,
      latitude: null,
      longitude: null,
      plusCode: null
    };
  }
};

// Function to process geocoding asynchronously
export const processGeocoding = async (model, document) => {
  try {
    const location = await geocodeAddress(document.address);
    if (location) {
      await model.findByIdAndUpdate(document._id, { location });
      logger.info(`Successfully geocoded address for ${model.modelName} ${document._id}`);
    } else {
      logger.warn(`Failed to geocode address for ${model.modelName} ${document._id}`);
    }
  } catch (error) {
    logger.error(`Error processing geocoding for ${model.modelName} ${document._id}:`, error.message);
  }
}; 
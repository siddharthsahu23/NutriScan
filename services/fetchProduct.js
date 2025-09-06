const axios = require('axios');

/**
 * Fetches product data from OpenFoodFacts API
 * @param {string} barcode - The product barcode (EAN-13 or UPC)
 * @returns {Promise<Object|null>} Product data or null if not found
 */
async function fetchProductData(barcode) {
  try {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    console.log(`🔍 Searching for product with barcode: ${barcode}...`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'NutriScan-AI/1.0'
      }
    });

    if (response.data.status === 1 && response.data.product) {
      console.log('✅ Product found successfully!');
      return response.data.product;
    } else {
      console.log('❌ Product not found in OpenFoodFacts database');
      return null;
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please check your internet connection');
    } else if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('Network error - unable to reach OpenFoodFacts API');
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
}

/**
 * Validates barcode format (basic validation)
 * @param {string} barcode - The barcode to validate
 * @returns {boolean} True if valid format
 */
function validateBarcode(barcode) {
  // Remove any whitespace
  barcode = barcode.trim();
  
  // Check if it's numeric and has valid length (UPC: 12 digits, EAN-13: 13 digits)
  const isNumeric = /^\d+$/.test(barcode);
  const validLength = barcode.length === 12 || barcode.length === 13;
  
  return isNumeric && validLength;
}

module.exports = {
  fetchProductData,
  validateBarcode
};
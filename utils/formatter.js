/**
 * Formats product data for AI analysis
 * @param {Object} product - Raw product data from OpenFoodFacts
 * @returns {Object} Formatted product data
 */
function formatProductData(product) {
  return {
    name: product.product_name || product.product_name_en || 'Unknown Product',
    brand: product.brands || 'Unknown Brand',
    barcode: product.code || 'Unknown',
    ingredients: formatIngredients(product.ingredients_text || product.ingredients_text_en),
    allergens: formatAllergens(product.allergens || product.allergens_tags),
    nutrition: formatNutrition(product.nutriments),
    categories: product.categories || 'Unknown'
  };
}

/**
 * Formats ingredients text for better readability
 * @param {string} ingredients - Raw ingredients text
 * @returns {string} Formatted ingredients
 */
function formatIngredients(ingredients) {
  if (!ingredients) return 'Ingredients not available';
  
  // Clean up the ingredients text
  return ingredients
    .replace(/[_\*]/g, '') // Remove markdown formatting
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Formats allergens information
 * @param {string|Array} allergens - Raw allergens data
 * @returns {string} Formatted allergens
 */
function formatAllergens(allergens) {
  if (!allergens) return 'No allergens specified';
  
  if (Array.isArray(allergens)) {
    // Clean up allergen tags (remove 'en:' prefix)
    const cleanAllergens = allergens
      .map(allergen => allergen.replace(/^en:/, '').replace(/-/g, ' '))
      .map(allergen => allergen.charAt(0).toUpperCase() + allergen.slice(1));
    return cleanAllergens.join(', ');
  }
  
  return allergens;
}

/**
 * Formats nutrition information
 * @param {Object} nutriments - Raw nutrition data
 * @returns {string} Formatted nutrition info
 */
function formatNutrition(nutriments) {
  if (!nutriments) return 'Nutrition information not available';
  
  const nutritionInfo = [];
  
  // Key nutrition facts to include
  const keyNutrients = [
    { key: 'energy-kcal_100g', label: 'Energy', unit: 'kcal/100g' },
    { key: 'fat_100g', label: 'Fat', unit: 'g/100g' },
    { key: 'saturated-fat_100g', label: 'Saturated Fat', unit: 'g/100g' },
    { key: 'sugars_100g', label: 'Sugars', unit: 'g/100g' },
    { key: 'salt_100g', label: 'Salt', unit: 'g/100g' },
    { key: 'sodium_100g', label: 'Sodium', unit: 'g/100g' },
    { key: 'proteins_100g', label: 'Proteins', unit: 'g/100g' },
    { key: 'fiber_100g', label: 'Fiber', unit: 'g/100g' }
  ];
  
  keyNutrients.forEach(nutrient => {
    if (nutriments[nutrient.key] !== undefined && nutriments[nutrient.key] !== '') {
      nutritionInfo.push(`${nutrient.label}: ${nutriments[nutrient.key]} ${nutrient.unit}`);
    }
  });
  
  return nutritionInfo.length > 0 ? nutritionInfo.join(', ') : 'Limited nutrition data available';
}

/**
 * Formats the final report for display
 * @param {Object} productData - Formatted product data
 * @param {Object} analysis - AI analysis result
 * @returns {string} Formatted report
 */
function formatReport(productData, analysis) {
  const scoreEmoji = getScoreEmoji(analysis.healthScore);
  const scoreColor = getScoreColor(analysis.healthScore);
  
  return `
🔍 FOOD BARCODE ANALYSIS REPORT
==================================================
📦 PRODUCT INFORMATION
   Name: ${productData.name}
   Brand: ${productData.brand}
   Barcode: ${productData.barcode}

🛡️ SAFETY ASSESSMENT
   Overall Health Score: ${analysis.healthScore}/10 ${scoreEmoji}
   (${scoreColor})
   ⚠️ Warnings:
${analysis.warnings.map(warning => `      • ${warning}`).join('\n')}
   💡 Recommendations:
${analysis.recommendations.map(rec => `      • ${rec}`).join('\n')}

🧪 INGREDIENT ANALYSIS
   📋 Main Ingredients:
${analysis.mainIngredients.map(ingredient => `      • ${ingredient.trim()}`).join('\n')}
   🚨 Allergens:
${analysis.allergens.map(allergen => `      • ${allergen.trim()}`).join('\n')}

🤖 AI ANALYSIS SUMMARY
   ${analysis.summary}

==================================================
`;
}

/**
 * Gets emoji based on health score
 * @param {number} score - Health score (0-10)
 * @returns {string} Appropriate emoji
 */
function getScoreEmoji(score) {
  if (score >= 7) return '🟢';
  if (score >= 4) return '🟠';
  return '🔴';
}

/**
 * Gets color description based on health score
 * @param {number} score - Health score (0-10)
 * @returns {string} Color description
 */
function getScoreColor(score) {
  if (score >= 7) return '🟢 healthy 7–10';
  if (score >= 4) return '🟠 moderate 4–6';
  return '🔴 unhealthy 0–3';
}

module.exports = {
  formatProductData,
  formatReport
};
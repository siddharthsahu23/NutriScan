const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Analyzes product data using Google Gemini API
 * @param {Object} productData - Formatted product data
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<Object>} AI analysis result
 */
async function analyzeWithGemini(productData, apiKey) {
  const prompt = createAnalysisPrompt(productData);
  
  try {
    console.log('🤖 Analyzing product with AI...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();
    
    try {
      // Try to parse as JSON first
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON found, create a fallback response
      return createFallbackResponse(aiResponse, productData);
    } catch (parseError) {
      console.log('⚠️ AI response parsing failed, creating fallback...');
      return createFallbackResponse(aiResponse, productData);
    }

  } catch (error) {
    if (error.message && error.message.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Gemini API key. Please check your API key configuration');
    } else if (error.message && error.message.includes('RATE_LIMIT_EXCEEDED')) {
      throw new Error('Gemini API rate limit exceeded. Please try again later');
    } else if (error.message && error.message.includes('timeout')) {
      throw new Error('AI analysis timeout - please try again');
    } else {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }
}

/**
 * Creates the analysis prompt for the AI
 * @param {Object} productData - Formatted product data
 * @returns {string} The prompt string
 */
function createAnalysisPrompt(productData) {
  return `
Please analyze this food product and provide a health assessment. Return your response as a JSON object with the following structure:

{
  "healthScore": 7,
  "warnings": ["High sodium content", "Contains artificial preservatives"],
  "recommendations": ["Consume in moderation", "Consider low-sodium alternatives"],
  "mainIngredients": ["Wheat flour", "Sugar", "Salt"],
  "allergens": ["Gluten", "May contain nuts"],
  "summary": "This product is moderately healthy but should be consumed in moderation due to high sodium content."
}

Product Information:
- Name: ${productData.name}
- Brand: ${productData.brand}
- Ingredients: ${productData.ingredients}
- Allergens: ${productData.allergens}
- Nutrition Facts: ${productData.nutrition}

Please provide:
1. A health score from 0-10 (0=very unhealthy, 10=very healthy)
2. Specific warnings about concerning ingredients or nutritional aspects
3. Practical recommendations for consumers
4. List of main ingredients (simplified, top 5-7)
5. List of allergens present
6. A 2-3 sentence summary of the overall health assessment

Focus on practical consumer advice based on ingredients, additives, nutritional content, and potential health impacts.
`;
}

/**
 * Creates a fallback response when AI parsing fails
 * @param {string} aiResponse - Raw AI response
 * @param {Object} productData - Product data
 * @returns {Object} Fallback analysis object
 */
function createFallbackResponse(aiResponse, productData) {
  // Extract basic info and create a simple analysis
  const ingredients = productData.ingredients ? productData.ingredients.split(',').slice(0, 5) : ['Not available'];
  const allergens = productData.allergens ? productData.allergens.split(',') : ['Not specified'];
  
  return {
    healthScore: 5,
    warnings: ['Unable to perform detailed analysis', 'Please review ingredients manually'],
    recommendations: ['Check product labels carefully', 'Consult nutrition information'],
    mainIngredients: ingredients,
    allergens: allergens,
    summary: 'AI analysis partially available. Please review product information manually for detailed assessment.'
  };
}

module.exports = {
  analyzeWithGemini
};
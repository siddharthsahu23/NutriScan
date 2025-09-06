#!/usr/bin/env node

require('dotenv').config();
const express = require('express');
const path = require('path');
const { fetchProductData, validateBarcode } = require('./services/fetchProduct');
const { analyzeWithGemini } = require('./services/analyzeAI');
const { formatProductData } = require('./utils/formatter');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('.', {
    setHeaders: (res, path) => {
        // Disable caching for development
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
}));

// CORS middleware for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Serve the main web app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for barcode analysis
app.get('/api/analyze', async (req, res) => {
    const { barcode } = req.query;
    
    console.log(`📱 Web API request for barcode: ${barcode}`);
    
    try {
        // Validate barcode format
        if (!barcode || !validateBarcode(barcode)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid barcode format. Please provide a 12 or 13 digit barcode.'
            });
        }
        
        // Check for API key
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ Gemini API key not found');
            return res.status(500).json({
                success: false,
                message: 'AI service configuration error. Please contact support.'
            });
        }
        
        // Fetch product data from OpenFoodFacts
        console.log('🔍 Fetching product data...');
        const productData = await fetchProductData(barcode);
        
        if (!productData) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in our database. This could be a new product or the barcode might be incorrect.'
            });
        }
        
        // Format product data
        console.log('📋 Formatting product data...');
        const formattedData = formatProductData(productData);
        
        // Analyze with AI
        console.log('🤖 Running AI analysis...');
        const analysis = await analyzeWithGemini(formattedData, process.env.GEMINI_API_KEY);
        
        // Return structured response
        const report = {
            productData: {
                name: formattedData.name,
                brand: formattedData.brand,
                barcode: formattedData.barcode
            },
            healthScore: analysis.healthScore,
            warnings: analysis.warnings,
            recommendations: analysis.recommendations,
            mainIngredients: analysis.mainIngredients,
            allergens: analysis.allergens,
            summary: analysis.summary
        };
        
        console.log('✅ Analysis complete, sending response');
        
        res.json({
            success: true,
            report: report
        });
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
        
        let errorMessage = 'An error occurred during analysis. Please try again.';
        let statusCode = 500;
        
        if (error.message.includes('timeout')) {
            errorMessage = 'Analysis timeout. Please try again.';
            statusCode = 408;
        } else if (error.message.includes('API key')) {
            errorMessage = 'AI service unavailable. Please try again later.';
            statusCode = 503;
        } else if (error.message.includes('Network')) {
            errorMessage = 'Network error. Please check your connection.';
            statusCode = 503;
        }
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'NutriScan AI API',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Handle 404 for otherr routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// error handling middleware
app.use((error, req, res, next) => {
    console.error('Server Error:', error.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🌟 NutriScan AI Web Server Started!`);
    console.log(`=====================================`);
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`📱 Web App: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/analyze?barcode=XXXXXX`);
    console.log(`✨ Ready to analyze food products!\n`);
});

// shutdown
process.on('SIGINT', () => {
    console.log('\n👋 NutriScan AI server shutting down...');
    process.exit(0);
});

module.exports = app;
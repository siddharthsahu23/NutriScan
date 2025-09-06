class NutriScanApp {
    constructor() {
        this.html5QrCode = null;
        this.currentScreen = 'home-screen';
        this.isScanning = false;
        this.apiBaseUrl = window.location.origin; 
        
        this.initializeApp();
    }

    initializeApp() {
        console.log('NutriScan AI initialized');
        this.showScreen('home-screen');
        
        // Add event listeners
        this.addEventListeners();
    }

    addEventListeners() {
        // Manual barcode input
        const barcodeInput = document.getElementById('barcode-input');
        if (barcodeInput) {
            barcodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.analyzeManualBarcode();
                }
            });
            
            // Auto-format input (numbers only)
            barcodeInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }
    }

    // Screen Management
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    showHomeScreen() {
        this.stopScanning();
        this.showScreen('home-screen');
    }

    showManualEntry() {
        this.showScreen('manual-screen');
        setTimeout(() => {
            document.getElementById('barcode-input').focus();
        }, 300);
    }

    // Barcode Scanner Functions
    async startScanning() {
        this.showScreen('scanner-screen');
        
        try {
            // Check if we're on HTTPS or localhost (required for camera access)
            if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                this.showError('Security Error', 'Camera access requires HTTPS or localhost. Please use manual entry instead.');
                return;
            }
            
            // Request camera permissions first
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(track => track.stop()); // Stop the test stream
            } catch (permissionError) {
                console.error('Camera permission denied:', permissionError);
                this.showError('Permission Denied', 'Camera access was denied. Please allow camera permissions and try again, or use manual entry.');
                return;
            }
            
            // Get available cameras
            const devices = await Html5Qrcode.getCameras();
            console.log('Available cameras:', devices);
            
            if (devices && devices.length) {
                // Prefer back camera for mobile devices (usually has index 1)
                let cameraId;
                if (devices.length > 1) {
                    // Look for back camera
                    const backCamera = devices.find(device => 
                        device.label && (
                            device.label.toLowerCase().includes('back') || 
                            device.label.toLowerCase().includes('rear') ||
                            device.label.toLowerCase().includes('environment')
                        )
                    );
                    cameraId = backCamera ? backCamera.id : devices[1].id;
                } else {
                    cameraId = devices[0].id;
                }
                
                console.log('Using camera:', cameraId);
                
                this.html5QrCode = new Html5Qrcode('scanner-reader');
                
                const qrCodeSuccessCallback = (decodedText, decodedResult) => {
                    console.log(`Barcode scanned: ${decodedText}`);
                    this.stopScanning();
                    this.analyzeBarcode(decodedText);
                };
                
                const qrCodeErrorCallback = (error) => {
                    // Don't log scanning errors as they're continuous
                };
                
                const config = {
                    fps: 10,
                    qrbox: { width: 280, height: 120 },
                    aspectRatio: 1.0,
                    supportedScanTypes: [
                        Html5QrcodeScanType.SCAN_TYPE_CODE_128,
                        Html5QrcodeScanType.SCAN_TYPE_CODE_39,
                        Html5QrcodeScanType.SCAN_TYPE_EAN_13,
                        Html5QrcodeScanType.SCAN_TYPE_EAN_8,
                        Html5QrcodeScanType.SCAN_TYPE_UPC_A,
                        Html5QrcodeScanType.SCAN_TYPE_UPC_E
                    ],
                    rememberLastUsedCamera: true,
                    showTorchButtonIfSupported: true
                };
                
                await this.html5QrCode.start(cameraId, config, qrCodeSuccessCallback, qrCodeErrorCallback);
                this.isScanning = true;
                console.log('Scanner started successfully');
                
                // Update UI to show scanning is active
                this.updateScannerUI(true);
                
            } else {
                console.error('No cameras found');
                this.showError('Camera Error', 'No cameras found on your device. Please try manual entry instead.');
            }
        } catch (err) {
            console.error('Scanner error:', err);
            
            let errorMessage = 'Unable to start camera scanner. Please try manual entry instead.';
            
            if (err.message && err.message.includes('NotAllowedError')) {
                errorMessage = 'Camera permission denied. Please allow camera access in your browser settings and try again.';
            } else if (err.message && err.message.includes('NotFoundError')) {
                errorMessage = 'No camera found on your device. Please try manual entry instead.';
            } else if (err.message && err.message.includes('NotReadableError')) {
                errorMessage = 'Camera is being used by another application. Please close other camera apps and try again.';
            }
            
            this.showError('Scanner Error', errorMessage);
        }
    }

    async stopScanning() {
        if (this.html5QrCode && this.isScanning) {
            try {
                await this.html5QrCode.stop();
                this.html5QrCode = null;
                this.isScanning = false;
                this.updateScannerUI(false);
                console.log('Scanner stopped successfully');
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
    }

    updateScannerUI(isActive) {
        const scannerInstructions = document.querySelector('.scanner-instructions');
        if (scannerInstructions) {
            if (isActive) {
                scannerInstructions.innerHTML = `
                    <p style="color: var(--success-green);"><i class="fas fa-camera"></i> Camera is active</p>
                    <p>Position the barcode within the scanning area</p>
                    <p>The barcode will be detected automatically</p>
                `;
            } else {
                scannerInstructions.innerHTML = `
                    <p>Position the barcode within the frame</p>
                    <p>Make sure the barcode is clearly visible</p>
                `;
            }
        }
    }

    // Barcode Analysis
    analyzeManualBarcode() {
        const barcodeInput = document.getElementById('barcode-input');
        const barcode = barcodeInput.value.trim();
        
        if (!barcode) {
            this.showError('Invalid Input', 'Please enter a valid barcode number.');
            return;
        }
        
        if (barcode.length < 12 || barcode.length > 13) {
            this.showError('Invalid Barcode', 'Barcode must be 12 or 13 digits long.');
            return;
        }
        
        this.analyzeBarcode(barcode);
    }

    async analyzeBarcode(barcode) {
        console.log(`Analyzing barcode: ${barcode}`);
        
        // Show loading screen with progress
        this.showLoadingWithSteps();
        
        try {
            // Step 1: Fetch product data
            this.updateLoadingStep('step-fetch', true);
            
            const response = await fetch(`${this.apiBaseUrl}/api/analyze?barcode=${barcode}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Step 2: AI Analysis (simulated progress)
            this.updateLoadingStep('step-analyze', true);
            await this.delay(1000);
            
            // Step 3: Format report
            this.updateLoadingStep('step-format', true);
            await this.delay(500);
            
            if (data.success) {
                this.displayReport(data.report);
            } else {
                this.showError('Product Not Found', data.message || 'Sorry, this product was not found in our database. Please try another barcode.');
            }
            
        } catch (error) {
            console.error('Analysis error:', error);
            
            if (error.message.includes('fetch')) {
                this.showError('Connection Error', 'Unable to connect to the analysis service. Please check your internet connection and try again.');
            } else {
                this.showError('Analysis Error', 'An error occurred while analyzing the product. Please try again.');
            }
        }
    }

    showLoadingWithSteps() {
        this.showScreen('loading-screen');
        
        // Reset all steps
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
    }

    updateLoadingStep(stepId, active) {
        const step = document.getElementById(stepId);
        if (step && active) {
            step.classList.add('active');
        }
    }

    // Report Display
    displayReport(report) {
        const reportContent = document.getElementById('report-content');
        
        // Generate health score class
        const scoreClass = report.healthScore >= 7 ? 'score-healthy' : 
                          report.healthScore >= 4 ? 'score-moderate' : 'score-unhealthy';
        
        const scoreEmoji = report.healthScore >= 7 ? '🟢' : 
                          report.healthScore >= 4 ? '🟠' : '🔴';

        const html = `
            <!-- Product Information Card -->
            <div class="report-card product-info">
                <h3><i class="fas fa-box card-icon"></i> Product Information</h3>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${report.productData.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Brand:</span>
                    <span class="info-value">${report.productData.brand}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Barcode:</span>
                    <span class="info-value">${report.productData.barcode}</span>
                </div>
            </div>

            <!-- Safety Assessment Card -->
            <div class="report-card">
                <h3><i class="fas fa-shield-alt card-icon"></i> Safety Assessment</h3>
                <div class="health-score ${scoreClass}">
                    ${scoreEmoji} ${report.healthScore}/10
                    <span style="font-size: 0.9rem; font-weight: normal; margin-left: 0.5rem;">
                        ${report.healthScore >= 7 ? 'Healthy' : report.healthScore >= 4 ? 'Moderate' : 'Unhealthy'}
                    </span>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 0.75rem; color: var(--text-secondary);">⚠️ Warnings:</h4>
                    <ul class="warnings-list">
                        ${report.warnings.map(warning => `<li>${warning}</li>`).join('')}
                    </ul>
                </div>
                
                <div>
                    <h4 style="margin-bottom: 0.75rem; color: var(--text-secondary);">💡 Recommendations:</h4>
                    <ul class="recommendations-list">
                        ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <!-- Ingredient Analysis Card -->
            <div class="report-card">
                <h3><i class="fas fa-flask card-icon"></i> Ingredient Analysis</h3>
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 0.75rem; color: var(--text-secondary);">📋 Main Ingredients:</h4>
                    <ul class="ingredients-list">
                        ${report.mainIngredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
                
                <div>
                    <h4 style="margin-bottom: 0.75rem; color: var(--text-secondary);">🚨 Allergens:</h4>
                    <ul class="allergens-list">
                        ${report.allergens.map(allergen => `<li>${allergen}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <!-- AI Analysis Summary Card -->
            <div class="report-card">
                <h3><i class="fas fa-robot card-icon"></i> AI Analysis Summary</h3>
                <div class="ai-summary">
                    ${report.summary}
                </div>
            </div>
        `;
        
        reportContent.innerHTML = html;
        this.showScreen('report-screen');
    }

    // Error Handling
    showError(title, message) {
        document.getElementById('error-title').textContent = title;
        document.getElementById('error-message').textContent = message;
        this.showScreen('error-screen');
    }

    // Utility Functions
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global Functions (called from HTML)
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new NutriScanApp();
});

function startScanning() {
    if (app) app.startScanning();
}

function stopScanning() {
    if (app) app.stopScanning();
}

function showHomeScreen() {
    if (app) app.showHomeScreen();
}

function showManualEntry() {
    if (app) app.showManualEntry();
}

function analyzeManualBarcode() {
    if (app) app.analyzeManualBarcode();
}

function analyzeBarcode(barcode) {
    if (app) app.analyzeBarcode(barcode);
}
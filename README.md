# 🍏 NutriScan App

👨‍💻 **Team:** *BachelorBytes*  
📍 *Mind-Sprint 2025 Hackathon Project*  

TEAM MEMBERS - 
● Siddharth Sahu
● Kunal Gaikwad
● Pushkar Verma
● Tanuj Ramani
● Mudit Raj Gajpal


## 📸 Smart Food Analysis with a Snap  

NutriScan AI is an intelligent mobile application designed to **demystify food nutrition labels**.  
By simply scanning a product’s barcode, users get an instant, easy-to-understand breakdown of:  

- 🥗 Nutritional content  
- ⚠️ Allergen information  
- 🤖 Personalized summary powered by **Google’s Gemini AI**  

This project was developed for a **hackathon** to solve the real-world problem of confusing and misleading food packaging, empowering users to make healthier and safer dietary choices effortlessly.  

---

## ✨ Key Features  

- 📷 **Instant Barcode Scanning** – Uses the device’s camera for fast and accurate barcode detection.  
- ⌨️ **Manual Barcode Entry** – A fallback option to type in the barcode number manually.  
- 📊 **Detailed Nutritional Report** – Displays crucial data including a health score, warnings (high sugar/fat), main ingredients, and a full allergen list.  
- 🤖 **AI-Powered Summary (Gemini API)** – After fetching raw data, the app generates a smart, human-readable summary and personalized advice.  
- 🌍 **Cross-Platform** – Built as a web application and wrapped with Capacitor to run as a native Android app.  

---

## 🛠️ Technology Stack  

- 🎨 **Frontend**: Plain **HTML, CSS, and modern JavaScript (ES6 Classes)** for a lightweight UI.  
- 📱 **Mobile Wrapper**: [Capacitor](https://capacitorjs.com/) for compiling the web app into a native Android package.  
- 🔍 **Barcode Scanning**: [html5-qrcode](https://github.com/mebjas/html5-qrcode) for robust camera-based scanning.  
- 🗂 **Data Source**: [Open Food Facts API](https://world.openfoodfacts.org/data) for accessing an open-source database of food products.  
- 🤖 **Artificial Intelligence**: Google **Gemini API** for intelligent, dynamic nutritional summaries.  

---

## 🚀 Getting Started  

Follow these steps to set up the project locally.  

### ✅ Prerequisites  
- [Node.js](https://nodejs.org/) & npm installed  
- [Android Studio](https://developer.android.com/studio) configured for Android development  
- A physical Android device for camera testing  

---

### 🔧 Installation  

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/siddharthsahu23/NutriScan.git
   cd NutriScan
   ```

2. **Configure the API Key**  
   - Get your free API key from **Google AI Studio**  
   - Open:
     ```plaintext
     android/app/src/main/assets/public/script.js
     ```
   - Find the variable around line 9 and paste your key:
     ```js
     // Before
     this.GEMINI_API_KEY = "";

     // After
     this.GEMINI_API_KEY = "AIzaSyB...your...long...api...key...here...";
     ```

3. **Run the Web App (Quick Testing)**  
   ```bash
   cd android/app/src/main/assets/public/
   npm install -g live-server
   live-server
   ```
   ⚠️ *Note: Camera may not work without HTTPS; mobile testing is recommended.*  

4. **Build & Run the Android App**  
   ```bash
   npm install
   npx cap sync android
   npx cap open android
   ```

   ### Then in Android Studio:
   - Let Gradle sync & build  
   - Connect your device  
   - Click ▶️ *Run 'app'* to install  

---

## 🔮 Future Roadmap  

- 🔐 **Secure Backend** – Use Node.js to safely store the Gemini API key  
- 👤 **User Accounts** – Save scan history and dietary preferences (e.g., *“I am allergic to gluten”*)  
- 🌍 **Community Contributions** – Let users add missing products to the Open Food Facts database  
- 🧠 **Expanded AI Features** – Suggest healthier alternatives using Gemini AI  

---

## 📜 License  

This project is licensed under the **GPLv3 License** – see the [LICENSE.md](LICENSE.md) file for details.  

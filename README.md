# Problem Statement (Mind-Sprint 2025) :

* Develop a mobile app that scans food barcodes to provide a simplified nutritional breakdown and allergen warning.

# Project Brief: NutriScan (Base APK Version)

* The final product is a fully functional Android mobile application (.apk) that allows users to instantly look up food nutrition information by scanning product barcodes.

* It's a modern, cross-platform application built on the principle of "write once, run anywhere." While the user experiences a seamless native app, the core technology is based on web development standards.

# Key Aspects:

  * # Core Functionality:
  * Users can scan any standard EAN/UPC food barcode using their phone's camera. The app then connects to an online database (like Open Food Facts) to retrieve and display detailed information, including ingredients, nutritional values, allergens, and additives.

  * # User Interface (UI):
  * The app's interface is a single-page web application built with React.js. It is designed to be clean, responsive, and mobile-first, ensuring a smooth user experience.

  * # Native Wrapper:
  * The React web app is bundled into a native Android application using Capacitor. Capacitor acts as a bridge, allowing the web-based UI to access native device features like the camera, which is essential for barcode scanning.

  * # Final Output:
  *  The .apk file is the standard Android package generated from the project. It is a self-contained, installable application that bundles the React frontend and the Capacitor native runtime, allowing it to be installed and run on any Android device just like a traditional native app.

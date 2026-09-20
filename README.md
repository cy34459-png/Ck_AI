# CK Phase 2 backend

This server keeps the OpenAI API key off the Android APK.

## Local setup
1. Install Node.js on a computer/cloud development environment.
2. Copy `.env.example` to `.env`.
3. Put your API key in `.env`.
4. Run:
   npm install
   npm start
5. Test:
   GET http://localhost:8787/health

The Android app must call the backend `/chat`, not OpenAI directly.

## Important
Do not commit `.env`.
Do not paste the API key into Kotlin, XML, Gradle, GitHub, or the APK.
Use HTTPS for any real deployment.
This Phase 2 backend does NOT claim to provide current-info verification yet; web verification is Phase 3.

# Additional Changes (To Be Implemented Later)

As per our discussion, we will focus on finishing the core features from our original architecture plan first. The following enhancements will be implemented afterward:

## 1. UI & Theming Enhancements
- Change the overall color theme to a pinkish/warmer hue (moving away from the current green/stone palette).
- Introduce a comprehensive, cohesive theme across the entire application.
- Add translucent/glassmorphism background effects for a more premium, modern feel.
- Make the UI heavily mobile-first, specifically by implementing a **bottom navigation bar** for easier one-handed use on phones.

## 2. Progressive Web App (PWA)
- Convert the Next.js frontend into a PWA.
- Allow tourists to "install" the app directly to their phone's homescreen.
- Add offline caching capabilities so users can access their safety briefings even when they lose internet connection in a foreign city.

## 3. Authentication & Security
- Implement User Authentication (JWT and OAuth, such as "Sign in with Google").
- This will be a prerequisite for the "Tourist Connector" feature to ensure users are legitimate and to maintain a safe, consent-based environment.

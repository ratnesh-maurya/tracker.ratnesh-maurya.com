# PWA Setup Guide

This app is configured as a Progressive Web App (PWA) that can be installed on mobile devices and desktops.

## Features

- ✅ Service Worker for offline functionality
- ✅ Web App Manifest for installability
- ✅ Offline caching of static assets
- ✅ Network-first strategy for API calls
- ✅ Install prompt for users
- ✅ App-like experience when installed

## Icon Generation

To generate PWA icons, you have two options:

### Option 1: Use the provided script (requires sharp)

```bash
npm install sharp --save-dev
node scripts/generate-icons.js
```

### Option 2: Create icons manually

Create two PNG files:
- `public/icon-192.png` (192x192 pixels)
- `public/icon-512.png` (512x512 pixels)

You can use any image editor or online tool to create these icons. The icons should represent your app and work well as app icons.

## Testing PWA

1. **Build the app:**
   ```bash
   npm run build
   npm start
   ```

2. **Test in Chrome DevTools:**
   - Open Chrome DevTools (F12)
   - Go to Application tab
   - Check "Service Workers" section
   - Check "Manifest" section
   - Use "Lighthouse" to test PWA score

3. **Test Install Prompt:**
   - On mobile: Visit the site, browser will show install banner
   - On desktop: Look for install icon in address bar
   - Or use the custom install button that appears

4. **Test Offline:**
   - Open DevTools > Network tab
   - Check "Offline" checkbox
   - Refresh page - should still work for cached content

## Service Worker Behavior

- **Static Assets:** Cached on install, served from cache first
- **API Calls:** Network first, fallback to cache if offline
- **Updates:** New service worker activates on next visit

## Manifest Configuration

The manifest is located at `public/manifest.json`. Key settings:
- `display: "standalone"` - App-like experience
- `start_url: "/dashboard"` - Where app opens
- `theme_color: "#3B82F6"` - Browser theme color

## Browser Support

- ✅ Chrome/Edge (Android & Desktop)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox (Android)
- ⚠️ Safari (Desktop) - Limited support

## Troubleshooting

1. **Service Worker not registering:**
   - Ensure you're using HTTPS (or localhost)
   - Check browser console for errors
   - Clear browser cache and try again

2. **Icons not showing:**
   - Verify icon files exist in `public/` folder
   - Check manifest.json paths are correct
   - Clear browser cache

3. **Install prompt not appearing:**
   - App must meet PWA criteria (HTTPS, manifest, service worker)
   - User must visit site multiple times
   - Check if already installed

## Future Enhancements

- [ ] Background sync for offline actions
- [ ] Push notifications
- [ ] Offline data queue
- [ ] Advanced caching strategies


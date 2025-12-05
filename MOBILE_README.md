# Incremental Civ Builder - Mobile Version

This branch contains the mobile-optimized version of the Incremental Civ Builder game. The goal is to provide an enhanced experience for mobile and touch-screen devices.

## Branch Purpose

This `mobile-version` branch is dedicated to:

1. **Touch-Optimized UI** - Larger touch targets and gesture support
2. **Mobile-First Design** - Responsive layouts optimized for smaller screens
3. **Performance Optimization** - Reduced animations and optimized rendering for mobile devices
4. **PWA Support** - Progressive Web App features for offline play and home screen installation

## Mobile Features

### Enhanced Touch Support
- Larger tap targets (minimum 44x44px as per accessibility guidelines)
- Touch-friendly buttons and controls
- Swipe gestures for navigation between tabs
- Pull-to-refresh for manual updates

### Mobile-Specific UI Changes
- Collapsible resource bar for more screen space
- Bottom navigation for easier thumb access
- Simplified tab interface for mobile screens
- Full-screen game mode

### Performance Optimizations
- Reduced animation complexity on mobile
- Lazy loading of non-essential features
- Optimized event handlers for touch devices

## Development Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm start
```

## Testing on Mobile

1. Start the local server with `npm start`
2. Find your local IP address (e.g., `192.168.x.x`)
3. Navigate to `http://192.168.x.x:8080` on your mobile device
4. Or use browser developer tools mobile device simulation

## Future Roadmap

- [ ] Implement touch gesture navigation
- [ ] Add haptic feedback support
- [ ] Create PWA manifest for home screen installation
- [ ] Implement offline caching with Service Worker
- [ ] Add landscape mode optimization
- [ ] Implement pinch-to-zoom for research tree
- [ ] Add mobile-specific sound feedback
- [ ] Support for system dark/light mode preferences

## Contributing

When contributing to the mobile version, please:

1. Test changes on actual mobile devices when possible
2. Ensure touch targets are at least 44x44 pixels
3. Test both portrait and landscape orientations
4. Verify performance on lower-end mobile devices

## Differences from Main Branch

This branch may diverge from the main branch in the following ways:

- Mobile-specific CSS styles in `mobile.css`
- Touch event handlers in the TypeScript source
- Modified UI layouts for mobile screens
- Additional PWA configuration files

To sync with the main branch, merge updates carefully and test for mobile compatibility.

# Quick Demo
https://github.com/user-attachments/assets/fb46637c-555e-4800-9b9f-eb636475a7e9

# 2D Selector Grid

A cross-platform React Native component for intuitive 2D value selection, built with Expo and Reanimated.

## Features

- Smooth, spring-based animations
- Touch and drag gesture support
- Responsive grid system
- Cross-platform (iOS, Android, Web)
- Theme-aware styling
- Customizable grid size and colors
- Real-time value interpolation

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Solarin-Johnson/2d-selector-grid.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

## Usage

The SelectorGrid component can be used to create interactive 2D selection interfaces:

```tsx
import SelectorGrid from '@/components/2dSelectorGrid';

function MyComponent() {
  const gridRef = useRef<SelectorGridHandle>(null);
  const cords = useSharedValue({ x: 0, y: 0 });

  return (
    <SelectorGrid
      ref={gridRef}
      color="white"
      size={11}
      initialX={3}
      initialY={3}
      flipX={true}
      flipY={false}
      cords={cords}
    />
  );
}
```

### Props

- `color`: Grid dot color (default: "white")
- `size`: Grid size (must be odd number, default: 11)
- `initialX/Y`: Initial position (1-based)
- `flipX/Y`: Flip coordinates on respective axis
- `cords`: SharedValue for real-time coordinate tracking

## Key Components

- **SelectorGrid**: Main component for 2D value selection
- **GridDots**: Renders the interactive dot matrix
- **SelectorPad**: Example implementation with temperature/token controls

## Technical Details

Built with:
- [Expo](https://expo.dev)
- [React Native](https://reactnative.dev)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [React Native SVG](https://github.com/react-native-svg/react-native-svg)

## Development

1. Start the development server:
   ```bash
   npx expo start
   ```

2. Choose your platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support, join our [Discord community](https://chat.expo.dev) or open an issue in the repository.

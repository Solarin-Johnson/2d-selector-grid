import { PixelRatio, Platform } from "react-native";

export const FACTOR = Math.min(
  2,
  Platform.OS === "web" ? 1.5 : PixelRatio.getPixelSizeForLayoutSize(1)
);
export const GRID_SPACING = 11 - FACTOR;
export const GRID_OFFSET = GRID_SPACING / 1.5;
export const GRID_RADIUS = GRID_SPACING / 6;
export const SPRING_CONFIG = {
  damping: 20,
  stiffness: 240,
  mass: 0.5,
};

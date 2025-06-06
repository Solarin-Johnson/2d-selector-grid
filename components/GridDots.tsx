import React, { useMemo } from "react";
import { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  SharedValue,
} from "react-native-reanimated";
import { GRID_OFFSET, GRID_RADIUS, GRID_SPACING } from "@/constants";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface GridDotsProps {
  gridSize: number;
  color: string;
  activeIndices: SharedValue<{ x: number; y: number }>;
}

const GridDots: React.FC<GridDotsProps> = ({
  gridSize,
  color,
  activeIndices,
}) => {
  const gridDots = useMemo(
    () =>
      Array.from({ length: gridSize }, (_, x) =>
        Array.from({ length: gridSize }, (_, y) => ({ x, y }))
      ),
    [gridSize]
  );

  return (
    <>
      {gridDots.flat().map(({ x, y }, index) => {
        const isCenter =
          x === Math.floor(gridSize / 2) && y === Math.floor(gridSize / 2);

        const cx = x * GRID_SPACING + GRID_OFFSET;
        const cy = y * GRID_SPACING + GRID_OFFSET;
        const r = isCenter ? GRID_RADIUS * 1.5 : GRID_RADIUS;

        const animatedProps = useAnimatedProps(() => {
          const isSameLine =
            x === activeIndices.value.x || y === activeIndices.value.y;
          return {
            opacity: isSameLine ? 1 : 0.5,
          };
        });

        return (
          <AnimatedCircle
            key={index}
            animatedProps={animatedProps}
            fill={isCenter ? "transparent" : color}
            cx={cx}
            cy={cy}
            r={r}
            stroke={isCenter ? color : undefined}
            strokeWidth={isCenter ? GRID_SPACING / 6 : 0}
          />
        );
      })}
    </>
  );
};

export default GridDots;

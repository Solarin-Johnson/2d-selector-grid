import React, { useEffect, useImperativeHandle, useState } from "react";
import Svg, { Circle } from "react-native-svg";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from "react-native-reanimated";

const GRID_SPACING = 12;
const GRID_OFFSET = GRID_SPACING / 1.5;
const GRID_RADIUS = GRID_SPACING / 6;
const DOT_INITIAL_Y = GRID_OFFSET + GRID_SPACING / 2;
const FOCUSED_DOT_RADIUS = GRID_RADIUS + GRID_SPACING / 2.5;

const clamp = (value: number, min: number, max: number) => {
  "worklet";
  return Math.min(Math.max(value, min), max);
};

const getNearestGridPosition = (value: number) => {
  "worklet";
  return (
    Math.floor((value - GRID_OFFSET) / GRID_SPACING) * GRID_SPACING +
    GRID_OFFSET +
    GRID_SPACING / 2
  );
};

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 240,
  mass: 0.5,
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface SelectorGridProps {
  color?: string;
  size?: number;
}

export interface SelectorGridHandle {
  moveTo: (x: number, y: number) => void;
}

const SelectorGrid = React.forwardRef<SelectorGridHandle, SelectorGridProps>(
  ({ color = "white", size = 11 }, ref) => {
    const GRID_SIZE = size || 11;
    const GRID_WIDTH = (GRID_SIZE - 1) * GRID_SPACING + GRID_OFFSET * 2;
    const GRID_HEIGHT = GRID_WIDTH;
    const DOT_INITIAL_X = GRID_WIDTH - GRID_OFFSET + GRID_SPACING / 2;

    const [ready, setReady] = useState(false);
    const dotPosition = useSharedValue({
      x: DOT_INITIAL_X,
      y: DOT_INITIAL_Y,
    });
    const dragging = useSharedValue(false);

    const tapGesture = Gesture.Tap().onStart((e) => {
      dragging.value = false;
      dotPosition.value = {
        x: getNearestGridPosition(e.x + GRID_OFFSET),
        y: getNearestGridPosition(e.y + GRID_OFFSET),
      };
    });

    const getClampedPosition = (value: number, axis: "x" | "y") => {
      "worklet";
      const min = GRID_OFFSET + GRID_SPACING / 2;
      const max =
        axis === "x"
          ? GRID_WIDTH - GRID_OFFSET + GRID_SPACING / 2
          : GRID_HEIGHT - GRID_OFFSET + GRID_SPACING / 2;
      return clamp(value, min, max);
    };

    const moveTo = (x: number, y: number) => {
      "worklet";
      dotPosition.value = {
        x: getNearestGridPosition(getClampedPosition(x + GRID_OFFSET, "x")),
        y: getNearestGridPosition(getClampedPosition(y + GRID_OFFSET, "y")),
      };
    };

    useImperativeHandle(
      ref,
      () => ({
        moveTo,
      }),
      []
    );

    const panGesture = Gesture.Pan()
      .minDistance(0)
      .maxPointers(1)
      .onBegin(() => {
        dragging.value = true;
      })
      .onUpdate((event) => {
        dotPosition.value = {
          x: getClampedPosition(event.x + GRID_OFFSET, "x"),
          y: getClampedPosition(event.y + GRID_OFFSET, "y"),
        };
      })
      .onEnd(() => {
        dragging.value = false;
        dotPosition.value = {
          x: getNearestGridPosition(dotPosition.value.x),
          y: getNearestGridPosition(dotPosition.value.y),
        };
      });

    const animatedProps = useAnimatedProps(() => {
      const isDragging = dragging.value;
      const space = GRID_SPACING / 2;
      const x = dotPosition.value.x - space;
      const y = dotPosition.value.y - space;
      return {
        cx: isDragging ? x : withSpring(x, SPRING_CONFIG),
        cy: isDragging ? y : withSpring(y, SPRING_CONFIG),
      };
    });

    const gridDots = Array.from({ length: GRID_SIZE }, (_, x) =>
      Array.from({ length: GRID_SIZE }, (_, y) => ({ x, y }))
    );

    useEffect(() => {
      setTimeout(() => {
        setReady(true); // BUG: animatedProps is not ready on initial render
      }, 0);
    }, []);

    return (
      <GestureDetector gesture={Gesture.Simultaneous(panGesture, tapGesture)}>
        <Svg height={GRID_HEIGHT} width={GRID_WIDTH}>
          {gridDots.flat().map(({ x, y }, index) => {
            const isCenter =
              x === Math.floor(GRID_SIZE / 2) &&
              y === Math.floor(GRID_SIZE / 2);
            const cx = x * GRID_SPACING + GRID_OFFSET;
            const cy = y * GRID_SPACING + GRID_OFFSET;
            const r = isCenter ? GRID_RADIUS * 1.5 : GRID_RADIUS;

            const animatedProps = useAnimatedProps(() => {
              const isSameLine =
                x ===
                  Math.floor(
                    (dotPosition.value.x - GRID_OFFSET) / GRID_SPACING
                  ) ||
                y ===
                  Math.floor(
                    (dotPosition.value.y - GRID_OFFSET) / GRID_SPACING
                  );

              return {
                opacity: isSameLine ? 1 : 0.5,
              };
            });

            return (
              <AnimatedCircle
                key={index}
                animatedProps={animatedProps}
                fill={isCenter ? undefined : color}
                cx={cx}
                cy={cy}
                r={r}
                stroke={isCenter ? color : undefined}
                strokeWidth={isCenter ? 2 : undefined}
              />
            );
          })}
          {ready && (
            <AnimatedCircle
              animatedProps={animatedProps}
              r={FOCUSED_DOT_RADIUS}
              fill={color}
            />
          )}
        </Svg>
      </GestureDetector>
    );
  }
);

export default SelectorGrid;

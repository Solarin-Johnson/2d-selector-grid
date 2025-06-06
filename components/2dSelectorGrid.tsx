import React, {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useState,
} from "react";
import Svg, { Circle } from "react-native-svg";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  useDerivedValue,
  SharedValue,
  useAnimatedReaction,
} from "react-native-reanimated";
import GridDots from "./GridDots";
import { Platform } from "react-native";
import {
  GRID_OFFSET,
  GRID_RADIUS,
  GRID_SPACING,
  SPRING_CONFIG,
} from "@/constants";

const FOCUSED_DOT_RADIUS = GRID_RADIUS + GRID_SPACING / 2.4;

const isWeb = Platform.OS === "web";

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

const ensureOddNumber = (num: number): number => {
  const n = Math.max(3, num);
  return n % 2 === 0 ? n + 1 : n;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface SelectorGridProps {
  color?: string;
  size?: number;
  initialX?: number;
  initialY?: number;
  flipX?: boolean;
  flipY?: boolean;
  cords?: SharedValue<{
    x: number;
    y: number;
  }>;
}

export interface SelectorGridHandle {
  moveTo: (x: number, y: number, flip: boolean) => void;
}

const SelectorGrid = React.forwardRef<SelectorGridHandle, SelectorGridProps>(
  (
    {
      color = "white",
      size = 11,
      initialX = 3,
      initialY = 3,
      flipX = true,
      flipY = false,
      cords,
    },
    ref
  ) => {
    const GRID_SIZE = ensureOddNumber(size);
    const GRID_WIDTH = (GRID_SIZE - 1) * GRID_SPACING + GRID_OFFSET * 2;
    const GRID_HEIGHT = GRID_WIDTH;

    const [ready, setReady] = useState(false);
    const dotPosition = useSharedValue({
      x: 0,
      y: 0,
    });
    const dragging = useSharedValue(false);

    const tapGesture = Gesture.Tap().onStart((e) => {
      dragging.value = false;
      dotPosition.value = {
        x: getNearestGridPosition(Math.max(e.x, GRID_OFFSET)),
        y: getNearestGridPosition(Math.max(e.y, GRID_OFFSET)),
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

    const moveTo = (gridX: number, gridY: number, flip: boolean = false) => {
      "worklet";
      let x = gridX;
      let y = gridY;

      // Apply flip if requested
      if (flip) {
        x = flipX ? GRID_SIZE - x + 1 : x;
        y = flipY ? GRID_SIZE - y + 1 : y;
      }

      const safeGridX = clamp(x, 1, GRID_SIZE);
      const safeGridY = clamp(y, 1, GRID_SIZE);

      const arrayX = safeGridX - 1;
      const arrayY = safeGridY - 1;

      dotPosition.value = {
        x: arrayX * GRID_SPACING + GRID_OFFSET + GRID_SPACING / 2,
        y: arrayY * GRID_SPACING + GRID_OFFSET + GRID_SPACING / 2,
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
      .minDistance(isWeb ? 1 : 0)
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

    const activeIndices = useDerivedValue(() => {
      return {
        x: Math.floor((dotPosition.value.x - GRID_OFFSET) / GRID_SPACING),
        y: Math.floor((dotPosition.value.y - GRID_OFFSET) / GRID_SPACING),
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

    useEffect(() => {
      if (dotPosition.value) {
        setReady(true); // Ensure animatedProps are ready deterministically
      }
    }, [dotPosition]);

    useLayoutEffect(() => {
      const targetX = flipX ? GRID_SIZE - initialX + 1 : initialX;
      const targetY = flipY ? GRID_SIZE - initialY + 1 : initialY;

      moveTo(targetX, targetY);
    }, []);

    useAnimatedReaction(
      () => dotPosition.value,
      (currentPosition) => {
        if (cords) {
          const gridRange = (GRID_SIZE - 1) * GRID_SPACING;
          const dotOffset = GRID_OFFSET + GRID_SPACING / 2;
          const progressX = (currentPosition.x - dotOffset) / gridRange;
          const progressY = 1 - (currentPosition.y - dotOffset) / gridRange;

          cords.value = {
            x: progressX,
            y: progressY,
          };
        }
      }
    );

    return (
      <GestureDetector gesture={Gesture.Simultaneous(panGesture, tapGesture)}>
        <Svg height={GRID_HEIGHT} width={GRID_WIDTH}>
          <GridDots
            gridSize={GRID_SIZE}
            color={color}
            activeIndices={activeIndices}
          />
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

import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PixelRatio,
} from "react-native";
import React from "react";
import SelectorGrid, { SelectorGridHandle } from "../2dSelectorGrid";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { ThemedText } from "../ThemedText";
import AnimatedText from "./AnimatedText";
import Feather from "@expo/vector-icons/Feather";
import { ThemedView } from "../ThemedView";

const MIN_TEMP = 0.1;
const MAX_TEMP = 2.0;
const MIN_TOKENS = 50;
const MAX_TOKENS = 500;
const INITIAL_CORDS = { x: 3, y: 3 };
const isWeb = Platform.OS === "web";

const FACTOR = isWeb ? 6 : PixelRatio.getPixelSizeForLayoutSize(3);

export default function SelectorPad() {
  const gridRef = React.useRef<SelectorGridHandle>(null);
  const text = useThemeColor({}, "text");
  const cords: SharedValue<{ x: number; y: number }> = useSharedValue({
    x: 1,
    y: 1,
  });

  const handleReset = () => {
    if (gridRef.current) {
      gridRef.current.moveTo(INITIAL_CORDS.x, INITIAL_CORDS.y, true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: text + "0C" }]}>
      <Bar cords={cords} reset={handleReset} />
      <ThemedView
        style={{
          padding: 6,
          borderRadius: 16,
          overflow: "hidden",
          margin: 12,
        }}
      >
        <LinearGradient
          colors={["#00000020", "#ffffff40"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.background}
        >
          <View
            style={[
              styles.overlayBorder,
              {
                borderColor: text + "12",
              },
            ]}
          />
        </LinearGradient>
        <SelectorGrid
          ref={gridRef}
          color={text}
          cords={cords}
          initialX={INITIAL_CORDS.x}
          initialY={INITIAL_CORDS.y}
        />
      </ThemedView>
    </View>
  );
}

const Bar = ({
  cords,
  reset,
}: {
  cords: SharedValue<{ x: number; y: number }>;
  reset: () => void;
}) => {
  const text = useThemeColor({}, "text");

  const temperature = useDerivedValue(() => {
    return (MIN_TEMP + cords.value.x * (MAX_TEMP - MIN_TEMP))
      .toFixed(2)
      .toString();
  });

  const maxTokens = useDerivedValue(() => {
    return (MIN_TOKENS + cords.value.y * (MAX_TOKENS - MIN_TOKENS))
      .toFixed(0)
      .toString();
  });

  return (
    <View style={[styles.bar, { borderColor: text + "15" }]}>
      <BarItem text={temperature} title="Temperature" />
      <BarItem text={maxTokens} title="Max Tokens" />
      <TouchableOpacity onPress={reset} hitSlop={10}>
        <Feather name="rotate-ccw" size={16} color={text} />
      </TouchableOpacity>
    </View>
  );
};

const BarItem = ({
  text,
  title,
}: {
  text: SharedValue<string>;
  title: string;
}) => {
  return (
    <View style={styles.barItem}>
      <ThemedText
        style={[styles.barItemText, { opacity: 0.6, userSelect: "none" }]}
        numberOfLines={1}
      >
        {title.toUpperCase()}
      </ThemedText>
      <AnimatedText
        style={[
          styles.barItemText,
          { width: 38, marginLeft: isWeb ? FACTOR : 2 },
        ]}
        text={text}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-end",
    width: "90%",
    borderRadius: 33,
    alignItems: "center",
    padding: 12,
    gap: 12,
    alignSelf: "center",
    maxWidth: 400,
  },

  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  overlayBorder: {
    flex: 1,
    borderWidth: 2.8,
    borderRadius: 16,
  },
  bar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 21,
    height: 42,
  },
  barItem: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
  },
  barItemText: {
    fontSize: 6.5 + FACTOR,
    lineHeight: 9 + FACTOR,
    outlineWidth: 0,
  },
});

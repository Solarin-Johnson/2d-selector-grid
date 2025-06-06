import React from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { SelectorGridHandle } from "@/components/2dSelectorGrid";
import { useThemeColor } from "@/hooks/useThemeColor";
import { SafeAreaView } from "react-native-safe-area-context";
import SelectorPad from "@/components/ui/SelectorPad";

export default function Index() {
  const text = useThemeColor({}, "text");

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <SelectorPad />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 24,
  },
  button: {
    marginTop: 24,
  },
});

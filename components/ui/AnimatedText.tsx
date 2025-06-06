import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import type { TextInputProps, TextProps as RNTextProps } from "react-native";
import { StyleSheet, TextInput } from "react-native";
import Animated, {
  AnimatedProps,
  SharedValue,
  useAnimatedProps,
} from "react-native-reanimated";

const styles = StyleSheet.create({
  textStyle: {
    fontFamily: "InterMedium",
  },
});

Animated.addWhitelistedNativeProps({ text: true });

interface TextProps extends Omit<TextInputProps, "value" | "style"> {
  text: SharedValue<string>;
  style?: AnimatedProps<RNTextProps>["style"];
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const AnimatedText = (props: TextProps) => {
  const textColor = useThemeColor({}, "text");
  const { style, text, ...rest } = props;
  const animatedProps = useAnimatedProps(() => {
    return {
      text: text.value,
    } as any;
  });
  return (
    <AnimatedTextInput
      editable={false}
      value={text.value}
      style={[styles.textStyle, { color: textColor }, style || undefined]}
      {...rest}
      {...{ animatedProps }}
    />
  );
};

export default AnimatedText;

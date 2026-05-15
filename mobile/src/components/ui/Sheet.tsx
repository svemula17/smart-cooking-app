import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';
import { radii } from '../../theme/radii';
import { typography } from '../../theme/typography';
import { motion } from '../../theme/motion';
import { IconButton } from './IconButton';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number | 'auto';
  contentStyle?: ViewStyle;
}

export function Sheet({
  visible,
  onClose,
  title,
  children,
  height = 'auto',
  contentStyle,
}: SheetProps) {
  const c = useThemeColors();
  const slide = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slide, {
          toValue: 1,
          duration: motion.duration.base,
          easing: motion.easing.standard,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: motion.duration.base,
          easing: motion.easing.standard,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slide.setValue(0);
      fade.setValue(0);
    }
  }, [visible, slide, fade]);

  const screenH = Dimensions.get('window').height;
  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [screenH, 0],
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.overlay, opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Dismiss" />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: c.surfaceRaised,
            transform: [{ translateY }],
            maxHeight: screenH * 0.92,
            ...(typeof height === 'number' ? { height } : {}),
          },
          contentStyle,
        ]}
      >
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: c.borderStrong }]} />
        </View>
        {title ? (
          <View style={styles.header}>
            <Text style={typography.h3}>{title}</Text>
            <IconButton icon="✕" accessibilityLabel="Close" onPress={onClose} size={36} />
          </View>
        ) : null}
        <View style={styles.body}>{children}</View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    paddingBottom: spacing['2xl'],
  },
  handleWrap: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.sm },
  handle: { width: 40, height: 4, borderRadius: 2 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  body: { paddingHorizontal: spacing.xl },
});

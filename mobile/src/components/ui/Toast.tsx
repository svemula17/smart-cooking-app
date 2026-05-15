import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';
import { radii } from '../../theme/radii';
import { elevation } from '../../theme/elevation';
import { motion } from '../../theme/motion';

type ToastTone = 'info' | 'success' | 'warning' | 'error';
interface ToastItem {
  message: string;
  tone: ToastTone;
}

interface ToastApi {
  show: (message: string, tone?: ToastTone) => void;
}

const Ctx = createContext<ToastApi>({ show: () => {} });

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(20)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const c = useThemeColors();

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: motion.duration.fast, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 20, duration: motion.duration.fast, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [opacity, translate]);

  const show = useCallback<ToastApi['show']>(
    (message, tone = 'info') => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, tone });
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: motion.duration.base, useNativeDriver: true }),
        Animated.timing(translate, { toValue: 0, duration: motion.duration.base, useNativeDriver: true }),
      ]).start();
      timer.current = setTimeout(dismiss, 2600);
    },
    [opacity, translate, dismiss]
  );

  const tonePalette = (t: ToastTone) => {
    switch (t) {
      case 'success':
        return { bg: c.success, fg: c.onPrimary };
      case 'warning':
        return { bg: c.warning, fg: c.onPrimary };
      case 'error':
        return { bg: c.error, fg: c.onPrimary };
      default:
        return { bg: c.surfaceInverse, fg: c.background };
    }
  };

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            elevation.overlay,
            {
              backgroundColor: tonePalette(toast.tone).bg,
              opacity,
              transform: [{ translateY: translate }],
            },
          ]}
        >
          <Text style={[styles.text, { color: tonePalette(toast.tone).fg }]}>
            {toast.message}
          </Text>
        </Animated.View>
      ) : null}
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: spacing['4xl'],
    left: spacing.xl,
    right: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  text: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});

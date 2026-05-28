import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

/**
 * Persistent banner that slides in from the top whenever the device loses
 * network connectivity, and slides back out once we're online again.
 *
 * Subscribes to NetInfo on mount. Uses a SafeAreaInsets-aware top offset
 * so it never overlaps the status bar or notch.
 *
 * Intentionally simple: we only show "offline" vs "back online" for a
 * couple seconds — we don't try to surface flaky-network or low-signal
 * states (those would be more user-confusing than helpful).
 */
export function OfflineBanner(): React.JSX.Element | null {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<'online' | 'offline' | 'recovered'>('online');
  const translateY = useRef(new Animated.Value(-100)).current;
  const recoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((info) => {
      const isOffline = info.isConnected === false || info.isInternetReachable === false;
      setState((prev) => {
        if (isOffline) return 'offline';
        if (prev === 'offline') return 'recovered';
        return 'online';
      });
    });
    return () => {
      unsubscribe();
      if (recoverTimer.current) clearTimeout(recoverTimer.current);
    };
  }, []);

  // Animate slide + auto-hide the "back online" toast after 2s.
  useEffect(() => {
    if (state === 'offline') {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
      }).start();
    } else if (state === 'recovered') {
      // Show "back online" briefly, then slide away
      if (recoverTimer.current) clearTimeout(recoverTimer.current);
      recoverTimer.current = setTimeout(() => {
        setState('online');
      }, 1800);
    } else {
      Animated.spring(translateY, {
        toValue: -100,
        useNativeDriver: true,
        damping: 18,
      }).start();
    }
  }, [state, translateY]);

  if (state === 'online') return null;

  const offline = state === 'offline';

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: offline ? colors.error : colors.success,
          paddingTop: insets.top + 6,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.text}>
        {offline ? '⚠ You\'re offline — changes will sync when you reconnect' : '✓ Back online'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm + 2,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  text: {
    fontSize: typography.label.fontSize,
    color: 'white',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default OfflineBanner;

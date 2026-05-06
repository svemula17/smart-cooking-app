import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { RootStackParamList } from '../types';
import { setAuth, AppDispatch } from '../store';
import { authService } from '../services/authService';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const circle1Scale = useRef(new Animated.Value(0)).current;
  const circle2Scale = useRef(new Animated.Value(0)).current;
  const circle3Scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(circle1Scale, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(circle2Scale, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(circle3Scale, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      ]),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(async () => {
      try {
        const session = await authService.restoreSession();
        if (session) {
          dispatch(setAuth(session));
          navigation.replace('Tabs');
          return;
        }
      } catch {
        // session restore failed — continue to check first launch
      }
      try {
        const isFirst = await authService.isFirstLaunch();
        if (isFirst) {
          navigation.replace('Onboarding');
        } else {
          navigation.replace('Login');
        }
      } catch {
        navigation.replace('Onboarding');
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <Animated.View
        style={[styles.decorCircle, styles.circle1, { transform: [{ scale: circle1Scale }] }]}
      />
      <Animated.View
        style={[styles.decorCircle, styles.circle2, { transform: [{ scale: circle2Scale }] }]}
      />
      <Animated.View
        style={[styles.decorCircle, styles.circle3, { transform: [{ scale: circle3Scale }] }]}
      />

      <Animated.View
        style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🍳</Text>
        </View>
        <Text style={styles.appName}>SmartCooking</Text>
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity: subtitleOpacity }]}>
        Cook smarter, eat better
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circle1: {
    width: width * 0.85,
    height: width * 0.85,
    top: -width * 0.28,
    right: -width * 0.2,
  },
  circle2: {
    width: width * 0.65,
    height: width * 0.65,
    bottom: -width * 0.18,
    left: -width * 0.18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  circle3: {
    width: width * 0.32,
    height: width * 0.32,
    bottom: height * 0.22,
    right: width * 0.04,
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoEmoji: {
    fontSize: 54,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.3,
    marginTop: 8,
  },
});

export default SplashScreen;

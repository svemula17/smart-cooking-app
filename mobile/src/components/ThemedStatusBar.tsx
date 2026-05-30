// ThemedStatusBar — single source of truth for status bar text color.
//
// Every screen used to hardcode `barStyle="dark-content"` which made
// the time/battery indicators invisible against the dark background in
// dark mode. This component flips it based on the redux isDark flag.
//
// Drop-in replacement: `<StatusBar barStyle="dark-content" />` →
// `<ThemedStatusBar />`.

import React from 'react';
import { StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export function ThemedStatusBar(): React.JSX.Element {
  const isDark = useSelector((s: RootState) => s.settings.isDark);
  return <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />;
}

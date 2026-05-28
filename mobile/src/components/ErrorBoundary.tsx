import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { radii } from '../theme/radii';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Root-level error boundary. Catches any uncaught render-time exception
 * from any descendant component and shows a friendly retry screen instead
 * of the white-screen-of-death the user would otherwise see.
 *
 * In development we also dump the stack trace so the failure is debuggable
 * without going to the Metro logs. In production we just show the message
 * and a Retry button (which remounts the subtree by resetting state).
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Uncaught render error:', error, errorInfo);
    this.setState({ errorInfo });
    // When Sentry is re-enabled for mobile, hook it in here:
    //   Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleRetry = (): void => {
    this.setState({ error: null, errorInfo: null });
  };

  render(): React.ReactNode {
    if (!this.state.error) return this.props.children;

    const stack =
      this.state.error.stack ??
      (this.state.errorInfo?.componentStack ?? 'No stack trace available');

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🍳</Text>
          <Text style={styles.title}>Something burned in the kitchen.</Text>
          <Text style={styles.subtitle}>
            We hit an unexpected error. Tap retry to try again, or restart the app.
          </Text>

          <TouchableOpacity style={styles.button} onPress={this.handleRetry} accessibilityRole="button">
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>

          {__DEV__ ? (
            <ScrollView style={styles.devBox} contentContainerStyle={{ padding: 12 }}>
              <Text style={styles.devLabel}>DEV — error</Text>
              <Text style={styles.devText} selectable>
                {this.state.error.message}
              </Text>
              <Text style={[styles.devLabel, { marginTop: 12 }]}>DEV — stack</Text>
              <Text style={styles.devText} selectable>
                {stack}
              </Text>
            </ScrollView>
          ) : null}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii['2xl'],
    padding: 28,
    alignItems: 'center',
    maxWidth: 480,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 8,
  },
  emoji: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing['2xl'],
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  devBox: {
    marginTop: spacing.xl,
    width: '100%',
    maxHeight: 260,
    backgroundColor: colors.surfaceInverse,
    borderRadius: radii.md,
  },
  devLabel: {
    fontSize: 10,
    color: colors.error,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  devText: {
    fontSize: 12,
    color: colors.borderStrong,
    fontFamily: 'Menlo',
    marginTop: 4,
  },
});

export default ErrorBoundary;

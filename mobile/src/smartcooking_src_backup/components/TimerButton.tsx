import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface Props { seconds: number; }

export function TimerButton({ seconds }: Props): JSX.Element {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { setRunning(false); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs = (remaining % 60).toString().padStart(2, '0');

  return (
    <TouchableOpacity style={styles.button} onPress={() => setRunning((r) => !r)}>
      <Text style={styles.text}>{running ? `Pause ${mins}:${secs}` : `Start timer ${mins}:${secs}`}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.secondary, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center',
  },
  text: { color: 'white', fontWeight: '700', fontSize: 16 },
});

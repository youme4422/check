import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '../theme/ThemeProvider';

const TOGGLE_WIDTH = 82;
const TOGGLE_HEIGHT = 40;
const KNOB_SIZE = 32;
const KNOB_OFFSET = 4;
const KNOB_TRAVEL = TOGGLE_WIDTH - KNOB_SIZE - KNOB_OFFSET * 2;

export function ThemeToggle() {
  const { scheme, setThemeMode } = useAppTheme();
  const progress = useRef(new Animated.Value(scheme === 'dark' ? 0 : 1)).current;
  const isLight = scheme === 'light';

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isLight ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isLight, progress]);

  const handleToggle = () => {
    void setThemeMode(isLight ? 'dark' : 'light');
  };

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: isLight }}
      onPress={handleToggle}
      style={[
        styles.track,
        {
          backgroundColor: isLight ? '#E5E7EB' : '#1D222B',
          shadowColor: isLight ? '#94A3B8' : '#000000',
        },
      ]}
    >
      <View style={styles.iconRail}>
        <View style={styles.iconSlot}>
          <Ionicons
            name="moon"
            size={15}
            color={isLight ? '#94A3B8' : '#E5E7EB'}
          />
        </View>
        <View style={styles.iconSlot}>
          <Ionicons
            name="sunny"
            size={15}
            color={isLight ? '#4B5563' : '#6B7280'}
          />
        </View>
      </View>

      <Animated.View
        style={[
          styles.knob,
          {
            backgroundColor: isLight ? '#FFFFFF' : '#2A2F39',
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, KNOB_TRAVEL],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons
          name={isLight ? 'sunny' : 'moon'}
          size={15}
          color={isLight ? '#111827' : '#F3F4F6'}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TOGGLE_WIDTH,
    height: TOGGLE_HEIGHT,
    borderRadius: TOGGLE_HEIGHT / 2,
    justifyContent: 'center',
    paddingHorizontal: KNOB_OFFSET,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconRail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  iconSlot: {
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knob: {
    position: 'absolute',
    left: KNOB_OFFSET,
    top: KNOB_OFFSET,
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
});

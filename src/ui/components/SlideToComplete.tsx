import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

import { AppTheme } from '../theme';

interface SlideToCompleteProps {
  onComplete: () => void;
  onUncomplete: () => void;
  isCompleted: boolean;
  completeText: string;
  completedText: string;
}

export default function SlideToComplete({
  onComplete,
  onUncomplete,
  isCompleted,
  completeText,
  completedText,
}: SlideToCompleteProps) {
  const theme = useTheme() as AppTheme;

  const handlePress = () => {
    if (isCompleted) {
      onUncomplete();
    } else {
      onComplete();
    }
  };

  return (
    <Button
      mode={isCompleted ? 'contained' : 'contained-tonal'}
      onPress={handlePress}
      style={styles.button}
      buttonColor={isCompleted ? theme.colors.success : theme.colors.primaryContainer}
      textColor={isCompleted ? theme.colors.onSuccess : theme.colors.onPrimaryContainer}
      icon={isCompleted ? 'check-circle' : 'circle-outline'}
    >
      {isCompleted ? completedText : completeText}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
  },
});

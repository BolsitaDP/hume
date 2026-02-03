import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

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
  const theme = useTheme();
  const handlePress = () => {
    if (isCompleted) {
      onUncomplete();
    } else {
      onComplete();
    }
  };

  return (
    <Button
      mode={isCompleted ? 'contained' : 'outlined'}
      onPress={handlePress}
      style={styles.button}
      buttonColor={isCompleted ? theme.colors.success : undefined}
      textColor={isCompleted ? theme.colors.onSuccess : undefined}
      icon={isCompleted ? 'check-circle' : 'circle-outline'}
    >
      {isCompleted ? completedText : completeText}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
});


import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

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
      buttonColor={isCompleted ? '#4CAF50' : undefined}
      textColor={isCompleted ? '#FFFFFF' : undefined}
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

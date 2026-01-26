import React, { useState } from 'react';
import { Platform, View, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  value: string;           // 'HH:mm'
  label: string;
  onChange: (value: string) => void;
};

function parseTime(value: string) {
  const [ h, m ] = value.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatTime(date: Date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function TimePickerField({ value, label, onChange }: Props) {
  const [ open, setOpen ] = useState(false);
  const theme = useTheme();

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.timeButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
          }
        ]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="clock-outline"
          size={20}
          color={theme.colors.onSurfaceVariant}
        />
        <View style={styles.timeTextContainer}>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant, marginBottom: 2 }}
          >
            {label}
          </Text>
          <Text
            variant="titleMedium"
            style={{
              color: theme.colors.onSurface,
              fontWeight: '500',
            }}
          >
            {value}
          </Text>
        </View>
      </TouchableOpacity>

      {open && (
        <DateTimePicker
          value={parseTime(value)}
          mode="time"
          is24Hour
          display={Platform.OS === 'android' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setOpen(false);

            // Android: dismiss = cancel
            if (event.type === 'dismissed' || !date) return;

            onChange(formatTime(date));
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  timeTextContainer: {
    flex: 1,
  },
});

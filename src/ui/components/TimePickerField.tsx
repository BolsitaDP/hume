import React, { useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput, useTheme } from 'react-native-paper';

import { AppTheme } from '../theme';
import { withAlpha } from '../glass';

type Props = {
  value: string;
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
  const theme = useTheme() as AppTheme;

  return (
    <View>
      <TouchableOpacity activeOpacity={0.86} onPress={() => setOpen(true)}>
        <View pointerEvents="none">
          <TextInput
            label={label}
            value={value}
            mode="outlined"
            editable={false}
            style={{ backgroundColor: theme.colors.surface }}
            contentStyle={{ minHeight: 54 }}
            outlineStyle={{ borderRadius: 12 }}
            outlineColor={withAlpha(theme.colors.outline, 0.72)}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.onSurface}
            left={<TextInput.Icon icon="clock-outline" color={theme.colors.onSurfaceVariant} />}
            right={<TextInput.Icon icon={open ? 'chevron-up' : 'chevron-down'} color={theme.colors.onSurfaceVariant} />}
          />
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
            if (event.type === 'dismissed' || !date) return;
            onChange(formatTime(date));
          }}
        />
      )}
    </View>
  );
}
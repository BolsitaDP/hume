import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { List } from 'react-native-paper';

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

  return (
    <View>
      <List.Item
        title={label}
        description={value}
        onPress={() => setOpen(true)}
      />

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

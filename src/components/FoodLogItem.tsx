import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontFamily } from '../theme';
import { MealLog } from '../types';

interface FoodLogItemProps {
  meal: MealLog;
}

const SOURCE_ICONS: Record<string, string> = {
  ai_scan: '📷',
  search: '🔍',
  dining_hall: '🍽️',
  manual: '✏️',
};

const MEAL_ICONS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

export default function FoodLogItem({ meal }: FoodLogItemProps) {
  const time = new Date(meal.loggedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <View style={styles.iconCol}>
        <Text style={styles.mealIcon}>{MEAL_ICONS[meal.mealType] ?? '🍽️'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{meal.mealName}</Text>
        <Text style={styles.meta}>
          {time} · {SOURCE_ICONS[meal.source] ?? ''} {meal.source.replace('_', ' ')}
        </Text>
      </View>
      <View style={styles.macros}>
        <Text style={styles.cal}>{meal.calories} cal</Text>
        <Text style={styles.macroDetail}>{meal.protein}P · {meal.carbs}C · {meal.fats}F</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconCol: { width: 36, alignItems: 'center' },
  mealIcon: { fontSize: 22 },
  info: { flex: 1, marginLeft: 8 },
  name: { fontFamily: FontFamily.bodyMedium, fontSize: 14, color: Colors.textPrimary },
  meta: { fontFamily: FontFamily.body, fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  macros: { alignItems: 'flex-end' },
  cal: { fontFamily: FontFamily.displayBold, fontSize: 15, color: Colors.textPrimary },
  macroDetail: { fontFamily: FontFamily.body, fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
});

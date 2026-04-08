import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, FontFamily } from '../../theme';
import { useUserStore } from '../../store/userStore';

export default function EditGoalsScreen({ navigation }: any) {
  const dailyGoals = useUserStore((s) => s.dailyGoals);
  const setDailyGoals = useUserStore((s) => s.setDailyGoals);

  const [calories, setCalories] = useState(dailyGoals.calories);
  const [protein, setProtein] = useState(dailyGoals.protein);
  const [carbs, setCarbs] = useState(dailyGoals.carbs);
  const [fats, setFats] = useState(dailyGoals.fats);

  function save() {
    setDailyGoals({ calories, protein, carbs, fats });
    Alert.alert('Saved', 'Your macro goals have been updated!');
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>EDIT MACRO GOALS</Text>
      <Text style={styles.subtitle}>Adjust your daily nutrition targets</Text>

      <MacroSlider label="Calories" value={calories} onChange={setCalories} min={1200} max={5000} step={50} unit="cal" color={Colors.primary} />
      <MacroSlider label="Protein" value={protein} onChange={setProtein} min={50} max={350} step={5} unit="g" color={Colors.primary} />
      <MacroSlider label="Carbs" value={carbs} onChange={setCarbs} min={50} max={500} step={5} unit="g" color={Colors.accent} />
      <MacroSlider label="Fats" value={fats} onChange={setFats} min={20} max={200} step={5} unit="g" color={Colors.gold} />

      {/* Quick Presets */}
      <View style={styles.presetSection}>
        <Text style={styles.sectionTitle}>QUICK PRESETS</Text>
        <View style={styles.presetRow}>
          {[
            { label: 'Build Muscle', cal: 2800, p: 200, c: 300, f: 85 },
            { label: 'Lose Weight', cal: 1800, p: 160, c: 180, f: 60 },
            { label: 'Maintain', cal: 2200, p: 150, c: 250, f: 70 },
          ].map((preset) => (
            <TouchableOpacity
              key={preset.label}
              style={styles.presetBtn}
              onPress={() => {
                setCalories(preset.cal);
                setProtein(preset.p);
                setCarbs(preset.c);
                setFats(preset.f);
              }}
            >
              <Text style={styles.presetLabel}>{preset.label}</Text>
              <Text style={styles.presetCal}>{preset.cal} cal</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveBtnText}>SAVE GOALS</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MacroSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <View style={sliderStyles.container}>
      <View style={sliderStyles.labelRow}>
        <Text style={sliderStyles.label}>{label}</Text>
        <Text style={[sliderStyles.value, { color }]}>
          {value}{unit}
        </Text>
      </View>
      <View style={sliderStyles.barBg}>
        <View style={[sliderStyles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <View style={sliderStyles.btnRow}>
        <TouchableOpacity
          style={sliderStyles.btn}
          onPress={() => onChange(Math.max(min, value - step))}
        >
          <Text style={sliderStyles.btnText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={sliderStyles.btn}
          onPress={() => onChange(Math.min(max, value + step))}
        >
          <Text style={sliderStyles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontFamily: FontFamily.bodyMedium, fontSize: 15, color: Colors.textPrimary },
  value: { fontFamily: FontFamily.displayBold, fontSize: 20 },
  barBg: { height: 6, borderRadius: 3, backgroundColor: Colors.surface2, marginBottom: 10 },
  barFill: { height: 6, borderRadius: 3 },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  btn: {
    flex: 1,
    backgroundColor: Colors.surface2,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnText: { fontFamily: FontFamily.displayBold, fontSize: 20, color: Colors.textPrimary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 60 },
  backBtn: { marginBottom: 16 },
  backText: { fontFamily: FontFamily.bodyMedium, fontSize: 15, color: Colors.primary },
  title: { fontFamily: FontFamily.displayBold, fontSize: 24, color: Colors.textPrimary, letterSpacing: 1, marginBottom: 4 },
  subtitle: { fontFamily: FontFamily.body, fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  sectionTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  presetSection: { marginTop: 8, marginBottom: 20 },
  presetRow: { flexDirection: 'row', gap: 8 },
  presetBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
  },
  presetLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: 12, color: Colors.textPrimary },
  presetCal: { fontFamily: FontFamily.body, fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: { fontFamily: FontFamily.displayBold, fontSize: 16, color: Colors.background },
});

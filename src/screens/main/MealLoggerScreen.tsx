import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Colors, FontFamily } from '../../theme';
import { useMacroStore } from '../../store/macroStore';
import { useUserStore } from '../../store/userStore';
import { DINING_HALL_MENU } from '../../data/mockData';
import { DiningHallItem, MealLog } from '../../types';
import FloatingXP from '../../components/FloatingXP';

type TabType = 'scan' | 'search' | 'dining';

export default function MealLoggerScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('dining');
  const [searchQuery, setSearchQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<DiningHallItem | null>(null);
  const [xpToast, setXpToast] = useState(false);
  const [showFloatingXP, setShowFloatingXP] = useState(false);
  const [scanMealType, setScanMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  const addMeal = useMacroStore((s) => s.addMeal);
  const addXp = useUserStore((s) => s.addXp);
  const addPoints = useUserStore((s) => s.addPoints);
  const incrementMealsLogged = useUserStore((s) => s.incrementMealsLogged);

  const [selectedCategory, setSelectedCategory] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');

  const filteredMenu = DINING_HALL_MENU.filter(
    (item) =>
      item.category === selectedCategory &&
      (searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  function logItem(item: DiningHallItem, source: MealLog['source'] = 'dining_hall') {
    const meal: MealLog = {
      id: `ml-${Date.now()}`,
      userId: 'demo-001',
      mealName: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats,
      loggedAt: new Date().toISOString(),
      photoUrl: null,
      source,
      mealType: item.category === 'breakfast' ? 'breakfast' : item.category === 'lunch' ? 'lunch' : 'dinner',
    };
    addMeal(meal);
    addXp(50);
    addPoints(10);
    incrementMealsLogged();
    triggerFeedback();
  }

  function triggerFeedback() {
    setXpToast(true);
    setShowFloatingXP(true);
    setTimeout(() => setXpToast(false), 2500);
  }

  function handleScan() {
    setScanning(true);
    // Simulate AI scan
    setTimeout(() => {
      setScanning(false);
      setScanResult({
        id: 'scan-result',
        name: 'Grilled Chicken Salad',
        category: 'lunch',
        calories: 420,
        protein: 45,
        carbs: 22,
        fats: 16,
        diningHall: 'AI Scan',
      });
    }, 2000);
  }

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'scan', label: 'Photo Scan', icon: '📷' },
    { key: 'search', label: 'Search', icon: '🔍' },
    { key: 'dining', label: 'Rutgers Dining', icon: '🍽️' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>LOG A MEAL</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Floating XP Animation */}
      <FloatingXP amount={50} visible={showFloatingXP} onDone={() => setShowFloatingXP(false)} />

      {/* XP Toast */}
      {xpToast && (
        <View style={styles.xpToast}>
          <Text style={styles.xpToastText}>+50 XP  ·  Meal logged! 🎉</Text>
        </View>
      )}

      {/* Scan Tab */}
      {activeTab === 'scan' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner}>
          <View style={styles.scanArea}>
            {scanning ? (
              <View style={styles.scanLoading}>
                <Text style={styles.scanEmoji}>🔄</Text>
                <Text style={styles.scanText}>Analyzing your meal...</Text>
              </View>
            ) : scanResult ? (
              <View>
                <Text style={styles.scanResultTitle}>{scanResult.name}</Text>
                <View style={styles.scanMacros}>
                  <MacroPill label="Cal" value={scanResult.calories} color={Colors.primary} />
                  <MacroPill label="Protein" value={scanResult.protein} color={Colors.primary} />
                  <MacroPill label="Carbs" value={scanResult.carbs} color={Colors.accent} />
                  <MacroPill label="Fats" value={scanResult.fats} color={Colors.gold} />
                </View>
                {/* Meal Type Selector */}
                <View style={styles.mealTypeRow}>
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mt) => (
                    <TouchableOpacity
                      key={mt}
                      style={[styles.mealTypeBtn, scanMealType === mt && styles.mealTypeBtnActive]}
                      onPress={() => setScanMealType(mt)}
                    >
                      <Text style={[styles.mealTypeText, scanMealType === mt && styles.mealTypeTextActive]}>
                        {mt.charAt(0).toUpperCase() + mt.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={() => {
                    const adjusted = { ...scanResult, category: scanMealType as any };
                    logItem(adjusted, 'ai_scan');
                    setScanResult(null);
                  }}
                >
                  <Text style={styles.confirmBtnText}>CONFIRM & LOG</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setScanResult(null)}>
                  <Text style={styles.retakeText}>Retake Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.scanPlaceholder}>
                <Text style={{ fontSize: 64 }}>📷</Text>
                <Text style={styles.scanPlaceholderText}>
                  Take a photo of your meal
                </Text>
                <TouchableOpacity style={styles.scanBtn} onPress={handleScan}>
                  <Text style={styles.scanBtnText}>SCAN MEAL</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {DINING_HALL_MENU.filter((i) =>
            searchQuery.length > 0 && i.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((item) => (
            <DiningMenuItem key={item.id} item={item} onLog={() => logItem(item, 'search')} />
          ))}
          {searchQuery.length > 0 && (
            <Text style={styles.hintText}>
              Results from Rutgers dining database
            </Text>
          )}
        </ScrollView>
      )}

      {/* Dining Tab */}
      {activeTab === 'dining' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner}>
          <View style={styles.categoryRow}>
            {(['breakfast', 'lunch', 'dinner'] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, selectedCategory === cat && styles.categoryBtnActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredMenu.map((item) => (
            <DiningMenuItem key={item.id} item={item} onLog={() => logItem(item)} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[pillStyles.pill, { borderColor: color + '44' }]}>
      <Text style={[pillStyles.value, { color }]}>{value}</Text>
      <Text style={pillStyles.label}>{label}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    backgroundColor: Colors.surface2,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  value: { fontFamily: FontFamily.displayBold, fontSize: 18 },
  label: { fontFamily: FontFamily.body, fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
});

function DiningMenuItem({ item, onLog }: { item: DiningHallItem; onLog: () => void }) {
  return (
    <View style={menuStyles.card}>
      <View style={menuStyles.info}>
        <Text style={menuStyles.name}>{item.name}</Text>
        <Text style={menuStyles.hall}>{item.diningHall}</Text>
        <Text style={menuStyles.macros}>
          {item.calories} cal · {item.protein}P · {item.carbs}C · {item.fats}F
        </Text>
      </View>
      <TouchableOpacity style={menuStyles.addBtn} onPress={onLog}>
        <Text style={menuStyles.addBtnText}>+ ADD</Text>
      </TouchableOpacity>
    </View>
  );
}

const menuStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  info: { flex: 1 },
  name: { fontFamily: FontFamily.bodyMedium, fontSize: 14, color: Colors.textPrimary },
  hall: { fontFamily: FontFamily.body, fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  macros: { fontFamily: FontFamily.body, fontSize: 11, color: Colors.primary, marginTop: 4 },
  addBtn: {
    backgroundColor: Colors.primary + '18',
    borderWidth: 1,
    borderColor: Colors.primary + '44',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { fontFamily: FontFamily.displayBold, fontSize: 12, color: Colors.primary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontFamily: FontFamily.displayBold, fontSize: 24, color: Colors.textPrimary, letterSpacing: 1 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary + '14', borderColor: Colors.primary + '44' },
  tabIcon: { fontSize: 14 },
  tabLabel: { fontFamily: FontFamily.bodyMedium, fontSize: 12, color: Colors.textSecondary },
  tabLabelActive: { color: Colors.primary },
  tabContent: { flex: 1 },
  tabContentInner: { padding: 16, paddingBottom: 32 },
  xpToast: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  xpToastText: { fontFamily: FontFamily.displayBold, fontSize: 14, color: Colors.background },
  scanArea: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLoading: { alignItems: 'center', gap: 12 },
  scanEmoji: { fontSize: 48 },
  scanText: { fontFamily: FontFamily.bodyMedium, fontSize: 16, color: Colors.textSecondary },
  scanResultTitle: { fontFamily: FontFamily.displayBold, fontSize: 22, color: Colors.textPrimary, textAlign: 'center', marginBottom: 16 },
  scanMacros: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 12 },
  mealTypeRow: { flexDirection: 'row', gap: 6, marginBottom: 16, justifyContent: 'center' },
  mealTypeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealTypeBtnActive: { backgroundColor: Colors.primary + '14', borderColor: Colors.primary + '44' },
  mealTypeText: { fontFamily: FontFamily.body, fontSize: 12, color: Colors.textSecondary },
  mealTypeTextActive: { color: Colors.primary },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmBtnText: { fontFamily: FontFamily.displayBold, fontSize: 15, color: Colors.background },
  retakeText: { fontFamily: FontFamily.bodyMedium, fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  scanPlaceholder: { alignItems: 'center', gap: 16 },
  scanPlaceholderText: { fontFamily: FontFamily.bodyMedium, fontSize: 16, color: Colors.textSecondary },
  scanBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  scanBtnText: { fontFamily: FontFamily.displayBold, fontSize: 15, color: Colors.background },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontFamily: FontFamily.body,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  hintText: { fontFamily: FontFamily.body, fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  categoryBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryBtnActive: { backgroundColor: Colors.primary + '14', borderColor: Colors.primary + '44' },
  categoryText: { fontFamily: FontFamily.bodyMedium, fontSize: 13, color: Colors.textSecondary },
  categoryTextActive: { color: Colors.primary },
});

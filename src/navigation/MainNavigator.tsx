import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors, FontFamily } from '../theme';

import HomeScreen from '../screens/main/HomeScreen';
import MealLoggerScreen from '../screens/main/MealLoggerScreen';
import ChallengesScreen from '../screens/main/ChallengesScreen';
import LeaderboardScreen from '../screens/main/LeaderboardScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import RewardsScreen from '../screens/main/RewardsScreen';
import EditGoalsScreen from '../screens/main/EditGoalsScreen';
import NotificationsSettingsScreen from '../screens/main/NotificationsSettingsScreen';
import UniversitySettingsScreen from '../screens/main/UniversitySettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{icon}</Text>
      {focused && <View style={styles.tabGlow} />}
    </View>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Log"
        component={MealLoggerScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="➕" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Challenges"
        component={ChallengesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="⚔️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏆" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={HomeTabs} />
      <Stack.Screen name="Rewards" component={RewardsScreen} />
      <Stack.Screen name="EditGoals" component={EditGoalsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationsSettingsScreen} />
      <Stack.Screen name="UniversitySettings" component={UniversitySettingsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 85,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 10,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabEmoji: { fontSize: 22, opacity: 0.6 },
  tabEmojiActive: { opacity: 1 },
  tabGlow: {
    position: 'absolute',
    bottom: -6,
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});

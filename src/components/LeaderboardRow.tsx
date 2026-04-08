import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontFamily } from '../theme';
import { LeaderboardEntry } from '../types';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

const RANK_ICONS: Record<number, string> = { 1: '👑', 2: '🥈', 3: '🥉' };

export default function LeaderboardRow({ entry, isCurrentUser }: LeaderboardRowProps) {
  const rankIcon = RANK_ICONS[entry.rank];

  return (
    <View style={[styles.row, isCurrentUser && styles.currentUser]}>
      <View style={styles.rankCol}>
        {rankIcon ? (
          <Text style={styles.rankIcon}>{rankIcon}</Text>
        ) : (
          <Text style={styles.rankNum}>{entry.rank}</Text>
        )}
      </View>

      <View style={[styles.avatar, isCurrentUser && styles.avatarGlow]}>
        <Text style={styles.avatarText}>{entry.name[0]}</Text>
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, isCurrentUser && { color: Colors.primary }]}>
          {entry.name} {isCurrentUser ? '(You)' : ''}
        </Text>
        <Text style={styles.university}>{entry.university}</Text>
      </View>

      <View style={styles.statsCol}>
        <Text style={styles.score}>{entry.weeklyScore.toLocaleString()}</Text>
        <View style={styles.streakRow}>
          <Text style={{ fontSize: 10 }}>🔥</Text>
          <Text style={styles.streak}>{entry.streakCount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currentUser: {
    borderColor: Colors.primary + '44',
    backgroundColor: Colors.primary + '08',
  },
  rankCol: { width: 32, alignItems: 'center' },
  rankIcon: { fontSize: 18 },
  rankNum: { fontFamily: FontFamily.displayBold, fontSize: 16, color: Colors.textSecondary },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarGlow: { borderWidth: 2, borderColor: Colors.primary },
  avatarText: { fontFamily: FontFamily.bodySemiBold, fontSize: 14, color: Colors.textPrimary },
  info: { flex: 1 },
  name: { fontFamily: FontFamily.bodyMedium, fontSize: 14, color: Colors.textPrimary },
  university: { fontFamily: FontFamily.body, fontSize: 11, color: Colors.textSecondary },
  statsCol: { alignItems: 'flex-end' },
  score: { fontFamily: FontFamily.displayBold, fontSize: 16, color: Colors.textPrimary },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  streak: { fontFamily: FontFamily.body, fontSize: 11, color: Colors.textSecondary },
});

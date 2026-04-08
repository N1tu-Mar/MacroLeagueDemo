import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, FontFamily } from '../../theme';
import { MOCK_LEADERBOARD, MOCK_CHALLENGES } from '../../data/mockData';
import LeaderboardRow from '../../components/LeaderboardRow';
import { LeaderboardEntry } from '../../types';

type TabType = 'global' | 'friends' | 'team';

// Friends = a subset of mock users (simulating followed users)
const FRIEND_IDS = new Set(['demo-001', 'u-01', 'u-02', 'u-04', 'u-06']);

// Team = participants from the active team challenge
const TEAM_USER_IDS = new Set(
  MOCK_CHALLENGES.find((c) => c.type === 'team' && c.status === 'active')
    ?.participants.filter((p) => p.teamName === 'Scarlet Knights')
    .map((p) => p.userId) ?? []
);

function getFilteredData(tab: TabType): LeaderboardEntry[] {
  let data: LeaderboardEntry[];
  switch (tab) {
    case 'friends':
      data = MOCK_LEADERBOARD.filter((e) => FRIEND_IDS.has(e.userId));
      break;
    case 'team':
      data = MOCK_LEADERBOARD.filter((e) => TEAM_USER_IDS.has(e.userId));
      break;
    default:
      data = MOCK_LEADERBOARD;
  }
  // Re-rank for the filtered view
  return data
    .sort((a, b) => b.weeklyScore - a.weeklyScore)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('global');

  const data = getFilteredData(activeTab);
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);
  const myEntry = data.find((e) => e.userId === 'demo-001');

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>LEADERBOARD</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {([
          { key: 'global' as TabType, label: 'Global' },
          { key: 'friends' as TabType, label: 'Friends' },
          { key: 'team' as TabType, label: 'My Team' },
        ]).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Podium — only when we have 3+ */}
        {top3.length >= 3 && (
          <View style={styles.podium}>
            {/* 2nd place */}
            <View style={[styles.podiumSlot, { marginTop: 24 }]}>
              <View style={[styles.podiumAvatar, { borderColor: '#C0C0C0' }]}>
                <Text style={styles.podiumAvatarText}>{top3[1].name[0]}</Text>
              </View>
              <Text style={styles.podiumRank}>🥈</Text>
              <Text style={styles.podiumName} numberOfLines={1}>{top3[1].name}</Text>
              <Text style={styles.podiumScore}>{top3[1].weeklyScore.toLocaleString()}</Text>
              <View style={[styles.podiumBar, { height: 60, backgroundColor: '#C0C0C0' + '30' }]} />
            </View>

            {/* 1st place */}
            <View style={styles.podiumSlot}>
              <View style={[styles.podiumAvatar, styles.podiumAvatarGold]}>
                <Text style={styles.podiumAvatarText}>{top3[0].name[0]}</Text>
              </View>
              <Text style={styles.podiumRank}>👑</Text>
              <Text style={styles.podiumName} numberOfLines={1}>{top3[0].name}</Text>
              <Text style={[styles.podiumScore, { color: Colors.gold }]}>{top3[0].weeklyScore.toLocaleString()}</Text>
              <View style={[styles.podiumBar, { height: 80, backgroundColor: Colors.gold + '30' }]} />
            </View>

            {/* 3rd place */}
            <View style={[styles.podiumSlot, { marginTop: 36 }]}>
              <View style={[styles.podiumAvatar, { borderColor: '#CD7F32' }]}>
                <Text style={styles.podiumAvatarText}>{top3[2].name[0]}</Text>
              </View>
              <Text style={styles.podiumRank}>🥉</Text>
              <Text style={styles.podiumName} numberOfLines={1}>{top3[2].name}</Text>
              <Text style={styles.podiumScore}>{top3[2].weeklyScore.toLocaleString()}</Text>
              <View style={[styles.podiumBar, { height: 44, backgroundColor: '#CD7F32' + '30' }]} />
            </View>
          </View>
        )}

        {/* When fewer than 3 entries (team tab), skip podium */}
        {top3.length < 3 && top3.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            {top3.map((entry) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                isCurrentUser={entry.userId === 'demo-001'}
              />
            ))}
          </View>
        )}

        {/* Empty state */}
        {data.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40 }}>🏆</Text>
            <Text style={styles.emptyText}>No entries yet</Text>
          </View>
        )}

        {/* Remaining Rows */}
        <View style={styles.listSection}>
          {rest.map((entry) => (
            <LeaderboardRow
              key={entry.userId}
              entry={entry}
              isCurrentUser={entry.userId === 'demo-001'}
            />
          ))}
        </View>
      </ScrollView>

      {/* Pinned My Rank */}
      {myEntry && myEntry.rank > 3 && top3.length >= 3 && (
        <View style={styles.pinnedRank}>
          <LeaderboardRow entry={myEntry} isCurrentUser />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 8 },
  title: {
    fontFamily: FontFamily.displayBold,
    fontSize: 24,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary + '14', borderColor: Colors.primary + '44' },
  tabText: { fontFamily: FontFamily.bodyMedium, fontSize: 13, color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },
  content: { paddingHorizontal: 16, paddingBottom: 80 },
  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 24, paddingTop: 8 },
  podiumSlot: { alignItems: 'center', flex: 1 },
  podiumAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  podiumAvatarGold: { borderColor: Colors.gold, borderWidth: 2 },
  podiumAvatarText: { fontFamily: FontFamily.displayBold, fontSize: 18, color: Colors.textPrimary },
  podiumRank: { fontSize: 20, marginBottom: 2 },
  podiumName: { fontFamily: FontFamily.bodyMedium, fontSize: 12, color: Colors.textPrimary, maxWidth: 80, textAlign: 'center' },
  podiumScore: { fontFamily: FontFamily.displayBold, fontSize: 16, color: Colors.textPrimary, marginTop: 2 },
  podiumBar: { width: '80%', borderRadius: 6, marginTop: 6 },
  listSection: {},
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontFamily: FontFamily.bodyMedium, fontSize: 16, color: Colors.textSecondary, marginTop: 8 },
  pinnedRank: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
});

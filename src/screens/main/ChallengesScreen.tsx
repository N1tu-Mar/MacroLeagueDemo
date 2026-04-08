import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Colors, FontFamily } from '../../theme';
import { useChallengeStore } from '../../store/challengeStore';
import ChallengeCard from '../../components/ChallengeCard';
import { Challenge } from '../../types';

export default function ChallengesScreen() {
  const challenges = useChallengeStore((s) => s.challenges);
  const joinChallenge = useChallengeStore((s) => s.joinChallenge);
  const createChallenge = useChallengeStore((s) => s.createChallenge);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const active = challenges.filter((c) => c.status === 'active');
  const upcoming = challenges.filter((c) => c.status === 'upcoming');

  if (selectedChallenge) {
    return (
      <ChallengeDetail
        challenge={selectedChallenge}
        onBack={() => setSelectedChallenge(null)}
        onJoin={() => {
          joinChallenge(selectedChallenge.id);
          setSelectedChallenge(null);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>CHALLENGES</Text>

        {active.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACTIVE</Text>
            {active.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                onPress={() => setSelectedChallenge(c)}
              />
            ))}
          </View>
        )}

        {upcoming.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>UPCOMING</Text>
            {upcoming.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                onPress={() => setSelectedChallenge(c)}
              />
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
          <Text style={styles.createBtnText}>+ CREATE CHALLENGE</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Create Challenge Modal */}
      <CreateChallengeModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(data) => {
          createChallenge(data);
          setShowCreate(false);
          Alert.alert('Created!', 'Your challenge has been created. Invite your friends!');
        }}
      />
    </View>
  );
}

// ── Create Challenge Modal ────────────────────────────────

interface CreateData {
  name: string;
  type: 'solo' | 'team';
  goalType: string;
  duration: number;
  stakes: string;
}

function CreateChallengeModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: CreateData) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'solo' | 'team'>('team');
  const [goalType, setGoalType] = useState('protein');
  const [duration, setDuration] = useState(7);
  const [stakes, setStakes] = useState('');

  function handleCreate() {
    if (!name.trim()) {
      Alert.alert('Error', 'Give your challenge a name');
      return;
    }
    onCreate({ name: name.trim(), type, goalType, duration, stakes: stakes.trim() || 'Bragging rights' });
    setName('');
    setStakes('');
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={createStyles.overlay}>
        <View style={createStyles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={createStyles.title}>CREATE CHALLENGE</Text>

            {/* Name */}
            <Text style={createStyles.label}>Challenge Name</Text>
            <TextInput
              style={createStyles.input}
              placeholder="e.g. Protein Week"
              placeholderTextColor={Colors.textSecondary}
              value={name}
              onChangeText={setName}
            />

            {/* Type */}
            <Text style={createStyles.label}>Type</Text>
            <View style={createStyles.optionRow}>
              {(['solo', 'team'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[createStyles.optionBtn, type === t && createStyles.optionBtnActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[createStyles.optionText, type === t && createStyles.optionTextActive]}>
                    {t === 'solo' ? '🎯 Solo' : '⚔️ Team'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Goal Type */}
            <Text style={createStyles.label}>Goal</Text>
            <View style={createStyles.optionRow}>
              {[
                { key: 'protein', label: '💪 Protein' },
                { key: 'calories', label: '🔥 Calories' },
                { key: 'streak', label: '📆 Streak' },
              ].map((g) => (
                <TouchableOpacity
                  key={g.key}
                  style={[createStyles.optionBtn, goalType === g.key && createStyles.optionBtnActive]}
                  onPress={() => setGoalType(g.key)}
                >
                  <Text style={[createStyles.optionText, goalType === g.key && createStyles.optionTextActive]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Duration */}
            <Text style={createStyles.label}>Duration</Text>
            <View style={createStyles.optionRow}>
              {[3, 7, 14].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[createStyles.optionBtn, duration === d && createStyles.optionBtnActive]}
                  onPress={() => setDuration(d)}
                >
                  <Text style={[createStyles.optionText, duration === d && createStyles.optionTextActive]}>
                    {d} days
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stakes */}
            <Text style={createStyles.label}>Stakes (optional)</Text>
            <TextInput
              style={createStyles.input}
              placeholder="e.g. Loser buys coffee"
              placeholderTextColor={Colors.textSecondary}
              value={stakes}
              onChangeText={setStakes}
            />

            <TouchableOpacity style={createStyles.createBtn} onPress={handleCreate}>
              <Text style={createStyles.createBtnText}>CREATE</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={createStyles.cancelBtn}>
              <Text style={createStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  title: { fontFamily: FontFamily.displayBold, fontSize: 22, color: Colors.textPrimary, marginBottom: 20 },
  label: { fontFamily: FontFamily.bodySemiBold, fontSize: 13, color: Colors.textSecondary, letterSpacing: 1, marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: Colors.surface2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontFamily: FontFamily.body,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  optionRow: { flexDirection: 'row', gap: 8 },
  optionBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionBtnActive: { backgroundColor: Colors.primary + '14', borderColor: Colors.primary + '44' },
  optionText: { fontFamily: FontFamily.bodyMedium, fontSize: 13, color: Colors.textSecondary },
  optionTextActive: { color: Colors.primary },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  createBtnText: { fontFamily: FontFamily.displayBold, fontSize: 16, color: Colors.background },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { fontFamily: FontFamily.bodyMedium, fontSize: 14, color: Colors.textSecondary },
});

// ── Challenge Detail ──────────────────────────────────────

function ChallengeDetail({
  challenge,
  onBack,
  onJoin,
}: {
  challenge: Challenge;
  onBack: () => void;
  onJoin: () => void;
}) {
  const [reactions, setReactions] = useState<Record<string, number>>({
    '💪': 3, '🔥': 7, '👏': 2, '😤': 1, '🎯': 4,
  });
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set());

  function toggleReaction(emoji: string) {
    setMyReactions((prev) => {
      const next = new Set(prev);
      if (next.has(emoji)) {
        next.delete(emoji);
        setReactions((r) => ({ ...r, [emoji]: (r[emoji] ?? 1) - 1 }));
      } else {
        next.add(emoji);
        setReactions((r) => ({ ...r, [emoji]: (r[emoji] ?? 0) + 1 }));
      }
      return next;
    });
  }

  const teams: Record<string, { score: number; members: string[] }> = {};
  challenge.participants.forEach((p) => {
    if (!teams[p.teamName]) teams[p.teamName] = { score: 0, members: [] };
    teams[p.teamName].score += p.score;
    teams[p.teamName].members.push(p.userName);
  });
  const teamEntries = Object.entries(teams);
  const isParticipant = challenge.participants.some((p) => p.userId === 'demo-001');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.detailTitle}>{challenge.name}</Text>
      <Text style={styles.detailMeta}>
        {challenge.type === 'solo' ? 'Solo Challenge' : challenge.type === 'team' ? 'Team Challenge' : 'Floor vs Floor'} · Ends{' '}
        {new Date(challenge.endDate).toLocaleDateString()}
      </Text>

      {/* Scoreboard */}
      {teamEntries.length >= 2 && (
        <View style={styles.scoreboard}>
          <View style={styles.teamBlock}>
            <Text style={styles.teamNameLg}>{teamEntries[0][0]}</Text>
            <Text style={[styles.teamScoreLg, { color: Colors.primary }]}>
              {teamEntries[0][1].score}
            </Text>
            {teamEntries[0][1].members.map((m, i) => (
              <Text key={i} style={styles.memberName}>{m}</Text>
            ))}
          </View>
          <View style={styles.vsBlock}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={[styles.teamBlock, { alignItems: 'flex-end' }]}>
            <Text style={styles.teamNameLg}>{teamEntries[1][0]}</Text>
            <Text style={[styles.teamScoreLg, { color: Colors.accent }]}>
              {teamEntries[1][1].score}
            </Text>
            {teamEntries[1][1].members.map((m, i) => (
              <Text key={i} style={styles.memberName}>{m}</Text>
            ))}
          </View>
        </View>
      )}

      {/* Solo score */}
      {teamEntries.length === 1 && (
        <View style={styles.soloScoreCard}>
          <Text style={styles.soloLabel}>Your Progress</Text>
          <Text style={[styles.teamScoreLg, { color: Colors.primary }]}>
            {teamEntries[0][1].score}
          </Text>
        </View>
      )}

      {/* Goals */}
      <View style={styles.goalsSection}>
        <Text style={styles.sectionTitle}>GOALS</Text>
        {challenge.goals.map((g) => (
          <View key={g.id} style={styles.goalRow}>
            <Text style={{ fontSize: 16 }}>{g.completed ? '✅' : '⏳'}</Text>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>{g.goalType}</Text>
              <Text style={styles.goalPts}>+{g.pointsValue} pts</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Stakes */}
      <View style={styles.stakesCard}>
        <Text style={styles.stakesLabel}>🏆 STAKES</Text>
        <Text style={styles.stakesValue}>{challenge.stakesText}</Text>
      </View>

      {/* Reactions */}
      <View style={styles.reactionRow}>
        {['💪', '🔥', '👏', '😤', '🎯'].map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={[
              styles.reactionBtn,
              myReactions.has(emoji) && styles.reactionBtnActive,
            ]}
            onPress={() => toggleReaction(emoji)}
          >
            <Text style={{ fontSize: 18 }}>{emoji}</Text>
            <Text style={[
              styles.reactionCount,
              myReactions.has(emoji) && { color: Colors.primary },
            ]}>
              {reactions[emoji] ?? 0}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!isParticipant && (
        <TouchableOpacity style={styles.joinBtn} onPress={onJoin}>
          <Text style={styles.joinBtnText}>JOIN CHALLENGE</Text>
        </TouchableOpacity>
      )}

      {isParticipant && (
        <View style={styles.participatingBadge}>
          <Text style={styles.participatingText}>✓ You're in this challenge</Text>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 60 },
  title: {
    fontFamily: FontFamily.displayBold,
    fontSize: 24,
    color: Colors.textPrimary,
    letterSpacing: 1,
    marginBottom: 20,
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  createBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  createBtnText: { fontFamily: FontFamily.displayBold, fontSize: 15, color: Colors.primary },
  // Detail
  backBtn: { marginBottom: 16 },
  backText: { fontFamily: FontFamily.bodyMedium, fontSize: 15, color: Colors.primary },
  detailTitle: { fontFamily: FontFamily.displayBold, fontSize: 28, color: Colors.textPrimary, marginBottom: 4 },
  detailMeta: { fontFamily: FontFamily.body, fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  scoreboard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 20,
  },
  teamBlock: { flex: 1 },
  vsBlock: { justifyContent: 'center', paddingHorizontal: 12 },
  vsText: { fontFamily: FontFamily.displayBold, fontSize: 18, color: Colors.textSecondary },
  teamNameLg: { fontFamily: FontFamily.displayBold, fontSize: 16, color: Colors.textPrimary, marginBottom: 4 },
  teamScoreLg: { fontFamily: FontFamily.displayBold, fontSize: 32, marginBottom: 8 },
  memberName: { fontFamily: FontFamily.body, fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  soloScoreCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  soloLabel: { fontFamily: FontFamily.bodyMedium, fontSize: 14, color: Colors.textSecondary, marginBottom: 4 },
  goalsSection: { marginBottom: 20 },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  goalInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  goalName: { fontFamily: FontFamily.bodyMedium, fontSize: 14, color: Colors.textPrimary },
  goalPts: { fontFamily: FontFamily.displayBold, fontSize: 14, color: Colors.primary },
  stakesCard: {
    backgroundColor: Colors.gold + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold + '33',
    padding: 16,
    marginBottom: 20,
  },
  stakesLabel: { fontFamily: FontFamily.displayBold, fontSize: 13, color: Colors.gold, marginBottom: 4 },
  stakesValue: { fontFamily: FontFamily.bodyMedium, fontSize: 15, color: Colors.textPrimary },
  reactionRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  reactionBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionBtnActive: {
    backgroundColor: Colors.primary + '14',
    borderColor: Colors.primary + '44',
  },
  reactionCount: {
    fontFamily: FontFamily.body,
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  joinBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinBtnText: { fontFamily: FontFamily.displayBold, fontSize: 16, color: Colors.background },
  participatingBadge: {
    backgroundColor: Colors.primary + '12',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '22',
    paddingVertical: 14,
    alignItems: 'center',
  },
  participatingText: { fontFamily: FontFamily.bodyMedium, fontSize: 14, color: Colors.primary },
});

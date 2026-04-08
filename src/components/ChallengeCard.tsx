import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontFamily } from '../theme';
import { Challenge } from '../types';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress?: () => void;
}

function getTimeRemaining(endDate: string): string {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m left`;
}

function getTeamScores(challenge: Challenge) {
  const teams: Record<string, number> = {};
  challenge.participants.forEach((p) => {
    teams[p.teamName] = (teams[p.teamName] || 0) + p.score;
  });
  const entries = Object.entries(teams);
  if (entries.length < 2) return null;
  return { team1: { name: entries[0][0], score: entries[0][1] }, team2: { name: entries[1][0], score: entries[1][1] } };
}

export default function ChallengeCard({ challenge, onPress }: ChallengeCardProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(challenge.endDate));
  const teamScores = getTeamScores(challenge);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeRemaining(challenge.endDate)), 60000);
    return () => clearInterval(timer);
  }, [challenge.endDate]);

  const typeBadge =
    challenge.type === 'solo' ? 'Solo' : challenge.type === 'team' ? 'Team' : 'Floor vs Floor';
  const typeBadgeColor =
    challenge.type === 'solo' ? Colors.primary : challenge.type === 'team' ? Colors.accent : Colors.gold;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.name}>{challenge.name}</Text>
        <View style={[styles.badge, { backgroundColor: typeBadgeColor + '22', borderColor: typeBadgeColor }]}>
          <Text style={[styles.badgeText, { color: typeBadgeColor }]}>{typeBadge}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.timeLeft}>{timeLeft}</Text>
        <Text style={styles.stakes}>{challenge.stakesText}</Text>
      </View>

      {teamScores && (
        <View style={styles.scoreSection}>
          <View style={styles.teamRow}>
            <Text style={styles.teamName}>{teamScores.team1.name}</Text>
            <Text style={[styles.teamScore, { color: Colors.primary }]}>{teamScores.team1.score}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${(teamScores.team1.score / (teamScores.team1.score + teamScores.team2.score)) * 100}%`,
                  backgroundColor: Colors.primary,
                },
              ]}
            />
          </View>
          <View style={styles.teamRow}>
            <Text style={styles.teamName}>{teamScores.team2.name}</Text>
            <Text style={[styles.teamScore, { color: Colors.accent }]}>{teamScores.team2.score}</Text>
          </View>
        </View>
      )}

      {!teamScores && challenge.participants.length > 0 && (
        <View style={styles.soloScore}>
          <Text style={styles.soloLabel}>Your Score</Text>
          <Text style={[styles.teamScore, { color: Colors.primary }]}>
            {challenge.participants[0]?.score ?? 0}
          </Text>
        </View>
      )}

      <View style={styles.topParticipants}>
        {challenge.participants.slice(0, 3).map((p, i) => (
          <View key={p.id} style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{p.userName[0]}</Text>
          </View>
        ))}
        {challenge.participants.length > 3 && (
          <Text style={styles.moreText}>+{challenge.participants.length - 3}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontFamily: FontFamily.displayBold, fontSize: 18, color: Colors.textPrimary, flex: 1 },
  badge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: FontFamily.bodySemiBold, fontSize: 11 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  timeLeft: { fontFamily: FontFamily.bodyMedium, fontSize: 13, color: Colors.accent },
  stakes: { fontFamily: FontFamily.body, fontSize: 12, color: Colors.textSecondary, maxWidth: '55%', textAlign: 'right' },
  scoreSection: { marginBottom: 12 },
  teamRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  teamName: { fontFamily: FontFamily.bodyMedium, fontSize: 13, color: Colors.textSecondary },
  teamScore: { fontFamily: FontFamily.displayBold, fontSize: 16 },
  progressBarBg: { height: 6, borderRadius: 3, backgroundColor: Colors.surface2, marginVertical: 6 },
  progressBarFill: { height: 6, borderRadius: 3 },
  soloScore: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  soloLabel: { fontFamily: FontFamily.bodyMedium, fontSize: 13, color: Colors.textSecondary },
  topParticipants: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatarCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: FontFamily.bodySemiBold, fontSize: 12, color: Colors.textPrimary },
  moreText: { fontFamily: FontFamily.body, fontSize: 12, color: Colors.textSecondary },
});

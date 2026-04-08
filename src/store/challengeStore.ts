import { create } from 'zustand';
import { Challenge } from '../types';
import { MOCK_CHALLENGES } from '../data/mockData';

interface ChallengeState {
  challenges: Challenge[];
  getActive: () => Challenge[];
  getUpcoming: () => Challenge[];
  joinChallenge: (challengeId: string) => void;
  createChallenge: (data: {
    name: string;
    type: 'solo' | 'team';
    goalType: string;
    duration: number;
    stakes: string;
  }) => void;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: MOCK_CHALLENGES,
  getActive: () => get().challenges.filter((c) => c.status === 'active'),
  getUpcoming: () => get().challenges.filter((c) => c.status === 'upcoming'),
  joinChallenge: (challengeId: string) =>
    set((state) => ({
      challenges: state.challenges.map((c) =>
        c.id === challengeId
          ? {
              ...c,
              participants: [
                ...c.participants,
                {
                  id: `cp-new-${Date.now()}`,
                  challengeId,
                  userId: 'demo-001',
                  userName: 'Nityanth',
                  avatarUrl: null,
                  teamName: 'Solo',
                  score: 0,
                },
              ],
            }
          : c
      ),
    })),
  createChallenge: (data) => {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + data.duration);

    const newChallenge: Challenge = {
      id: `ch-${Date.now()}`,
      name: data.name,
      type: data.type,
      goalTypes: [data.goalType],
      durationDays: data.duration,
      stakesText: data.stakes,
      startDate: now.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      createdBy: 'demo-001',
      status: 'active',
      participants: [
        {
          id: `cp-${Date.now()}`,
          challengeId: `ch-${Date.now()}`,
          userId: 'demo-001',
          userName: 'Nityanth',
          avatarUrl: null,
          teamName: data.type === 'solo' ? 'Solo' : 'My Team',
          score: 0,
        },
      ],
      goals: [
        {
          id: `cg-${Date.now()}`,
          challengeId: `ch-${Date.now()}`,
          goalType: data.goalType === 'protein' ? 'Hit daily protein' : data.goalType === 'calories' ? 'Hit calorie goal' : 'Log every day',
          targetValue: data.goalType === 'protein' ? 180 : data.goalType === 'calories' ? 2500 : data.duration,
          pointsValue: 50,
        },
      ],
    };

    set((state) => ({
      challenges: [newChallenge, ...state.challenges],
    }));
  },
}));

import {
  UserProfile,
  DailyGoals,
  MealLog,
  Challenge,
  LeaderboardEntry,
  Reward,
  Achievement,
  ActivityFeedItem,
  DiningHallItem,
} from '../types';

// ── Demo User ──────────────────────────────────────────────
export const DEMO_USER: UserProfile = {
  id: 'demo-001',
  username: 'nityanth',
  name: 'Nityanth',
  email: 'nityanth@rutgers.edu',
  university: 'Rutgers University',
  goalType: 'muscle',
  avatarUrl: null,
  xp: 2750,
  level: 7,
  streakCount: 7,
  longestStreak: 14,
  totalMealsLogged: 89,
  challengesWon: 3,
  points: 1450,
  createdAt: '2026-02-15',
};

export const DEMO_DAILY_GOALS: DailyGoals = {
  calories: 2500,
  protein: 180,
  carbs: 280,
  fats: 80,
};

// ── Today's Meals (demo user) ─────────────────────────────
export const DEMO_TODAYS_MEALS: MealLog[] = [
  {
    id: 'ml-001',
    userId: 'demo-001',
    mealName: 'Egg White Omelette with Spinach',
    calories: 320,
    protein: 38,
    carbs: 12,
    fats: 14,
    loggedAt: '2026-04-01T08:15:00',
    photoUrl: null,
    source: 'dining_hall',
    mealType: 'breakfast',
  },
  {
    id: 'ml-002',
    userId: 'demo-001',
    mealName: 'Grilled Chicken Bowl',
    calories: 580,
    protein: 52,
    carbs: 48,
    fats: 18,
    loggedAt: '2026-04-01T12:30:00',
    photoUrl: null,
    source: 'ai_scan',
    mealType: 'lunch',
  },
  {
    id: 'ml-003',
    userId: 'demo-001',
    mealName: 'Protein Shake',
    calories: 220,
    protein: 40,
    carbs: 8,
    fats: 4,
    loggedAt: '2026-04-01T15:00:00',
    photoUrl: null,
    source: 'search',
    mealType: 'snack',
  },
];

// ── 7 Days History ────────────────────────────────────────
export const DEMO_WEEKLY_PROTEIN: number[] = [165, 180, 140, 175, 190, 155, 130];
export const DEMO_WEEKLY_LABELS: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ── Leaderboard ───────────────────────────────────────────
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: 'u-01', name: 'Marcus Chen', university: 'Rutgers', avatarUrl: null, weeklyScore: 1820, streakCount: 21 },
  { rank: 2, userId: 'u-02', name: 'Sarah Kim', university: 'Rutgers', avatarUrl: null, weeklyScore: 1750, streakCount: 14 },
  { rank: 3, userId: 'u-03', name: 'Jake Thompson', university: 'Rutgers', avatarUrl: null, weeklyScore: 1680, streakCount: 12 },
  { rank: 4, userId: 'demo-001', name: 'Nityanth', university: 'Rutgers', avatarUrl: null, weeklyScore: 1590, streakCount: 7 },
  { rank: 5, userId: 'u-04', name: 'Priya Patel', university: 'Rutgers', avatarUrl: null, weeklyScore: 1520, streakCount: 9 },
  { rank: 6, userId: 'u-05', name: 'Jordan Rivera', university: 'Rutgers', avatarUrl: null, weeklyScore: 1480, streakCount: 5 },
  { rank: 7, userId: 'u-06', name: 'Emily Walsh', university: 'Rutgers', avatarUrl: null, weeklyScore: 1350, streakCount: 8 },
  { rank: 8, userId: 'u-07', name: 'Deshawn Brown', university: 'Rutgers', avatarUrl: null, weeklyScore: 1290, streakCount: 3 },
  { rank: 9, userId: 'u-08', name: 'Olivia Nguyen', university: 'Rutgers', avatarUrl: null, weeklyScore: 1180, streakCount: 6 },
  { rank: 10, userId: 'u-09', name: 'Ryan Martinez', university: 'Rutgers', avatarUrl: null, weeklyScore: 1050, streakCount: 2 },
];

// ── Challenges ────────────────────────────────────────────
export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'ch-001',
    name: 'Protein Week',
    type: 'team',
    goalTypes: ['protein'],
    durationDays: 7,
    stakesText: 'Losers buy winners Playa Bowls',
    startDate: '2026-03-28',
    endDate: '2026-04-04',
    createdBy: 'u-01',
    status: 'active',
    participants: [
      { id: 'cp-01', challengeId: 'ch-001', userId: 'demo-001', userName: 'Nityanth', avatarUrl: null, teamName: 'Scarlet Knights', score: 480 },
      { id: 'cp-02', challengeId: 'ch-001', userId: 'u-01', userName: 'Marcus Chen', avatarUrl: null, teamName: 'Scarlet Knights', score: 520 },
      { id: 'cp-03', challengeId: 'ch-001', userId: 'u-02', userName: 'Sarah Kim', avatarUrl: null, teamName: 'Scarlet Knights', score: 445 },
      { id: 'cp-04', challengeId: 'ch-001', userId: 'u-04', userName: 'Priya Patel', avatarUrl: null, teamName: 'River Rats', score: 410 },
      { id: 'cp-05', challengeId: 'ch-001', userId: 'u-05', userName: 'Jordan Rivera', avatarUrl: null, teamName: 'River Rats', score: 390 },
      { id: 'cp-06', challengeId: 'ch-001', userId: 'u-06', userName: 'Emily Walsh', avatarUrl: null, teamName: 'River Rats', score: 430 },
    ],
    goals: [
      { id: 'cg-01', challengeId: 'ch-001', goalType: 'Hit daily protein', targetValue: 180, pointsValue: 50, completed: true },
      { id: 'cg-02', challengeId: 'ch-001', goalType: 'Log all 3 meals', targetValue: 3, pointsValue: 30, completed: false },
      { id: 'cg-03', challengeId: 'ch-001', goalType: 'Stay under calorie limit', targetValue: 2500, pointsValue: 20 },
    ],
  },
  {
    id: 'ch-002',
    name: 'Clean Eating Streak',
    type: 'solo',
    goalTypes: ['streak', 'calories'],
    durationDays: 14,
    stakesText: '14-day streak = 500 bonus points',
    startDate: '2026-03-25',
    endDate: '2026-04-08',
    createdBy: 'demo-001',
    status: 'active',
    participants: [
      { id: 'cp-07', challengeId: 'ch-002', userId: 'demo-001', userName: 'Nityanth', avatarUrl: null, teamName: 'Solo', score: 340 },
    ],
    goals: [
      { id: 'cg-04', challengeId: 'ch-002', goalType: 'Log every day', targetValue: 14, pointsValue: 100, completed: false },
      { id: 'cg-05', challengeId: 'ch-002', goalType: 'Hit calorie goal', targetValue: 2500, pointsValue: 25, completed: true },
    ],
  },
  {
    id: 'ch-003',
    name: 'April Shredding Cup',
    type: 'floor_vs_floor',
    goalTypes: ['protein', 'calories', 'streak'],
    durationDays: 7,
    stakesText: 'Winner gets 20% off at Playa Bowls',
    startDate: '2026-04-05',
    endDate: '2026-04-12',
    createdBy: 'u-03',
    status: 'upcoming',
    participants: [],
    goals: [
      { id: 'cg-06', challengeId: 'ch-003', goalType: 'Hit all macro goals', targetValue: 1, pointsValue: 75 },
    ],
  },
];

// ── Rewards ───────────────────────────────────────────────
export const MOCK_REWARDS: Reward[] = [
  { id: 'rw-01', partnerName: 'Playa Bowls', partnerLogo: '🥣', description: '20% off any bowl', pointsCost: 500, expiryDate: '2026-05-01', imageUrl: null, category: 'Food' },
  { id: 'rw-02', partnerName: 'Fusion Smoothies', partnerLogo: '🥤', description: 'Free small smoothie', pointsCost: 350, expiryDate: '2026-05-15', imageUrl: null, category: 'Drinks' },
  { id: 'rw-03', partnerName: 'RU Café', partnerLogo: '☕', description: '$2 off any coffee', pointsCost: 200, expiryDate: '2026-04-30', imageUrl: null, category: 'Drinks' },
  { id: 'rw-04', partnerName: 'Scarlet Fitness', partnerLogo: '💪', description: 'Free day pass', pointsCost: 750, expiryDate: '2026-06-01', imageUrl: null, category: 'Fitness' },
  { id: 'rw-05', partnerName: 'Muscle Meals Prep', partnerLogo: '🍱', description: '15% off weekly plan', pointsCost: 600, expiryDate: '2026-05-20', imageUrl: null, category: 'Food' },
];

// ── Achievements ──────────────────────────────────────────
export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach-01', name: '7-Day Streak', description: 'Log meals for 7 days straight', icon: '🔥', unlocked: true, unlockedAt: '2026-03-28' },
  { id: 'ach-02', name: 'Protein King', description: 'Hit protein goal 10 days in a row', icon: '👑', unlocked: true, unlockedAt: '2026-03-20' },
  { id: 'ach-03', name: 'First Challenge Win', description: 'Win your first team challenge', icon: '🏆', unlocked: true, unlockedAt: '2026-03-15' },
  { id: 'ach-04', name: 'Team MVP', description: 'Score highest on your team', icon: '⭐', unlocked: false },
  { id: 'ach-05', name: '30-Day Streak', description: 'Log meals for 30 days straight', icon: '💎', unlocked: false },
  { id: 'ach-06', name: 'Century Club', description: 'Log 100 meals total', icon: '💯', unlocked: false },
  { id: 'ach-07', name: 'Macro Master', description: 'Hit all macros perfectly for a week', icon: '🎯', unlocked: false },
];

// ── Activity Feed ─────────────────────────────────────────
export const MOCK_ACTIVITY_FEED: ActivityFeedItem[] = [
  { id: 'af-01', userId: 'u-01', userName: 'Marcus Chen', actionType: 'meal_logged', metadata: 'Logged lunch — 52g protein 💪', createdAt: '2026-04-01T12:45:00' },
  { id: 'af-02', userId: 'u-02', userName: 'Sarah Kim', actionType: 'streak', metadata: 'Hit a 14-day streak! 🔥', createdAt: '2026-04-01T11:00:00' },
  { id: 'af-03', userId: 'u-04', userName: 'Priya Patel', actionType: 'challenge_joined', metadata: 'Joined Protein Week', createdAt: '2026-04-01T09:30:00' },
  { id: 'af-04', userId: 'u-03', userName: 'Jake Thompson', actionType: 'meal_logged', metadata: 'Logged breakfast — 680 cal', createdAt: '2026-04-01T08:20:00' },
  { id: 'af-05', userId: 'u-06', userName: 'Emily Walsh', actionType: 'reward_redeemed', metadata: 'Redeemed Playa Bowls 20% off 🎉', createdAt: '2026-03-31T18:00:00' },
];

// ── Rutgers Dining Hall Menu ──────────────────────────────
export const DINING_HALL_MENU: DiningHallItem[] = [
  // Breakfast
  { id: 'dh-01', name: 'Egg White Omelette with Spinach', category: 'breakfast', calories: 320, protein: 38, carbs: 12, fats: 14, diningHall: 'Busch Dining' },
  { id: 'dh-02', name: 'Greek Yogurt Parfait', category: 'breakfast', calories: 280, protein: 22, carbs: 35, fats: 8, diningHall: 'Busch Dining' },
  { id: 'dh-03', name: 'Oatmeal with Banana', category: 'breakfast', calories: 350, protein: 12, carbs: 62, fats: 7, diningHall: 'Livingston Dining' },
  { id: 'dh-04', name: 'Turkey Sausage & Toast', category: 'breakfast', calories: 410, protein: 28, carbs: 38, fats: 16, diningHall: 'Livingston Dining' },
  // Lunch
  { id: 'dh-05', name: 'Grilled Chicken Bowl', category: 'lunch', calories: 580, protein: 52, carbs: 48, fats: 18, diningHall: 'Busch Dining' },
  { id: 'dh-06', name: 'Turkey Burger with Sweet Potato Fries', category: 'lunch', calories: 650, protein: 42, carbs: 58, fats: 24, diningHall: 'Busch Dining' },
  { id: 'dh-07', name: 'Salmon Teriyaki with Rice', category: 'lunch', calories: 620, protein: 45, carbs: 55, fats: 20, diningHall: 'Livingston Dining' },
  { id: 'dh-08', name: 'Black Bean Burrito Bowl', category: 'lunch', calories: 520, protein: 24, carbs: 68, fats: 16, diningHall: 'Livingston Dining' },
  // Dinner
  { id: 'dh-09', name: 'Steak with Broccoli & Rice', category: 'dinner', calories: 720, protein: 58, carbs: 52, fats: 28, diningHall: 'Busch Dining' },
  { id: 'dh-10', name: 'Grilled Tilapia with Quinoa', category: 'dinner', calories: 480, protein: 44, carbs: 42, fats: 12, diningHall: 'Busch Dining' },
  { id: 'dh-11', name: 'Chicken Stir Fry', category: 'dinner', calories: 550, protein: 48, carbs: 45, fats: 16, diningHall: 'Livingston Dining' },
  { id: 'dh-12', name: 'Pasta Primavera', category: 'dinner', calories: 480, protein: 18, carbs: 72, fats: 14, diningHall: 'Livingston Dining' },
];

// ── How To Earn ───────────────────────────────────────────
export const EARN_RULES = [
  { action: 'Log a meal', points: 10 },
  { action: 'Hit daily protein goal', points: 25 },
  { action: '7-day streak', points: 100 },
  { action: 'Win a challenge', points: 250 },
];

// ── XP Level Thresholds ───────────────────────────────────
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Rookie',
  2: 'Starter',
  3: 'Consistent',
  4: 'Dedicated',
  5: 'Competitor',
  6: 'Contender',
  7: 'Macro Athlete',
  8: 'Elite',
  9: 'Champion',
  10: 'Legend',
};

export function getXpForLevel(level: number): number {
  return level * 500;
}

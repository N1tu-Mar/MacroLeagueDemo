-- The original 45-65% carbs-of-calories range is too narrow for common macro
-- splits (muscle/weight-loss presets land around 40%). Relax the floor to 25%
-- so athletes and low-carb approaches can save valid goals.

alter table public.profiles
  drop constraint profiles_goal_carbs_energy_range;

alter table public.profiles
  add constraint profiles_goal_carbs_energy_range check (
    goal_carbs_g is null
    or goal_calories is null
    or (
      goal_carbs_g * 4 >= goal_calories * 0.25
      and goal_carbs_g * 4 <= goal_calories * 0.65
    )
  );

comment on constraint profiles_goal_carbs_energy_range on public.profiles is
  'Carbs must supply 25-65 % of calorie goal when both values are set, accommodating both low-carb and higher-carb dietary approaches.';

// Hardcoded fallback data — shown when backend returns empty / errors,
// so every tab has something to look at while testing.

import type { House, HouseMember, Expense, ScheduleEntry } from '../api/house';
import type { NutritionLog, DailyNutrition } from '../api/nutrition';
import type { ShoppingList } from '../api/shopping';

export const DEMO_HOUSE: House = {
  id: 'demo-house',
  name: '123 Maple Street',
  invite_code: 'DEMO42',
  created_by: 'demo',
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
};

export const DEMO_MEMBERS: HouseMember[] = [
  { user_id: 'm1', name: 'Sai Kumar',     email: 'sai@maplest.com',   role: 'admin',  joined_at: new Date().toISOString() },
  { user_id: 'm2', name: 'Priya Patel',   email: 'priya@maplest.com', role: 'member', joined_at: new Date().toISOString() },
  { user_id: 'm3', name: 'Alex Johnson',  email: 'alex@maplest.com',  role: 'member', joined_at: new Date().toISOString() },
  { user_id: 'm4', name: 'Maria Garcia',  email: 'maria@maplest.com', role: 'member', joined_at: new Date().toISOString() },
];

const today = new Date();
const date = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export const DEMO_SCHEDULE: ScheduleEntry[] = [
  { id: 's1', house_id: 'demo-house', cook_user_id: 'm1', cook_name: 'Sai Kumar',    meal_date: date(0), meal_type: 'dinner', status: 'scheduled' },
  { id: 's2', house_id: 'demo-house', cook_user_id: 'm2', cook_name: 'Priya Patel',  meal_date: date(1), meal_type: 'dinner', status: 'scheduled' },
  { id: 's3', house_id: 'demo-house', cook_user_id: 'm3', cook_name: 'Alex Johnson', meal_date: date(2), meal_type: 'dinner', status: 'scheduled' },
  { id: 's4', house_id: 'demo-house', cook_user_id: 'm4', cook_name: 'Maria Garcia', meal_date: date(3), meal_type: 'dinner', status: 'scheduled' },
  { id: 's5', house_id: 'demo-house', cook_user_id: 'm1', cook_name: 'Sai Kumar',    meal_date: date(-1), meal_type: 'dinner', status: 'completed' },
  { id: 's6', house_id: 'demo-house', cook_user_id: 'm2', cook_name: 'Priya Patel',  meal_date: date(-2), meal_type: 'dinner', status: 'completed' },
];

export const DEMO_CHORES = [
  { id: 'c1', type_name: 'Dishwashing',    assigned_to_name: 'Sai Kumar',    assigned_date: date(0) },
  { id: 'c2', type_name: 'Trash & Recycle', assigned_to_name: 'Priya Patel',  assigned_date: date(0) },
  { id: 'c3', type_name: 'Kitchen Cleaning', assigned_to_name: 'Alex Johnson', assigned_date: date(1) },
  { id: 'c4', type_name: 'Bathroom Cleaning', assigned_to_name: 'Maria Garcia', assigned_date: date(2) },
  { id: 'c5', type_name: 'Vacuuming',      assigned_to_name: 'Sai Kumar',    assigned_date: date(3) },
];

export const DEMO_EXPENSES: Expense[] = [
  { id: 'e1', house_id: 'demo-house', description: 'Groceries — Costco run',     amount: 187.43, paid_by: 'm1', payer_name: 'Sai Kumar',    category: 'groceries', created_at: date(-1) },
  { id: 'e2', house_id: 'demo-house', description: 'Olive oil + spices',          amount:  42.10, paid_by: 'm2', payer_name: 'Priya Patel',  category: 'groceries', created_at: date(-3) },
  { id: 'e3', house_id: 'demo-house', description: 'Internet bill (May)',         amount:  79.99, paid_by: 'm3', payer_name: 'Alex Johnson', category: 'utilities', created_at: date(-7) },
  { id: 'e4', house_id: 'demo-house', description: 'Trader Joe\'s — produce',     amount:  64.27, paid_by: 'm4', payer_name: 'Maria Garcia', category: 'groceries', created_at: date(-5) },
  { id: 'e5', house_id: 'demo-house', description: 'Dish soap, sponges, foil',    amount:  23.55, paid_by: 'm1', payer_name: 'Sai Kumar',    category: 'household',  created_at: date(-10) },
];

export const DEMO_LEADERBOARD = [
  { user_id: 'm2', name: 'Priya Patel',  score: 142, total_meals: 18 },
  { user_id: 'm1', name: 'Sai Kumar',    score: 128, total_meals: 16 },
  { user_id: 'm3', name: 'Alex Johnson', score:  97, total_meals: 12 },
  { user_id: 'm4', name: 'Maria Garcia', score:  85, total_meals: 11 },
];

export const DEMO_DAILY_NUTRITION: DailyNutrition = {
  date: new Date().toISOString().slice(0, 10),
  total_calories: 1623,
  total_protein:   112,
  total_carbs:     184,
  total_fat:        54,
  goals: { calories: 2000, protein: 130, carbs: 250, fat: 70 },
  progress: { calories_percent: 81, protein_percent: 86, carbs_percent: 74, fat_percent: 77 },
};

export const DEMO_NUTRITION_LOGS: NutritionLog[] = [
  { id: 'n1', user_id: 'demo', recipe_name: 'Greek Yogurt Bowl',   servings: 1, calories: 320, protein: 22, carbs: 38, fat: 8,  consumed_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), auto_logged: true },
  { id: 'n2', user_id: 'demo', recipe_name: 'Grilled Chicken Salad', servings: 1, calories: 480, protein: 42, carbs: 22, fat: 18, consumed_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), auto_logged: true },
  { id: 'n3', user_id: 'demo', recipe_name: 'Dal Makhani + Rice',  servings: 1, calories: 580, protein: 26, carbs: 92, fat: 16, consumed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), auto_logged: false },
  { id: 'n4', user_id: 'demo', recipe_name: 'Margherita Pizza (2 slices)', servings: 2, calories: 540, protein: 22, carbs: 64, fat: 22, consumed_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), auto_logged: false },
  { id: 'n5', user_id: 'demo', recipe_name: 'Salmon Teriyaki', servings: 1, calories: 510, protein: 38, carbs: 36, fat: 24, consumed_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), auto_logged: true },
];

export const DEMO_SHOPPING_ITEMS: Record<string, any[]> = {
  'sl-demo-1': [
    { id: 'i1', list_id: 'sl-demo-1', ingredient_name: 'Chicken breast',   quantity: 2,    unit: 'lb',    aisle: 'Meat',     is_checked: false, notes: null },
    { id: 'i2', list_id: 'sl-demo-1', ingredient_name: 'Greek yogurt',     quantity: 32,   unit: 'oz',    aisle: 'Dairy',    is_checked: true,  notes: 'Plain, non-fat' },
    { id: 'i3', list_id: 'sl-demo-1', ingredient_name: 'Spinach',          quantity: 1,    unit: 'bag',   aisle: 'Produce',  is_checked: false, notes: null },
    { id: 'i4', list_id: 'sl-demo-1', ingredient_name: 'Cherry tomatoes',  quantity: 1,    unit: 'pint',  aisle: 'Produce',  is_checked: false, notes: null },
    { id: 'i5', list_id: 'sl-demo-1', ingredient_name: 'Olive oil',        quantity: 1,    unit: 'bottle',aisle: 'Pantry',   is_checked: true,  notes: 'Extra virgin' },
    { id: 'i6', list_id: 'sl-demo-1', ingredient_name: 'Brown rice',       quantity: 2,    unit: 'lb',    aisle: 'Pantry',   is_checked: false, notes: null },
    { id: 'i7', list_id: 'sl-demo-1', ingredient_name: 'Black beans',      quantity: 3,    unit: 'cans',  aisle: 'Pantry',   is_checked: false, notes: null },
    { id: 'i8', list_id: 'sl-demo-1', ingredient_name: 'Avocado',          quantity: 4,    unit: 'each',  aisle: 'Produce',  is_checked: false, notes: null },
    { id: 'i9', list_id: 'sl-demo-1', ingredient_name: 'Lemons',           quantity: 6,    unit: 'each',  aisle: 'Produce',  is_checked: true,  notes: null },
    { id: 'i10',list_id: 'sl-demo-1', ingredient_name: 'Garlic',           quantity: 1,    unit: 'bulb',  aisle: 'Produce',  is_checked: false, notes: null },
  ],
  'sl-demo-2': [
    { id: 'i11', list_id: 'sl-demo-2', ingredient_name: 'Ground beef',      quantity: 2,  unit: 'lb',     aisle: 'Meat',     is_checked: false, notes: '80/20' },
    { id: 'i12', list_id: 'sl-demo-2', ingredient_name: 'Burger buns',      quantity: 8,  unit: 'each',   aisle: 'Bakery',   is_checked: false, notes: null },
    { id: 'i13', list_id: 'sl-demo-2', ingredient_name: 'Cheddar cheese',   quantity: 8,  unit: 'oz',     aisle: 'Dairy',    is_checked: false, notes: 'Sharp' },
    { id: 'i14', list_id: 'sl-demo-2', ingredient_name: 'Charcoal',         quantity: 1,  unit: 'bag',    aisle: 'Other',    is_checked: false, notes: null },
    { id: 'i15', list_id: 'sl-demo-2', ingredient_name: 'Corn on the cob',  quantity: 6,  unit: 'each',   aisle: 'Produce',  is_checked: false, notes: null },
  ],
  'sl-demo-3': [
    { id: 'i16', list_id: 'sl-demo-3', ingredient_name: 'Milk',             quantity: 1,  unit: 'gallon', aisle: 'Dairy',    is_checked: true,  notes: null },
    { id: 'i17', list_id: 'sl-demo-3', ingredient_name: 'Eggs',             quantity: 24, unit: 'each',   aisle: 'Dairy',    is_checked: true,  notes: null },
    { id: 'i18', list_id: 'sl-demo-3', ingredient_name: 'Bread',            quantity: 2,  unit: 'loaves', aisle: 'Bakery',   is_checked: true,  notes: 'Whole wheat' },
  ],
};

export const DEMO_SHOPPING_LISTS: ShoppingList[] = [
  {
    id: 'sl-demo-1',
    name: "This Week's Shop",
    status: 'active',
    recipe_ids: ['r1', 'r2', 'r3'],
    created_at: date(-1),
    completed_at: null,
  },
  {
    id: 'sl-demo-2',
    name: 'Weekend BBQ',
    status: 'active',
    recipe_ids: ['r4', 'r5'],
    created_at: date(-3),
    completed_at: null,
  },
  {
    id: 'sl-demo-3',
    name: 'Last week — groceries',
    status: 'completed',
    recipe_ids: ['r6', 'r7', 'r8', 'r9'],
    created_at: date(-10),
    completed_at: date(-7),
  },
];

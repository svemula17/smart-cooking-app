import { Router } from 'express';
import { createHouse, deleteHouse, getMyHouse, updateHouse } from '../controllers/house.controller';
import { joinHouse, listMembers, refreshInviteCode, removeMember } from '../controllers/member.controller';
import { generateSchedule, getSchedule, swapCooks, updateScheduleEntry } from '../controllers/schedule.controller';
import { createExpense, deleteExpense, getBalances, listExpenses, settleUp } from '../controllers/expense.controller';
import { upsertAttendance, getAttendance } from '../controllers/attendance.controller';
import { proposeRecipes, getProposal, voteOnProposal, closeProposal } from '../controllers/proposal.controller';
import { submitRating, getRatings } from '../controllers/rating.controller';
import { requestSwap, listSwapRequests, respondToSwap } from '../controllers/swap.controller';
import { createPrepMeal, listPrepMeals, consumePortion } from '../controllers/prep.controller';
import { logWaste, getWasteSummary } from '../controllers/waste.controller';
import { setBudget, getCurrentBudget, getBudgetBreakdown, generateShopperRotation, getCurrentShopper } from '../controllers/budget.controller';
import { getLeaderboard, getCuisinePassport, getWeeklyReport } from '../controllers/leaderboard.controller';
import { getAchievements } from '../controllers/achievement.controller';
import {
  listChoreTypes, createChoreType, deleteChoreType,
  generateChoreSchedule, getChoreSchedule, updateChoreEntry, swapChore,
} from '../controllers/chore.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireHouseAdmin, requireHouseMember } from '../middleware/houseMember.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// House CRUD
router.post('/', createHouse);
router.get('/me', getMyHouse);
router.put('/:houseId', requireHouseAdmin, updateHouse);
router.delete('/:houseId', requireHouseAdmin, deleteHouse);

// Members
router.post('/join', joinHouse);
router.get('/:houseId/members', requireHouseMember, listMembers);
router.delete('/:houseId/members/:userId', authenticate, removeMember);
router.post('/:houseId/invite/refresh', requireHouseAdmin, refreshInviteCode);

// Cook schedule
router.post('/:houseId/schedule/generate', requireHouseMember, generateSchedule);
router.get('/:houseId/schedule', requireHouseMember, getSchedule);
router.patch('/:houseId/schedule/:scheduleId', requireHouseMember, updateScheduleEntry);
router.put('/:houseId/schedule/:scheduleId/swap', requireHouseAdmin, swapCooks);

// Expenses
router.post('/:houseId/expenses', requireHouseMember, createExpense);
router.get('/:houseId/expenses', requireHouseMember, listExpenses);
router.get('/:houseId/balances', requireHouseMember, getBalances);
router.post('/:houseId/expenses/settle', requireHouseMember, settleUp);
router.delete('/:houseId/expenses/:expenseId', requireHouseMember, deleteExpense);

// Attendance
router.post('/:houseId/attendance', requireHouseMember, upsertAttendance);
router.get('/:houseId/attendance', requireHouseMember, getAttendance);

// Recipe Proposals & Voting
router.post('/:houseId/schedule/:scheduleId/propose', requireHouseMember, proposeRecipes);
router.get('/:houseId/proposals/:proposalId', requireHouseMember, getProposal);
router.post('/:houseId/proposals/:proposalId/vote', requireHouseMember, voteOnProposal);
router.post('/:houseId/proposals/:proposalId/close', requireHouseMember, closeProposal);

// Meal Ratings
router.post('/:houseId/schedule/:scheduleId/ratings', requireHouseMember, submitRating);
router.get('/:houseId/schedule/:scheduleId/ratings', requireHouseMember, getRatings);

// Cook Swap Requests
router.post('/:houseId/swap-requests', requireHouseMember, requestSwap);
router.get('/:houseId/swap-requests', requireHouseMember, listSwapRequests);
router.patch('/:houseId/swap-requests/:swapId', requireHouseMember, respondToSwap);

// Prep Meals
router.post('/:houseId/prep-meals', requireHouseMember, createPrepMeal);
router.get('/:houseId/prep-meals', requireHouseMember, listPrepMeals);
router.patch('/:houseId/prep-meals/:prepId/consume', requireHouseMember, consumePortion);

// Waste Tracking
router.post('/:houseId/waste', requireHouseMember, logWaste);
router.get('/:houseId/waste/summary', requireHouseMember, getWasteSummary);

// Budget & Shopping Rotation (Phase 4)
router.put('/:houseId/budget', requireHouseMember, setBudget);
router.get('/:houseId/budget/current', requireHouseMember, getCurrentBudget);
router.get('/:houseId/budget/breakdown', requireHouseMember, getBudgetBreakdown);
router.post('/:houseId/shopping-rotation/generate', requireHouseAdmin, generateShopperRotation);
router.get('/:houseId/shopping-rotation', requireHouseMember, getCurrentShopper);

// Leaderboard, Passport, Report (Phase 5)
router.get('/:houseId/leaderboard', requireHouseMember, getLeaderboard);
router.get('/:houseId/cuisine-passport', requireHouseMember, getCuisinePassport);
router.get('/:houseId/report/weekly', requireHouseMember, getWeeklyReport);
router.get('/:houseId/achievements', requireHouseMember, getAchievements);

// Chore Types (Phase: Dishwashing & Cleaning)
router.get('/:houseId/chore-types',                    requireHouseMember, listChoreTypes);
router.post('/:houseId/chore-types',                   requireHouseAdmin,  createChoreType);
router.delete('/:houseId/chore-types/:typeId',         requireHouseAdmin,  deleteChoreType);

// Chore Schedule
router.post('/:houseId/chores/:typeId/generate',       requireHouseMember, generateChoreSchedule);
router.get('/:houseId/chores',                         requireHouseMember, getChoreSchedule);
router.patch('/:houseId/chores/:choreId',              requireHouseMember, updateChoreEntry);
router.put('/:houseId/chores/:choreId/swap',           requireHouseMember, swapChore);

export { router as houseRouter };

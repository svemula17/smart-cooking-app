import { Router } from 'express';
import { createHouse, deleteHouse, getMyHouse, updateHouse } from '../controllers/house.controller';
import { joinHouse, listMembers, refreshInviteCode, removeMember } from '../controllers/member.controller';
import { generateSchedule, getSchedule, swapCooks, updateScheduleEntry } from '../controllers/schedule.controller';
import { createExpense, deleteExpense, getBalances, listExpenses, settleUp } from '../controllers/expense.controller';
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

export { router as houseRouter };

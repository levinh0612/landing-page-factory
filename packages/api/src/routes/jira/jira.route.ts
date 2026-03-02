import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import {
  getSprintBoard,
  getMemberActivity,
  getBugs,
  getDailySummary,
  getWeeklyReport,
} from './jira.controller.js';

const router = Router();
router.use(authenticate);

router.get('/sprint', getSprintBoard);
router.get('/members', getMemberActivity);
router.get('/bugs', getBugs);
router.get('/daily', getDailySummary);
router.get('/weekly-report', getWeeklyReport);

export const jiraRoutes = router;
export default jiraRoutes;

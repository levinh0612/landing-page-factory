import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as aiController from './ai.controller.js';

const router = Router();
router.use(authenticate);
router.post('/generate-website', aiController.generateWebsite);

export default router;

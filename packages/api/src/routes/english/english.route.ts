import { Router } from 'express';
import { chatController } from './english.controller.js';

const router = Router();

router.post('/chat', chatController.chat);
router.get('/status', chatController.status);

export const englishRoutes = router;

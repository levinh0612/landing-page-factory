import { Router } from 'express';
import { chatController } from './english.controller.js';

const router = Router();

router.post('/chat', chatController.chat);

export const englishRoutes = router;

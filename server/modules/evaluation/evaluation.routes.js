import express from 'express';
import rateLimit from 'express-rate-limit';
import { checkEvaluation, healthCheck } from './evaluation.controller.js';

const router = express.Router();

// Implement industry-standard rate limiting
const checkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 submissions per window
  message: { error: true, message: 'Too many submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/check', checkLimiter, checkEvaluation);
router.get('/health', healthCheck);

export default router;

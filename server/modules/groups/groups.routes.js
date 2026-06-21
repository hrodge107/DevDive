import express from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import {
  createGroup,
  listGroups,
  getGroup,
  deleteGroup,
  joinGroup,
  listMembers,
  updateMember,
  removeMember,
  createExercise,
  listExercises,
  getExercise,
  updateExercise,
  deleteExercise,
  submitExercise,
  getGroupSubmissions,
  getUserSubmission,
  getReport,
} from './groups.controller.js';

const router = express.Router();

// All group routes require authentication
router.use(authMiddleware);

// --- Groups CRUD ---
router.post('/groups', createGroup);
router.get('/groups', listGroups);
router.get('/groups/:groupId', getGroup);
router.delete('/groups/:groupId', deleteGroup);

// --- Membership ---
router.post('/groups/join', joinGroup);
router.get('/groups/:groupId/members', listMembers);
router.patch('/groups/:groupId/members/:userId', updateMember);
router.delete('/groups/:groupId/members/:userId', removeMember);

// --- Group Exercises ---
router.post('/groups/:groupId/exercises', createExercise);
router.get('/groups/:groupId/exercises', listExercises);
router.get('/groups/:groupId/exercises/:exId', getExercise);
router.patch('/groups/:groupId/exercises/:exId', updateExercise);
router.delete('/groups/:groupId/exercises/:exId', deleteExercise);

// --- Submissions ---
router.post('/groups/:groupId/exercises/:exId/submit', submitExercise);
router.get('/groups/:groupId/submissions', getGroupSubmissions);
router.get('/groups/:groupId/exercises/:exId/submission', getUserSubmission);

// --- Report ---
router.get('/groups/:groupId/report', getReport);

export default router;

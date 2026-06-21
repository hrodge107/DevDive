import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import evaluationRoutes from './modules/evaluation/evaluation.routes.js';
import groupRoutes from './modules/groups/groups.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Standardize middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Mount API routes
app.use('/api', evaluationRoutes);
app.use('/api', groupRoutes);

app.listen(PORT, () => {
  console.log(`DevDive check server active on port ${PORT}`);
});

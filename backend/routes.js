import express from 'express';
import { humanizeText } from './controllers/humanizeController.js';
import { detectAI } from './controllers/aiDetectorController.js';
import { paraphraseText } from './controllers/paraphraseController.js';
import { checkPlagiarism } from './controllers/plagiarismController.js';
import { submitTrainingData, getModelStatus } from './controllers/trainingController.js';

const router = express.Router();

router.post('/humanize', humanizeText);
router.post('/ai-detector', detectAI);
router.post('/paraphrase', paraphraseText);
router.post('/plagiarism-check', checkPlagiarism);

// ML Training Routes
router.post('/train', submitTrainingData);
router.get('/model-status', getModelStatus);

export default router;

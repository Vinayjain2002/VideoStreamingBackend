import express from 'express';
import multer  from 'multer';
import { processVideoHandler } from '../controllers/processingController.js';

const router= express.Router();
const storage = multer.memoryStorage();
const upload= multer({storage});

router.post("/process", upload.single("video"), processVideoHandler);

export default router;
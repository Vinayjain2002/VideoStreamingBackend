import express from 'express';
import multer  from 'multer';
import { processVideoHandler } from '../controllers/processingController';

const router= express.Router();
const storage= express.memoryStorage();
const upload= multer({storage});

router.post("/process", upload.single("video"), processVideoHandler);

import  express from "express";
import {checkAndRegisterUsername} from "../controller/userNameBloomFilterController.js";
const router = express.Router();

router.post("/register-username", checkAndRegisterUsername);

export default router;

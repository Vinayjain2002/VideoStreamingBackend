import  express from "express";
import {checkUsername, registerUsername} from "../controller/userNameBloomFilterController.js";
const router = express.Router();

router.post("/check/username", checkUsername);
router.post("/register/username", registerUsername)
export default router;

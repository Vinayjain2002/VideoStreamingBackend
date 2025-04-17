import  {registerUser, loginUser, refreshToken,updateLastLogin} from "../controller/authController.js";
import express from "express";
const router= express.Router();
import authMiddleware from '../middleware/authMiddleware.js';


router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.post("/user/refreshToken",refreshToken);
router.post("/user/update/lastLogin", updateLastLogin);
export default router;
import express from "express";
const router= express.Router();
import authMiddleware from '../middleware/authMiddleware.js';
import {getAllUsers, getUser, DeleteUser, updateUserProfile, getUserProfile} from "../controller/userController.js";
import  route  from "./authRoutes.js";


router.get("/get/users", authMiddleware, getAllUsers);
router.get("/get/user", authMiddleware, getUser);
router.put("/update/user", authMiddleware, updateUserProfile);
router.delete("/delete/user", authMiddleware, DeleteUser);
router.put("/update/profile", authMiddleware, updateUserProfile);
router.get("/get/profile", authMiddleware, getUserProfile);

export default router;
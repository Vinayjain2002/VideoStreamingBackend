const express= require("express");
const router= express.Router();
const authMiddleware = require('../middleware/authMiddleware.js');
const {getAllUsers, getUser, DeleteUser, updateUserProfile, getUserProfile}= require("../controller/userController.js");
const { route } = require("./authRoutes.js");


router.get("/get/users", authMiddleware, getAllUsers);
router.get("/get/user", authMiddleware, getUser);
router.put("/update/user", authMiddleware, updateUserProfile);
router.delete("/delete/user", authMiddleware, DeleteUser);
router.put("/update/profile", authMiddleware, updateUserProfile);
router.get("/get/profile", authMiddleware, getUserProfile);
module.exports= router;
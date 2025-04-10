const express= require("express");
const router= express.Router();
const authMiddleware = require('../middleware/authMiddleware.js');
const {getAllUsers, getUser, ModifyUser, DeleteUser}= require("../controller/userController.js");
const { route } = require("./authRoutes.js");


router.get("/get/users", authMiddleware, getAllUsers);
router.get("/get/user", authMiddleware, getUser);
router.put("/update/user", authMiddleware, ModifyUser);
router.delete("/delete/user", authMiddleware, DeleteUser);

module.exports= router;
const {refreshToken, loginUser, registerUser}= require("../controller/authController");
const express= require("express");
const router= express.Router();
const authMiddleware = require('../middleware/authMiddleware.js');


router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.post("/user/refreshToken",refreshToken);
module.exports= router;
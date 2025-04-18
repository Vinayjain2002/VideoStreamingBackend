import db from '../config.js';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import axios from 'axios';


export const registerUser= async(req, res)=>{
    try{
        const {username, email, passwordHash}= req.body;

        const [existingUser]= await db.query(`Select * from users where email = ?`, [email]);
        if(existingUser.length > 0){
            return res.status(400).json({"error": "User Already Exists"});
        }
        const hashedPassword= await bcrypt.hash(passwordHash, 10);

        await db.query(
            `INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?)`,
            [username, email, hashedPassword]
          );

          const response = await axios.post('http://localhost:5000/api/v1/register/username', {
            "username": username
          });
          if(response.status== 201){
            return res.status(201).json({"message": "User Registered Successfully and Stored in Bloom Filter"});
          }
          else{
            return res.status(201).json({"message": "User Registered Successfully"});
          }
    }
    catch(error){
        return res.status(500).json({"error": error.message});
    }
}

export const loginUser= async(req,res)=>{
    try{
        const {email, passwordHash}= req.body;
        const [users]= await db.query(`Select * from users where email= ?`, [email]);
        if(users.length ===0){
            return res.status(400).json({error: "Invalid email or Password"});
        }
        const user= users[0];
        const isMatch = await bcrypt.compare(passwordHash, user.passwordHash);
        if(!isMatch){
            return res.status(400).json({"error": "Invalid Email or Password"});
        }
        console.log(user.userID);
        const accessToken= jwt.sign({ userId: user.userID}, process.env.ACCESS_SECRET, {expiresIn: "1h"});
        const refreshToken = jwt.sign({userId: user.userID}, process.env.REFRESH_SECRET, {expiresIn: "7d"}); 
        await db.query("UPDATE users SET refreshToken = ? WHERE userID = ?", [refreshToken, user.userID]);
        return res.status(200).json({"message": "Login Successful", accessToken, refreshToken});
    } 
    catch(error){
        res.status(500).json({"error": error.message});
    }
}

export const updateLastLogin = async (userID) => {
    try {
      await db.query(`UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE userID = ?`, [userID]);
    } catch (err) {
      console.log("Failed to Update Last Login", err.message);
    }
  };
  
export const refreshToken= async(req,res)=>{
    try{
        const {refreshToken}= req.body;
        if(!refreshToken){
            return res.status(401).json({"error": "Refresh Token is Required"});
        }
        const [users]= await db.query("Select * from users where refreshToken= ?", [refreshToken]);
        if(users.length== 0){
            return res.status(403).json({"error": "Invalid Or Expired Token"});
        }

        const user= users[0];
        jwt.verify(refreshToken, process.env.REFRESH_SECRET,(err, decoded)=>{
            if(err){
                return res.status(403).json({error: "Invalid Or Expired Refresh Token"});
            }
            const newAccessToken= jwt.sign({userId: user.id},process.env.ACCESS_SECRET,{expiresIn: "1h"});
            res.status(200).json({"message": "New Access Token Build Successfully", accessToken: newAccessToken});
        })
    }
    catch(error){
        return res.status(500).json({error: error.message});
    }
}


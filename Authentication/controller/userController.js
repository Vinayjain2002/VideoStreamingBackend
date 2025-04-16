import db from '../config.js';

export const getAllUsers= async(req, res)=>{
    try{
        const page= parseInt(req.query.page) || 1;
        const limit= parseInt(req.query.limit) || 10;
        const offset= (page-1)*limit;

        const [users]= await db.query(`Select id, name, username, email from users limit ? offset ?`, [limit, offset]);
        const [countResult]= await db.query(`Select Count(*) as totalUsers from users`);

        return res.json({
            success: true,
            page,
            limit,
            totalUsers: countResult[0].totalUsers,
            totalPages: Math.ceil(countResult[0].totalUsers / limit),
            users
        });
    }
    catch(error){
        return res.status(500).json({"message": "Server Error", error: error.message});
    }
};

export const getUser= async(req,res)=>{
    try{
        const {userID}= req.body;
        if(!userID){
            return res.status(404).json({"message": "Provide UserID"});
        }
        const [users]= await db.query( `Select * from users where id= ?`,[userID]);
        if(users.length==0){
            return res.status(400).json({"message": "Invalid UserID"});
        }
        return res.status(200).json({"message":"User Details Fethced Successfully", user: users});
    }
    catch(error){
        return res.status(500).json({"message": "Server Error", error: error.message});
    }
}

export const getUserProfile = async(req,res)=>{
    try{
        const {userID} = req.params;
        const [users] = await db.query(`SELECT userID, username, email, profilePicture, bio, accountStatus, registrationDate, lastLogin FROM users WHERE userID = ?`, [userID]);
        if(users.length === 0){
            return res.status(404).json({error: "User Not Found"});
        }
        return res.status(200).json({"message": "User Profile Fetched Successfully", data: users[0]});
    }
    catch(err){
        console.log("Error While Getting User Profile Details");
        return res.status(500).json({"error": err.message});
    }
}

export const updateUserProfile= async(req,res)=>{
    try{
        const {userID} = req.params;
        const {bio, profilePicture, accountStatus}= req.body;
        await db.query(`Update users set bio= ? profilePicture=?, accountStatus= ? where userID= ?`, [bio, profilePicture, accountStatus, userID]);

        return res.status(200).json({"message": "Profile Updated Successfully"});
    }
    catch{
        return res.status(500).json({"message": "Profile Updated Successfully"});
    }
}


export const DeleteUser= async(req, res)=>{
    try{
        const {userID}= req.body;
        if(!userID){
            return res.status(404).json({"message":"Provide UserID"});
        }
        const [existingUser]= await db.query(`Select * from users where id= ?`, [userID]);
        if(existingUser.length ==0){
            return res.status(404).json({"message": "User Not Found"});
        }
        await db.query(`Delete from users where id= ?`, [userID]);
        return res.status(200).json({"message": "User Deleted Successfully"});
        
    }
    catch(Error){
        return res.status(500).json({"message": "Internal Server Error"});
    }
}
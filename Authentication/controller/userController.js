const db= require('../config');

exports.getAllUsers= async(req, res)=>{
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

exports.getUser= async(req,res)=>{
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

exports.ModifyUser= async(req,res)=>{
    try{
        const {userID, user} = req.body;
        if(!userID || !user){
            return res.status(404).json({"message": "Provided User Credentials"});
        }
        const [existingUser]= await db.query(`Select * from users where id= ?`, [userID]);   
        if(existingUser.length == 0){
            return res.status(404).json({"message": "User Not Found"});
        }
        await db.query(`Update users set ? where id= ?`, [user, userID]);
        return res.status(200).json({"message": "User Updated Successfully"});
    }
    catch(err){
        return res.status(500).json({"message": "Internal Server Error"});
    }
}

exports.DeleteUser= async(req, res)=>{
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
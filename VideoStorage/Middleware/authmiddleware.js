import jwt from "jsonwebtoken";

const authMiddleware= (req,res,next)=>{
    const token= req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({"message": "Access Denied. No Token Provided"});

    }
    try{
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        req.user= decoded;
        next();
    }catch{
        return res.status(403).json({"message": "Invalid Or Expired Token"});
    }
}

export default authMiddleware;
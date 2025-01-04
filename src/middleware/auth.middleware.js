import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import cookieParser from "cookie-parser";

export const protectRoute = async (req,res, next) => {
    try {
        const token = req.cookies.jwt || null;
        if(!token){
            return res.status(401).json({message: "Unauthorized - No Token Provided"});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET,{
            complete: true
        })
        let userId = decoded.payload.userId;

        if(!userId){
            return res.status(401).json({message: "Unauthorized - nNo Token Provided"});
        }

        const user = await User.findById(userId).select("-password");

        if(!user) {
            return res.status(404).json({message: "User not found"})
        }
        req.user = user;
        next()
    } catch (error) {
        console.error("Error in protected route: ", error);
        res.status(500).json({message: "Internal Server Error."})
    }
}
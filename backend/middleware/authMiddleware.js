import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js"


// Protect routes / User must be authenticated
const protect = asyncHandler(async(req, res, next) => {
    //Let's initialize the variable token
    let token;

    // To read the jwt from the cookie
    token = req.cookies.jwt;

    if(token){
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            //Let's get user from Token by ID
            req.user = await User.findById(decoded.userId).select('-password');

            next();
        } catch (err) {
            console.log(err);
            res.status(401);
            throw new Error("No Authorized, token failed")
        }
    }else{
        res.status(401);
        throw new Error("No Authorized, You need to logIn");
    }
});

// Grant Access to specific roles
// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        res.status(403);
        throw new Error(`User role ${req.user.role} is not authorized to access this route`)
      }
      next();
    };
  };



export {
    protect,
    authorize
}
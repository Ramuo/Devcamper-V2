import crypto from "crypto";
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import { log } from "console";


// @desc      Register user
// @route     POST /api/register
// @access    Public
const register = asyncHandler(async(req, res) => {
    const {name, email, password, role} = req.body;

    //Find user by email
    const userExist = await User.findOne({ email });

    if(userExist){
        res.status(400);
        throw new Error("User exist already")
    };

    //Create a new User if it doe'nt exist 
    const user = await User.create({
        name,
        email,
        password,
        role,
    });

    //Once user created, then set it into db
    if(user){
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    }else{
        res.status(400);
        throw new Error("Invalid informations")
    }  
});

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
const login = asyncHandler(async(req, res) => {
   const {email, password} = req.body;

   //Validate Email & Password
   if(!email || !password){
    res.status(404);
    throw new Error("Invalid credentials")
   }

    //Let us find a user
    //const user = await User.findOne({ email});
   const user = await User.findOne({email}).select('+password'); 

   if(!user){
    res.status(401);
    throw new Error("User not Found");
   };

   //const token = user.getSignedJwtToken();

   //Check if password matches
   if(user && (await user.matchPassword(password))){
    generateToken(res, user._id);

    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    });
   }else{
    res.status(401);
    throw new Error("User not Found");
   }

});

// @desc      Logout user/ clear cookie
// @route     GET /api/auth/logout
// @access    Private
const logout = asyncHandler(async(req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({message: "User logged Out"})
});

// @desc      Get current logged in user
// @route     POST /api/auth/me
// @access    Private
const getMe = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user 
    })
});

// @desc      Update user details
// @route     PUT /api/auth/updatedetails
// @access    Private
const updatedetails = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user.id);

    //Check if user
    if(user){
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        //Save the updated changes
        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            data: updatedUser
        });
    }else{
        res.status(404);
        throw new Error('User not found')
    };
});

// @desc      Update password
// @route     PUT /api/auth/updatepassword
// @access    Private
const updatePassword = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user.id).select("+password");

    //Check if user
    if(user){
         //Let's check if in the request sent, if there is a password
         if(req.body.password){
            user.password = req.body.password
        };

        //Save the updated changes
        const updatedPassword = await user.save();

        res.status(200).json({
            success: true,
            data: updatedPassword
        });
    }else{
        res.status(404);
        throw new Error('Password is incorrect')
    };
});

// @desc      Forgot password
// @route     POST /api/auth/forgotpassword
// @access    Public
const forgotPassword = asyncHandler(async(req, res) => {
    const user = await User.findOne({email: req.body.email});

    if(!user){
        res.status(404);
        throw new Error("There is no user with that email");
    };

    //Get reset token 
    const resetToken = user.getResetTokenPassword();
    console.log(resetToken);

    await user.save({validateBeforeSave: false});

    //Create reset Url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    const message = `
                You are recieving this email because you
                you have requested to reset your password. Please Put request to:\n\n ${resetUrl}`// It should be a frontend link

                
    //Sending Email
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        });

        res.status(200).json({
            success: true,
            data: "Email sent"
        });
    } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined,
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave: false});

        res.status(500);
        throw new Error("Email could not be sent")
    };
});

// @desc      Reset password
// @route     PUT /api/auth/resetpassword/:resettoken
// @access    Public
const resetPassword = asyncHandler(async(req, res) => {
    //Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    //Find the user by resettoken only if the expiration is greatter than right now
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()} //Expiry is greatter than right now
    });

    if(!user){
        res.status(400);
        throw new Error("Invalid Token")
    };

    //If we find the user & the oken is not expired, then set new Password 
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    generateToken(res, user._id);

    res.status(200).json({
        _id: user._id,
        email: user.email,
        password: user.password
    });
});

export {
    register,
    login,
    logout,
    getMe,
    updatedetails,
    updatePassword,
    forgotPassword,
    resetPassword
}
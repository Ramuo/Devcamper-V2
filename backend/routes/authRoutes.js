import express from "express";


import {
    register,
    login,
    logout,
    getMe,
    updatedetails,
    updatePassword,
    forgotPassword,
    resetPassword,
} from "../controllers/authContloller.js";

//PROTECT & AUTH MIDDLEWARE
import {protect} from "../middleware/authMiddleware.js";

//INITIALIZE EXPRESS ROUTES
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/me").get(protect, getMe);
router.route("/updatedetails").put(protect, updatedetails);
router.route("/updatepassword").put(protect, updatePassword);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:resettoken").put(resetPassword);


export default router;
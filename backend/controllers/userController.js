import asyncHandler from "../middleware/asyncHandler.js";
import User from  "../models/userModel.js";


// @desc      Get all users
// @route     GET /api/auth/users
// @access    Private/Admin
const getUsers = asyncHandler(async(req, res) => {
    res.status(200).json(res.advancedResults);
});

// @desc      Get single user
// @route     GET /api/auth/users/:id
// @access    Private/Admin
const getUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id);

    res.status(200).json({
    success: true,
    data: user
    }); 
});

// @desc      Create user
// @route     POST /api/auth/users
// @access    Private/Admin
const createUser = asyncHandler(async(req, res) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: user
    });  
});

// @desc      Update user
// @route     PUT /api/auth/users/auth/:id
// @access    Private/Admin
const updateUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc      Delete user
// @route     DELETE /api/auth/users/:id
// @access    Private/Admin
const deleteUser = asyncHandler(async(req, res) => {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        data: {}
    });
});

export {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
    
}
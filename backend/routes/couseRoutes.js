import express from "express";

import {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
} from "../controllers/courseController.js"

//PROTECT & AUTH MIDDLEWARE
import {protect, authorize} from "../middleware/authMiddleware.js";

import Course from "../models/courseModel.js"
import advancedResults from "../middleware/advancedResults.js";


//Initialise router
const router = express.Router({mergeParams: true});

router.route('/')
    .get(advancedResults(Course, {
        path: 'bootcamp',
        select: 'name description'
    }),getCourses)
    .post(protect, authorize("publisher", "admin"), createCourse);
router.route('/:id')
    .get(getCourse)
    .put(protect, authorize("publisher", "admin"), updateCourse)
    .delete(protect, authorize("publisher", "admin"), deleteCourse);


export default router;
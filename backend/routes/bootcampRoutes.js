import express from "express";

import {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
} from "../controllers/bootcampController.js";

//PROTECT & AUTH MIDDLEWARE
import {protect, authorize} from "../middleware/authMiddleware.js";

import Bootcamp from "../models/bootcampModel.js";
import advancedResults from "../middleware/advancedResults.js";

//Include Other resource routers
import courseRouter from "./couseRoutes.js";
import reviewRouter from "./reviewRoute.js"


//INITIALIZE EXPRESS ROUTER
const router = express.Router(); 


//Re-routes to other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);


router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

router.route('/')
    .get(advancedResults(Bootcamp, "courses"), getBootcamps)
    .post(protect, authorize("publisher", "admin"), createBootcamp); 

router.route('/:id')
    .get(getBootcamp)
    .put(protect, authorize("publisher", "admin"), updateBootcamp)
    .delete(protect, authorize("publisher", "admin"), deleteBootcamp);



export default router;
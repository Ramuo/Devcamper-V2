import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";

//Samples Data
import bootcamps from '../data/bootcamps.js';
import courses from "../data/courses.js";
import users from "../data/users.js";
import reviews from "../data/reviews.js";

//LOAD MODELS
import Bootcamp from "./models/bootcampModel.js";
import Course from "./models/courseModel.js";
import User from "./models/userModel.js";
import Review from "./models/reviewModel.js"
// import Review from "./models/reviewModel.js";

import connectDB from "./config/db.js";


//LOAD ENV VRAS
dotenv.config();


//CONNECT TO DB
connectDB();


//IMPORT DATA
const importData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
      
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users);
        await Review.create(reviews)

        console.log('Data Imported...'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    };
};

//DELETE DATA
const destroyData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data Destroyed...'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(err);
        process.exit(1);
    };
};


if(process.argv[2] === '-d'){
    destroyData();
}else{
    importData();
};



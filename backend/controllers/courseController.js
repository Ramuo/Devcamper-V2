import asyncHandler from "../middleware/asyncHandler.js";
import Course from "../models/courseModel.js";
import Bootcamp from "../models/bootcampModel.js";



// @desc      Get courses
// @route     GET /api/courses
// @route     GET /api/bootcamps/:bootcampId/courses
// @access    Public
const getCourses = asyncHandler(async(req, res) =>{
    if(req.params.bootcampId){
       const courses = await Course.find({bootcamp: req.params.bootcampId})

       res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
       })
    }else{
       res.status(200).json(res.advancedResults);
    };
});

// @desc      Get single course
// @route     GET /api/courses/:id
// @access    Public
const getCourse = asyncHandler(async(req, res) =>{
    const course = await Course.findById(req.params.id).populate({
        path: "bootcamp",
        select: "name description"
    });

    if(!course){
        res.status(404);
        throw new Error(`No course with the id of ${req.params.id}`)
    }else{
        res.status(200).json({
            success: true,
            data: course
        });
    };

});

// @desc      Create course
// @route     POST /api/bootcamps/:bootcampId/courses
// @access    Private
const createCourse = asyncHandler(async(req, res) =>{
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp){
        res.status(404);
        throw new Error(`No Bootcamp with the id of ${req.params.bootcampId}`)
    }

     //Make sure user is bootcamp Owner in order to add course to bootcam
   if(bootcamp.user.toString() !== req.user.id && req.user.role !== "admin"){
        res.status(400);
        throw new Error(`User with ID ${req.user.id} is not authorized to add a course to this Bootcamp ${bootcamp._id}`)
   };

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    })
});

// @desc      Update course
// @route     PUT /api/courses/:id
// @access    Private
const updateCourse = asyncHandler(async(req, res) =>{
    let course = await Course.findById(req.params.id);

    if(!course){
        res.status(404);
        throw new Error(`No course with the id of ${req.params.id}`)
    };

    //Make sure user is course Owner in order to update course 
   if(course.user.toString() !== req.user.id && req.user.role !== "admin"){
    res.status(400);
    throw new Error(`User with ID ${req.user.id} is not authorized to update this course ${course._id}`)
   };

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: course
    })
});
// @desc      Delete course
// @route     DELETE /api/courses/:id
// @access    Private
const deleteCourse = asyncHandler(async(req, res) =>{
    const course = await Course.findById(req.params.id);

    if(!course){
        res.status(404);
        throw new Error(`No course with the id of ${req.params.id}`)
    };

      //Make sure user is course Owner in order to update course 
   if(course.user.toString() !== req.user.id && req.user.role !== "admin"){
    res.status(400);
    throw new Error(`User with ID ${req.user.id} is not authorized to delete this course ${course._id}`)
    };
    await course.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    })
});

export {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
    
}
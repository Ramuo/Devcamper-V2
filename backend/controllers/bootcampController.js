import path from "path"
import asyncHandler from "../middleware/asyncHandler.js";
import Bootcamp from "../models/bootcampModel.js";
import geocoder from "../utils/geocoder.js";


// @desc      Get all bootcamps
// @route     GET /api/bootcamps
// @access    Public
const getBootcamps = asyncHandler(async(req, res) => {
    res.status(200).json(res.advancedResults);
});

// @desc      Get single bootcamp
// @route     GET /api/bootcamps/:id
// @access    Public
const getBootcamp = asyncHandler(async(req, res) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(bootcamp){
        res.status(200).json(bootcamp);
    }else{
        res.status(404);
        throw new Error('Bootcamp not found')
    }

});

// @desc      Create new bootcamp
// @route     POST /apibootcamps
// @access    Private
const createBootcamp = asyncHandler(async(req, res) => {
    //Add user to req, body 
    req.body.user = req.user.id;

    //Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({user: req.params.id})

    //If the user is not admin the can only add one bootcamp
    if(publishedBootcamp && req.user.role !== "admin"){
        res.status(400);
        throw new Error(`The user with ID ${req.user.id} has already published a bootcamp`)
    }

    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        success: true,
        data: bootcamp
    });
});

// @desc      Update bootcamp
// @route     PUT /api/bootcamps/:id
// @access    Private
const updateBootcamp = asyncHandler(async(req, res) => {
    let bootcamp = await Bootcamp.findById(req.params.id)

    if(!bootcamp){
        res.status(404);
        throw new Error('Not Found')
    }
    

    //Make sure user is bootcamp owner in order to update bootcam
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== "admin"){
        res.status(400);
        throw new Error(`User with ID ${req.params.id} is not authorized to update this Bootcamp`)
    };

    //Find bootcamp then update it
    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
       data: bootcamp
    });
});

// @desc      Delete bootcamp
// @route     DELETE /api/bootcamps/:id
// @access    Private
const deleteBootcamp = asyncHandler(async(req, res) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp){
        res.status(404);
        throw new Error('Not Found')
    }

    //Make sure user is bootcamp owner in order to delete bootcam
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== "admin"){
        res.status(400);
        throw new Error(`User with ID ${req.params.id} is not authorized to delete this Bootcamp`)
    };

   await  bootcamp.deleteOne({_id: req.params.id}); //this will Trigger middleware (pre('deleteOne)) on bootcampModel

    res.status(200).json({success: true, data: {} });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/bootcamps/radius/:zipcode/:distance
// @access    Private
const getBootcampsInRadius = asyncHandler(async(req, res) => {
   const {zipcode, distance} = req.params;

   //Get lat/lng from geocoder
   const loc  = await geocoder.geocode(zipcode);
   const lat = loc[0].latitude;
   const lng = loc[0].longitude;

   //Calc radius using radius
   //Divide distance by radius of Earth
   //Earth Radius = 3, 963 mi / 6,378 km
   const radius = distance / 3963;
   
   const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }

   });
   res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
   });
});

// @desc      Upload photo for bootcamp
// @route     PUT /api/bootcamps/:id/photo
// @access    Private
const bootcampPhotoUpload = asyncHandler(async(req, res) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    res.status(400);
    throw new Error("Please upload a file")
  }

   //Make sure user is bootcamp Owner in order to delete bootcam
   if(bootcamp.user.toString() !== req.user.id && req.user.role !== "admin"){
    res.status(400);
    throw new Error(`User with ID ${req.params.id} is not authorized to update  this Bootcamp photo`)
   };

  if(!req.files){
        res.status(400);
        throw new Error("Please upload a file")
    };
    

    const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    res.status(400);
    throw new Error("Please upload an image file");
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    res.status(400);
    throw new Error(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`);
  }

  // Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      res.status(500);
      throw new Error(`Problem with the file upload`);
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });

});

export {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
}
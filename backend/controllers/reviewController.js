import asyncHandler from "../middleware/asyncHandler.js";
import Review from "../models/reviewModel.js";
import Bootcamp from "../models/bootcampModel.js";

// @desc      Get reviews
// @route     GET /api/reviews
// @route     GET /api/bootcamps/:bootcampId/reviews
// @access    Public
const getReviews = asyncHandler(async(req, res) => {
    if(req.params.bootcampId){
        const reviews = await Review.find({bootcamp: req.params.bootcampId});

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        })
    }else{
        res.status(200).json(res.advancedResults);
    }
    
});

// @desc      Get single review
// @route     GET /api/reviews/:id
// @access    Public
const getReview = asyncHandler(async(req, res) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(!review){
        res.status(404);
        throw new Error(`No Review Found with the ID of ${req.params.id}`)
    };

    res.status(200).json({
        success: true,
        data: review
    });
});

// @desc      Add review
// @route     POST /api/bootcamps/:bootcampId/reviews
// @access    Private
const addReview = asyncHandler(async(req, res) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);


    if(!bootcamp){
        res.status(404);
        throw new Error(`No Bootcamp with the ID ${req.params.bootcampId}`)
    }

    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review
    });
    
});

// @desc      Update review
// @route     PUT /api/reviews/:id
// @access    Private
const updateReview = asyncHandler(async(req, res) => {
    let review = await Review.findById(req.params.id);


    if(!review){
        res.status(404);
        throw new Error(`No review with the ID ${req.params.id}`)
    }

    //Make sure review belongs to user or user is admin
   if(review.user.toString() !== req.user.id && req.user.role !== "admin"){
    res.status(401);
    throw new Error(`Not authorized to update this review`)
   }

   review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
   });

    res.status(201).json({
      success: true,
      data: review
    });
    
});

// @desc      Delete review
// @route     DELETE /api/reviews/:id
// @access    Private
const deleteReview = asyncHandler(async(req, res) => {
    const review = await Review.findById(req.params.id);


    if(!review){
        res.status(404);
        throw new Error(`No review with the ID ${req.params.id}`)
    }

    //Make sure review belongs to user or user is admin
   if(review.user.toString() !== req.user.id && req.user.role !== "admin"){
    res.status(401);
    throw new Error(`Not authorized to delete this review`)
   }

  await Review.deleteOne();

    res.status(201).json({
      success: true,
      data: {}
    });
    
});

export {
    getReviews,
    getReview,
    addReview,
    updateReview,
    deleteReview
}
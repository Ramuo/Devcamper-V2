import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema({
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a title for the review'],
      maxlength: 100
    },
    text: {
      type: String,
      required: [true, 'Please add some text']
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: [true, 'Please add a rating between 1 and 10']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: 'Bootcamp',
      required: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
});

//TO PREVENT USER TO SUBMIT MORE THAN ONE REVIEW PER BOOTCAMP
reviewSchema.index({bootcam: 1, user: 1}, {unique: true});


// Static method to get average of rating && save
reviewSchema.statics.getAverageRating = async function(bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating 
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
reviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageCost before remove
reviewSchema.pre('remove', function() {
  this.constructor.getAverageRating(this.bootcamp);
});


const Review = mongoose.model('Review', reviewSchema);
export default Review;
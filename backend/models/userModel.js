import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";




const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Please add a name']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    role: {
      type: String,
      enum: ['user', 'publisher'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
      type: Date, 
      default: Date.now
    }
});

//TO AUTHANTICATE USER PASSWORD
userSchema.methods.matchPassword = async function(enteredPassword){
  return await bcrypt.compare(enteredPassword, this.password);
};

//TO CRYPT PASSWORD WHEN REGISTERING NEW USER AND HASH IT
userSchema.pre("save", async function(next){
  if(!this.isModified('password')){
    next();
  };

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//Sign JWT and return
// userSchema.methods.getSignedJwtToken = function(){
//   return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE
//   });
// };

//Generate and hash password Token
userSchema.methods.getResetTokenPassword = function (){
  //Generate Token
  const resetToken = crypto.randomBytes(20).toString('hex');

  //Hash token and set it to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  
  //Set token expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10mn

  return resetToken;
};


const User = mongoose.model('User', userSchema);
export default User;
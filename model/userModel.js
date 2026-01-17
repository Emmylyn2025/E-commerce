const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, 'firstname is required'],
    minlength: 6
  },
  lastname: {
    type: String,
    required: [true, 'lastname is required'],
    minlength: 6
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    maxlength: 11
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date
}, 
{timestamps: true});

//Make the fullname field a virtual Property
userSchema.virtual('fullname').get(function() {
  return `${this.firstname} ${this.lastname}`;
});

//Make it show in the json response
userSchema.set("toJSON", {virtuals: true});
userSchema.set("toObject", {virtuals: true});


//Hash password before saving
userSchema.pre('save', async function() {
  if(!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

//Compare password before login
userSchema.methods.correctPassword = async function(inputPassword, savedPassword) {
  return await bcrypt.compare(inputPassword, savedPassword);
};

//Generate refresh password token
userSchema.methods.createResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
}

module.exports = mongoose.model('users', userSchema);

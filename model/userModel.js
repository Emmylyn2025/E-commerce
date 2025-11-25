const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
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
  }
}, {timestamps: true});


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

module.exports = mongoose.model('users', userSchema);

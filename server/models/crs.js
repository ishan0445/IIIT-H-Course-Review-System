var mongoose = require('mongoose');
var newProf = mongoose.model('faculty',{
  profName: {
    type: String,
    required: true,
    minlength:1,
    trim: true
  }
});
var newcourse = mongoose.model('courses',{
  courseID: {
    type: String,
    required: true,
    minlength:1,
    trim: true
  },
  courseName:{
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
});
var review = mongoose.model('reviews',{
<<<<<<< HEAD
=======
  postedBy: {
    type:String,
    trim:true
  },
>>>>>>> 8a35ee652cbcf655f683273a72aed95e2f7d7cd5
  takenBy: {
    type: String,
    required: true,
    minlength:1,
    trim: true
  },
  rating:{
    type: Number,
    required: true
  },
  courseID: {
    type: String,
    required: true,
    minlength:1,
    trim: true
  },
  courseName:{
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  description:{
    type: String,
    required: true,
    minlength: 10,
    trim: true
  },
  timestamp:{
    type:Date
  }
});

module.exports = {newProf,review,newcourse};

var mongoose = require('mongoose');
/*
"profName":"Vikram Pudi",
			"profDesignation":"Associate Professor",
			"profQualification":"Ph.D. (IISc Bangalore)",
			"researchAreas":"Data mining, artificial intelligence, database systems",
			"lab":"CDE , COS"

*/
var newProf = mongoose.model('faculty',{
  profName: {
    type: String,
    required: true,
    minlength:1,
    trim: true
  },
  profDesignation: {
    type: String,
    trim: true,
    default: 'Not Available'
  },
  profQualification: {
    type: String,
    default: 'Not Available',
    trim: true
  },
  researchAreas: {
    type: String,
    default: 'Not Available',
    trim: true
  },
  lab: {
    type: String,
    default: 'Not Available',
    trim: true
  },

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
  postedBy: {
    type:String,
    trim:true
  },
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

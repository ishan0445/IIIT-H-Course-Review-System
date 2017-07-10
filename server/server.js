require('./config/config')
const _ = require('lodash')
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
 
const {mongoose} = require('./db/mongoose');
const {newProf,review,newcourse} = require('./models/crs');
// const {User} = require('./models/user');
// const {authenticate} = require('./middleware/authenticate');
 
const app = express();
const port = process.env.PORT;
 
app.use(bodyParser.json());

app.use(express.static(__dirname+'/public'));
 
app.post('/newProfEntry',(req,res) => {
  var crsData = new newProf({
    profName: req.body.profName,
    // _creator:req.user._id
 
  });
  crsData.save().then((doc) => {
    res.send(doc);
  },(e) => {
    res.status(400).send(e);
  })
});
app.post('/newCourseEntry',(req,res) => {
  var crsData = new newcourse({
    courseID: req.body.courseID,
    courseName: req.body.courseName
  });
  crsData.save().then((doc) => {
    res.send(doc);
  },(e) => {
    res.status(400).send(e);
  })
});
app.post('/newReviewEntry',(req,res) => {
    console.log('here: '+JSON.stringify(req.body,undefined,3));
  
  var crsData = new review({
    takenBy: req.body.takenBy,
    courseID: req.body.courseID,
    courseName: req.body.courseName,
    rating: req.body.rating,
    description: req.body.description
    // _creator:req.user._id
 
  });

  crsData.save().then((doc) => {
    res.send(doc);
  },(e) => {
    res.status(400).send(e);
    console.log(e);
  })
});
 
 
app.get('/getProfs',(req,res) => {
  newProf.find({
    // _creator:req.user._id
  }).then((profData) => {
    res.send({profData});
  },(e) => {
    res.status(400).send(e);
  });
});
app.get('/getCourses',(req,res) => {
  newcourse.find({
    // _creator:req.user._id
  }).then((courseData) => {
    res.send({courseData});
  },(e) => {
    res.status(400).send(e);
  });
});
app.get('/getReview',(req,res) => {
  review.find({
    // _creator:req.user._id
  }).then((reviewData) => {
    res.send({reviewData});
  },(e) => {
    res.status(400).send(e);
  });
});
 
app.listen(port,() => {
  console.log(`Started on port ${port}`);
});
 
 
module.exports = {app};
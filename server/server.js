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
  if ( 'profArray' in req.body && req.body.profArray instanceof Array ) {
    // do stuff
    var count = 0;
      for (var i=0; i<req.body.profArray.length; i++){
    // here jsonObject['sync_contact_list'][i] is your current "bit"
    count = count+1;
      var crsData = new newProf({
        "profName": req.body.profArray[i]
        // _creator:req.user._id

      });
      crsData.save();

  }
  res.send(`${count} values inserted in bulk`);
}
else {

    var crsData = new newProf({
      profName: req.body.profName
      // _creator:req.user._id

    });
    crsData.save().then((doc) => {
      res.send(doc);
    },(e) => {
      res.status(400).send(e);
    })
}
});
app.post('/newCourseEntry',(req,res) => {
  if ( 'courseArray' in req.body && req.body.courseArray instanceof Array ) {
    // do stuff
    var count = 0;
      for (var i=0; i<req.body.courseArray.length; i++){
    // here jsonObject['sync_contact_list'][i] is your current "bit"
    count = count+1;
    var crsData = new newcourse({
      courseID: req.body.courseArray[i].courseID,
      courseName: req.body.courseArray[i].courseName
    });
    crsData.save();

  }
  res.send(`${count} values inserted in bulk`);
}
else {
    var crsData = new newcourse({
      courseID: req.body.courseID,
      courseName: req.body.courseName
    });
    crsData.save().then((doc) => {
      res.send(doc);
    },(e) => {
      res.status(400).send(e);
    })
}

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


app.get('/allReviews/:page', (req, res) => {
  const limit = 10;
  const page = Number.parseInt(req.params.page)
  if (page) {
    Promise.all([
      review.find({}).limit(limit).skip((page - 1) * limit).lean().sort({courseName:"ascending"}).exec(),
      review.count().exec()
    ]).then(([result, count]) => {
        const next = count > limit * page
        const prev = page > 1
        res.json({
          allReviews: result,
          count,
          nextUrl: `/allReviews/${next ? page + 1 : page}/`,
          prevUrl: `/allReviews/${prev ? page - 1 : page}/`,
          next,
          prev
        })
      })
  } else {
    res.sendStatus(400)
  }
})

app.listen(port,() => {
  console.log(`Started on port ${port}`);
});


module.exports = {app};

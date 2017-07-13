require('./config/config')
const _ = require('lodash')
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const {mongoose} = require('./db/mongoose');
const {newProf,review,newcourse} = require('./models/crs');
const paginate = require("paginate-array");


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
    description: req.body.description,
    timestamp:new Date()
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
      review.find({}).sort({timestamp:"descending"}).limit(limit).skip((page - 1) * limit).lean().sort({courseName:"ascending"}).exec(),
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


/*
Usage:
A post request in which the body contains
localhost:3000/findByClick/:page
1.
{
	"searchBy":{
		"takenBy": "prof 5",

	}
} -->> will return an array of courses taken by prof 5

2.
{
	"searchBy":{
		"courseName": "A lab",

	}
}
-->> will return an array of professors who all have taken A lab

3.
{
	"searchBy":{
  "takenBy": "prof 5"
		"courseName": "A lab",

	}
}
->> will return the actual review

*/
app.post('/findByClick/:page', (req, res) => {
  const limit = 10;
  const page = Number.parseInt(req.params.page)
  //console.log(JSON.stringify(req.body.searchBy[0],undefined,3));
  if (page) {
    Promise.all([
      review.find(req.body.searchBy).lean().sort({courseName:"ascending"}).exec(),
      review.find(req.body.searchBy).sort({timestamp:"descending"}).limit(limit).skip((page - 1) * limit).lean().sort({courseName:"ascending"}).exec(),

      // review.find(req.body.searchBy).count().exec()
    ]).then(([result, actual]) => {
      var profArray = [];
      var courseArray = [];
      if("takenBy" in req.body.searchBy && !("courseName" in req.body.searchBy)){
        for (var i=0; i<result.length; i++){
          courseArray.push(result[i].courseName);
        }
        profArray.push(req.body.searchBy.takenBy);
      }
      else if("courseName" in req.body.searchBy && !("takenBy" in req.body.searchBy)){
        for (var i=0; i<result.length; i++){
          profArray.push(result[i].takenBy);
        }
        courseArray.push(req.body.searchBy.courseName);


      }
      if(profArray.length>1){
          profArray = profArray.filter(function(elem, pos) {
            return profArray.indexOf(elem) == pos;
          })
      }
      if(courseArray.length>1){
          courseArray = courseArray.filter(function(elem, pos) {
            return courseArray.indexOf(elem) == pos;
          })
      }

      if("takenBy" in req.body.searchBy && "courseName" in req.body.searchBy){
        const next = actual.length > limit * page
        const prev = page > 1

        res.json({
          allReviews: actual,
          count:actual.length,
          nextUrl: `/findByClick/${next ? page + 1 : page}/`,
          prevUrl: `/findByClick/${prev ? page - 1 : page}/`,
          next,
          prev
        });
      }
      else {
        res.json({
          profArray,
          courseArray
        })
      }


      })
  }
  else {
    res.sendStatus(400)
  }
});


/*
Usage:
localhost:3000/findByQuery/1/
POST request
body contains:
{
	"query":"prof 5"
}

returns->
{
    "currentPage": 5, <-- currentPage number
    "perPage": 10,  <-- limit
    "total": 32,    <-- count
    "totaPages": 4, <-- total pages
    "data": [] <-- contains data of the searched query
}


*/

app.post('/findByQuery/:page', (req, res) => {
  const limit = 10;
  const page = Number.parseInt(req.params.page);
  if (page) {
    Promise.all([
      review.find({$or: [
        {"takenBy":{'$regex': req.body.query,$options:'i'}},
          {"courseName":{'$regex': req.body.query,$options:'i'}},
          {"description":{'$regex': req.body.query,$options:'i'}},
          {"courseID":{'$regex': req.body.query,$options:'i'}}]
        }).sort({timestamp:"descending"}).lean().exec()
    ]).then(([result]) => {
        const paginateCollection = paginate(result,page, limit);
        //console.log(JSON.stringify(paginateCollection.data,undefined,3));
        const next = paginateCollection.currentPage < paginateCollection.totaPages
        const prev = page > 1
        res.json({
          allReviews: paginateCollection.data,
          count:result.length,
          nextUrl: `/findByQuery/${next ? page + 1 : page}/`,
          prevUrl: `/findByQuery/${prev ? page - 1 : page}/`,
          next,
          prev
        })
        //res.send(paginateCollection);
      })
  } else {
    res.sendStatus(400)
  }
});


app.listen(port,() => {
  console.log(`Started on port ${port}`);
});


module.exports = {app};

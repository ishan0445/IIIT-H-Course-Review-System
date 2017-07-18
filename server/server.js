require('./config/config')
const _ = require('lodash')
const express = require('express');
const {ObjectID} = require('mongodb');
const {mongoose} = require('./db/mongoose');
const {newProf,review,newcourse} = require('./models/crs');
const paginate = require("paginate-array");
const bodyParser = require('body-parser');
const logger = require('morgan');
const session = require('express-session');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const MemoryStore = require('session-memory-store')(session);
const http = require('http')
const app = express();
const port = process.env.PORT;
const mysecret = process.env.MYSEC || 'ishan-jayant-crs'
const {cas,casClient} = require('./cas-auth.js');
const fs = require('fs');
const socketIO = require('socket.io');
var server = http.createServer(app);
var io = socketIO(server);
const publicPath = path.join(__dirname ,'/public');



app.use(cookieParser());
// app.use(session({secret: mysecret}));
app.use(session({

  secret: mysecret,
  store: new MemoryStore(),
  resave: true,
    saveUninitialized: true
}));

// app.use(casClient.core());

// app.use(express.static(__dirname+'/public'));



// app.use(express.static(__dirname + '/public'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));




// app.use(isAuthenticated);
app.use(cas.ssout('/'),cas.serviceValidate(),cas.authenticate(), express.static(__dirname + '/public'));
// app.use(express.static(publicPath));

app.use(cas.ssout('/'))
.use(cas.serviceValidate())
.use(cas.authenticate());
// app.use(casClient.core());

var connectedUsers = 0;
io.on('connection',(socket) => {
  console.log('New User Connected');
  connectedUsers += 1;
  io.emit('usercount', {connectedUsers});


  socket.on('disconnect',() => {
    console.log('User was disconnected');
    connectedUsers -= 1;
    io.emit('usercount', {connectedUsers});
  });
});
app.get('/',(req, res) => {
  // attributes = JSON.stringify(req.session.cas.attributes);
  // console.log(attributes);
  res.redirect('/reviews.html')
})

/*var logg = function(req,res,next){
  fs.appendFile("./reviewLog.log",`${req.session.cas.attributes.RollNo}:${req.session.cas.attributes.Name}:${req.body.description}\n`, function(err) {
      if(err) {
          return console.log(err);
      }
      next();

      //console.log("The file was saved!");
  });
}*/
app.post('/newReviewEntry',(req,res) => {
    console.log('here: '+JSON.stringify(req.session.cas.attributes.Name,undefined,3));
	console.log('here: '+JSON.stringify(req.session.cas.attributes.RollNo,undefined,3));

  // var check  = req.body.isAnonymus;
  var crsData = new review({
    postedBy : !req.body.isAnonymus?req.session.cas.attributes.Name:"Anonymus",
    takenBy: req.body.takenBy,
    courseID: req.body.courseID,
    courseName: req.body.courseName,
    rating: req.body.rating,
    description: req.body.description,
    timestamp:new Date()
    // _creator:req.user._id

  });
  // console.log("entered data: " +JSON.stringify(crsData,undefined,3));


  crsData.save().then((doc) => {
    res.send(doc);
  },(e) => {
    res.status(400).send(e);
    console.log(e);
  })
});


app.get('/getProfs',(req,res) => {
//   console.log("statusCode: ", res.statusCode);
//   console.log("headers: ", res.headers);
console.log('here: '+JSON.stringify(req.session.cas.attributes.Name,undefined,3));
	console.log('here: '+JSON.stringify(req.session.cas.attributes.RollNo,undefined,3));
  newProf.find({
    // _creator:req.user._id
  }).then((profData) => {
    res.send({profData});
  },(e) => {
    res.status(400).send(e);
  });
});
app.get('/getCourses',(req,res) => {
	console.log('here: '+JSON.stringify(req.session.cas.attributes.Name,undefined,3));
	console.log('here: '+JSON.stringify(req.session.cas.attributes.RollNo,undefined,3));
  newcourse.find({
    // _creator:req.user._id
  }).then((courseData) => {
    res.send({courseData});
  },(e) => {
    res.status(400).send(e);
  });
});





app.get('/allReviews/:page',(req, res) => {
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
app.post('/findByClick/:page', (req, res) => { // 2nd phase development
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

app.post('/findByQuery/:page',(req, res) => {
	console.log('here: '+JSON.stringify(req.session.cas.attributes.Name,undefined,3));
	console.log('here: '+JSON.stringify(req.session.cas.attributes.RollNo,undefined,3));
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
app.get('/logout', function(req, res) {
	console.log('here: '+JSON.stringify(req.session.cas.attributes.Name,undefined,3));
	console.log('here: '+JSON.stringify(req.session.cas.attributes.RollNo,undefined,3));
  if (req.session.destroy) {
    req.session.destroy();
    // req.ession = null;
	  req.session = null
  } else {
    req.session = null;
  }
  //res.redirect('/reviews.html')
	res.redirect('https://login.iiit.ac.in/cas/logout');

});





server.listen(port,() => {
  console.log(`Server is up on port ${port}`);
})



module.exports = {app};

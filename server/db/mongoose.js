var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
db = {
  // localhost: 'mongodb://localhost:27017/CRS',
  // mlab: 'mongodb://Jayant:Jayant@ds149501.mlab.com:49501/todoapp'
  mlab: 'mongodb://Jayant:Jayant@ds153392.mlab.com:53392/course-review'
};

mongoose.connect(process.env.MONGODB_URI);
// mongoose.connect(db.mlab || process.env.MONGODB_URI);
module.exports = {
  mongoose
}

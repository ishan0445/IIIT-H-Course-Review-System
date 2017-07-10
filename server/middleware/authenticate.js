
var {User} = require('./../models/user');

var authenticate = (req,res,next) => {
  var token = req.header('x-auth');

  User.findByToken(token).then((user) => {
    if(!user) {
      return Promise.reject();
      // res.status(401).send(); <-- this can also be done
    }
    req.user = user;
    req.token = token;
    next();
    // res.send(user);
  }).catch((e) => {
    res.status(401).send();
  });

};


module.exports = {authenticate};

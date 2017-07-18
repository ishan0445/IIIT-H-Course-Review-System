var socket = io();
// var socket = require('socket.io').listen(3000)

socket.on('connect',function () {
  console.log('Connected to server');
  socket.on('usercount',function (message) {
    var count = message.connectedUsers;
    console.log(message);
    jQuery('#users').text("Number of users viewing this website: "+count);
  });


});

socket.on('disconnect',function () {
  console.log('Disconnected from server');
  socket.on('usercount',function (message) {
    var count = message.connectedUsers;
    jQuery('#users').text("Number of users viewing this website: "+count);

  });

});

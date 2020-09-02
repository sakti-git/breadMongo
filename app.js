var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');

var app = express();

//Connect to MongoDB
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

app.use('/users', usersRouter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Connection URL
const url = 'mongodb://localhost:27017';

// Create a new MongoClient
const client = new MongoClient(url);

client.connect(function (err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  // Database Name
  const dbName = 'bread';
  // coll for 'data' collection
  const coll = 'person';
  const db = client.db(dbName);
  var indexRouter = require('./routes/index')(db, coll);

  app.use('/', indexRouter);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  // client.close();
});

module.exports = app;

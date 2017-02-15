const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const Sequelize = require('sequelize');

const secret = 'value';


var connection = new Sequelize('my', 'nick', 'nick', {
  host: 'localhost',
  dialect: 'mysql',
  port: 8889,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

connection
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });


var orgAct = connection.define('orgAct', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  name: Sequelize.STRING,
  userName: Sequelize.STRING,
  password: Sequelize.STRING,
  email: Sequelize.STRING,
  address: Sequelize.STRING,
  phoneNumber: Sequelize.INTEGER,
  website: Sequelize.STRING
});

orgAct.sync();

var orgPost = connection.define('orgPost', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  orgId: Sequelize.INTEGER,
  verse: Sequelize.STRING,
  text: Sequelize.STRING,
  picture: Sequelize.STRING
});

orgPost.sync();

var orgVerse = connection.define('orgVerse', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  orgId: Sequelize.INTEGER,
  verse: Sequelize.STRING
});

orgVerse.sync();

var userAct = connection.define('userAct', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  userName: Sequelize.STRING,
  password: Sequelize.STRING,
  email: Sequelize.STRING,
  age: Sequelize.INTEGER,
  sex: Sequelize.STRING
});

userAct.sync({force: true});

var userPost = connection.define('userPost', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  userId: Sequelize.INTEGER,
  versus: Sequelize.STRING,
  text: Sequelize.STRING,
  picture: Sequelize.STRING
});

userPost.sync({force: true});

var userVerse = connection.define('userVersus', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  userId: Sequelize.INTEGER,
  verse: Sequelize.STRING
});

userVerse.sync({force: true});





var app = express();

app.use(bodyParser.json());

app.use(function(req, res, next) {
  if (req.headers.authorization) {
    const decode = jwt.verify(req.headers.authorization, secret);
    try {
    jwt.verify(req.headers.authorization, secret);
    } catch (err) {
      console.log('validation error', err);
      res.status(401).send();
    }
    if (typeof decode.accountId === 'number') {
      req.accountId = decode.accountId;
    } else {
      req.accountId = null;
    }
    next();

  } else {
      next();
    }
  });



app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/SignupOrg', function(req, res) {
  var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(9));
  orgAct.create({
    name: req.body.name,
    userName: req.body.userName,
    password: hash,
    email: req.body.email,
    address: req.body.address,
    phoneNumber: req.body.phoneNumber,
    website: req.body.website
  }).then(function(result){
    if (!result || result.length === 0) {
      res.status(404).send();
    }
    var payload = {
      accountId: result.dataValues.id
    };
    const token = jwt.sign(payload, secret, {
      header: {
          typ: 'JWT'
      }
    });
    res.send(token);
});
  });

app.post('/orgLogin', function(req, res) {
  orgAct.findOne({where: {userName: req.body.userName}}).then(function(result){
  if (!result || result.length === 0) {
    res.status(404).send();
  } else if (bcrypt.compareSync(req.body.password, result.password)){
    var payload = {
      accountId: result.id
    };
    const token = jwt.sign(payload, secret, {
      header: {
          typ: 'JWT'
      }
    });
    res.send(token);
  } else {
    res.status(404).send();
  }
});
});

app.get('/orgMain', function(req, res){
  var finalResult = [];
  orgAct.findById(req.accountId).then(function(result){
    finalResult.push(result);
    orgPost.findAll({WHERE: {orgId : req.accountId}}).then(function(result){
      finalResult.push(result);
      orgVerse.findAll({WHERE: {orgId : req.accountId}}).then(function(result){
        finalResult.push(result);
        console.log(finalResult);
          res.send(finalResult);
  });
  });
  });
});




app.post('/SignupUser', function(req, res) {
  var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(9));
  orgAct.create({
    userName: req.body.userName,
    password: hash,
    email: req.body.email,
    age:  req.body.age,
    sex: req.body.sex
  }).then(function(result){
    if (!result || result.length === 0) {
      res.status(404).send();
    }
    var payload = {
      accountId: result.dataValues.id
    };
    const token = jwt.sign(payload, secret, {
      header: {
          typ: 'JWT'
      }
    });
    res.send(token);
});
});

app.post('/userLogin', function(req, res){
  orgAct.findOne({where: {userName: req.body.userName}}).then(function(result){
    if (!result || result.length === 0) {
      res.status(404).send();
    } else if (bcrypt.compareSync(req.body.password, result.password)){
      var payload = {
        accountId: result.id
      };
      const token = jwt.sign(payload, secret, {
        header: {
            typ: 'JWT'
        }
      });
      res.send(token);
    } else {
      res.status(404).send();
    }
  });
  });


app.get('/userMain', function(req, res){
  var finalResult = [];
  orgAct.findById(req.accountId).then(function(result){
    finalResult.push(result);
    orgPost.findAll({WHERE: {orgId : req.accountId}}).then(function(result){
      finalResult.push(result);
      orgVerse.findAll({WHERE: {orgId : req.accountId}}).then(function(result){
        finalResult.push(result);
        console.log(finalResult);
          res.send(finalResult);
  });
  });
  });
});

app.post('/orgPost', function(req, res){
  orgPost.create({
    orgId: req.accountId,
    verse: req.body.verse,
    text: req.body.text,
    picture: req.body.picture
  }).then(function(result){
    res.send(result);
  });
});

app.post('/userPost', function(req, res){
  orgPost.create({
    userId: req.accountId,
    verse: req.body.verse,
    text: req.body.text,
    picture: req.body.picture
  }).then(function(result){
    res.send(result);
  });
});

app.post('/orgVerse', function(req, res){
  orgVerse.create({
    orgId: req.accountId,
    verse: req.body.verse
  }).then(function(result){
    res.send(result);
  });
});

app.post('/userVerse', function(req, res){
  orgVerse.create({
    userId: req.accountId,
    verse: req.body.verse
  }).then(function(result){
    res.send(result);
  });
});

var server = app.listen(3001, 'localhost', function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

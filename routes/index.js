var express = require('express');
const {
  Router
} = require('express');
var router = express.Router();


//require mongodb
const objectId = require('mongodb').ObjectId;

/* GET home page. */
module.exports = function (db, coll) {

  router.get('/', function (req, res, next) {
    const { id, name, age, weight, squad, startDate, endDate } = req.query;
    let query = new Object();
    const reg = new RegExp(name);

    if (id) {
      query._id = id;
    }
    if (name) {
      query.name = reg;
    }
    if (age) {
      query.age = age;
    }
    if (weight) {
      query.weight = parseFloat(weight);
    } 
    if (squad) {
      query.squad = squad;
    }
    if (startDate && endDate) {
      query.birth = { $gte: startDate, $lte: endDate }
    }

    const page = req.query.page || 1;
    const limit = 3;

    const offset = (page - 1) * limit;

    //New Page by Pagination
    let url = req.url.includes('page') ? req.url : `/?page=1&` + req.url.slice(2)

    db.collection(coll).count()
      .then((total) => {
        const pages = Math.ceil(total / limit)
        console.log('ini query', query);
        db.collection(coll).find(query).limit(limit).skip(offset).toArray()
          .then((result) => {

            res.status(200).render('index', {
              result,
              page,
              pages,
              url
            })
              .catch((err) => {
                res.status(500).json({
                  error: true,
                  message: err
                })
              })
          })
      })
  });

  router.get('/add', (req, res) => res.status(200).render('add'))

  router.post('/add', (req, res) => {
    let add = {
      "name": req.body.addName,
      "age": Number(req.body.addAge),
      "weight": parseFloat(req.body.addWeight),
      "birth": req.body.addBirth,
      "squad": JSON.parse(req.body.addSquad)
    }
    db.collection(coll).insertOne(add, err => {
      if (err) res.json(err)
     
    })
    res.redirect('/')
  })

  router.get('/delete/:id', (req, res) => {
    db.collection(coll).deleteOne({
      _id: objectId(req.params.id)
    }, err => {
      if (err) res.json(err)
    })
    res.redirect('/')
  })

  router.get('/edit/:id', (req, res) => {
    db.collection(coll).findOne({
      _id: objectId(req.params.id)
    }, (err, result) => {
      if (err) res.json(err)
      res.status(200).render('edit', {
        row: result
      })
    })
  })

  router.post('/edit/:id', (req, res) => {
    db.collection(coll).updateOne({
      _id: objectId(req.params.id)
    }, {
      $set: {
        name: req.body.editName,
        age: Number(req.body.editAge),
        weight: parseFloat(req.body.editWeight),
        birth: req.body.editBirth,
        squad: JSON.parse(req.body.editSquad)
      }
    }, err => {
      if (err) res.json(err)
    })
    res.redirect('/')
  })

  return router;
}

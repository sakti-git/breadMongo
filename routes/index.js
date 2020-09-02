var express = require('express');
var router = express.Router();
const {
  Router
} = require('express');

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
      query.age = parseInt(age);
    }
    if (weight) {
      query.weight = parseFloat(weight);
    }
    if (squad) {
      query.squad = JSON.parse(squad);
    }
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate }
    }

    const page = req.query.page || 1;
    const limit = 3;

    const offset = (page - 1) * limit;

    //New Page by Pagination
    let url = req.url.includes('page') ? req.url : `/?page=1&` + req.url.slice(2)

    //Use Promise
    db.collection(coll).count()
      .then((total) => {
        const pages = Math.ceil(total / limit)

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
    let data = req.body
    let add = {
      "_id": Number(data.add-id),
      "name": data.add-name,
      "age": Number(data.add-age),
      "weight": parseFloat(data.add-weight),
      "birth": data.add-birth,
      "squad": JSON.parse(data.add-squad)
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
    let data = req.body
    db.collection(coll).updateOne({
      _id: objectId(req.params.id)
    }, {
      $set: {
        name: data.name,
        age: Number(data.age),
        weight: parseFloat(data.weight),
        birth: data.birth,
        squad: JSON.parse(data.squad)
      }
    }, err => {
      if (err) res.json(err)
    })
    res.redirect('/')
  })

  return router;
}

var express = require('express');
var router = express.Router();

router.get('/index', function(req, res, next) {
  res.json("We gucci baby");
});

module.exports = router;

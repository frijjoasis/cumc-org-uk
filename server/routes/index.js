const router = require('express').Router();

router.get('/index', function(req, res, next) {
  res.json("Success");
});

module.exports = router;

const router = require('express').Router();
const passport = require('passport');

router.get('/login', passport.authenticate('raven'));

module.exports = router;
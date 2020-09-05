const router = require('express').Router();
const passport = require('passport');

router.get('/login', passport.authenticate('google', {
    scope: ['profile', 'email', 'openid'],
    hostedDomain: ['cam.ac.uk'], //TODO: Allow all cambridge owned domains
}));

router.get('/callback',
    passport.authenticate('google', {failureRedirect: '/login'}),
    function(req, res) {
        res.redirect('http://localhost:3000/');
    }
);

module.exports = router;
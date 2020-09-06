const router = require('express').Router();
const passport = require('passport');

router.get('/login', passport.authenticate('google', {
    scope: ['profile', 'email', 'openid'],
    hostedDomain: ['cam.ac.uk'],
    // This argument is required to obtain the Raven login box
}));

router.get('/callback',
    passport.authenticate('google', {failureRedirect: '/login'}),
    function(req, res) {
        res.redirect('http://localhost:3000/'); //TODO:
    }
);

router.get('/register', async function(req, res) {
    if (req.isAuthenticated()) {
        await res.json({missing: true});
    } else res.json(false);
});

router.get('/authenticated', async function(req, res) {
    await res.json(req.isAuthenticated);
});
module.exports = router;
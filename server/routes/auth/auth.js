const router = require('express').Router();
const passport = require('passport');

router.get('/login', passport.authenticate('google', {
    scope: ['profile', 'email', 'openid'],
    hostedDomain: ['cam.ac.uk'],
    // This argument is required to obtain the Raven login box
}));

router.get('/logout', function(req, res) {
    if (req.isAuthenticated()) {
        req.logout();
        res.redirect("http://localhost:3000/"); //TODO:
    } else res.json(false);
});

router.get('/callback',
    passport.authenticate('google', {failureRedirect: '/login'}),
    function(req, res) {
        const missing = true; //TODO:
        res.redirect(`http://localhost:3000/${missing ? "register" : ""}`); //TODO:
    }
);

module.exports = router;
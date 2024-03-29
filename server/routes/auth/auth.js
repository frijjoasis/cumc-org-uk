const router = require('express').Router();
const passport = require('passport');
const users = require('../../database/controllers/users')

router.get('/login', passport.authenticate('google', {
    scope: ['profile', 'email', 'openid'],
    hostedDomain: ['cam.ac.uk'],
    // This argument is required to obtain the Raven login box
}));

router.get('/login/other', passport.authenticate('google', {
    scope: ['profile', 'email', 'openid'],
    // An alternative login for people without Raven accounts
}));

router.get('/logout', function(req, res) {
    if (req.isAuthenticated()) {
        req.logout();
    }
    res.redirect("/");
});

router.get('/callback',
    passport.authenticate('google', {failureRedirect: '/login'}),
    function(req, res) {
        users.isMissing(req.user.id).then(missing => {
            res.redirect(`/${missing ? "register" : ""}`);
        });
    }
);

module.exports = router;
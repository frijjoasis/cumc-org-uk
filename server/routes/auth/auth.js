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

// Development-only routes
if (process.env.NODE_ENV === 'development') {
    // Bypass login for development
    router.get('/dev-login', function(req, res) {
        if (process.env.DEV_ADMIN_BYPASS !== 'true') {
            return res.status(403).json({err: "Development admin bypass not enabled"});
        }
        
        // Create a fake dev user session
        req.login({
            id: 999999999,
            email: 'dev-admin@cumc.org.uk',
            displayName: 'Development Admin',
            picture: 'https://via.placeholder.com/150',
            isDevUser: true
        }, function(err) {
            if (err) {
                console.error('Dev login error:', err);
                return res.status(500).json({err: "Failed to create dev session"});
            }
            
            console.log('🔓 DEV MODE: Logged in as development admin');
            res.json({
                success: true,
                message: 'Logged in as development admin',
                user: req.user
            });
        });
    });

    // Check dev auth status
    router.get('/dev-status', function(req, res) {
        if (process.env.DEV_ADMIN_BYPASS !== 'true') {
            return res.status(403).json({err: "Development admin bypass not enabled"});
        }
        
        res.json({
            authenticated: req.isAuthenticated(),
            user: req.user,
            devMode: true,
            adminBypass: process.env.DEV_ADMIN_BYPASS === 'true'
        });
    });
}

module.exports = router;
const router = require('express').Router();

router.get('/routes', function(req, res, next) {
    res.json({
        head: ["Coming Soon!"],
        body: [],
    });
});

module.exports = router;
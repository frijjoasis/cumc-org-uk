const router = require('express').Router();

router.get('/list', function(req, res, next) {
    res.json({
        head: ["Coming Soon!"],
        body: [],
    });
});

module.exports = router;
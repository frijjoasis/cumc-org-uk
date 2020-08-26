const router = require('express').Router();

router.get('/list', function(req, res, next) {
    res.json({
        head: ["Success"],
        body: [],
    });
});

module.exports = router;
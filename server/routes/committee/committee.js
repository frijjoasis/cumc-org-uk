const router = require('express').Router();

router.get('/past', function(req, res, next) {
    res.json({
        head: [],
        body: [],
    });
});

module.exports = router;
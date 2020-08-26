const router = require('express').Router();

router.get('/routes', function(req, res, next) {
    res.json({
        head: [],
        body: [],
    });
});

module.exports = router;
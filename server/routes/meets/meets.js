const router = require('express').Router();
const meets = require('../../database/controllers/meets');

router.get('/upcoming', async function(req, res, next) {
    await meets.getAllUpcoming().then(upcoming => res.json(upcoming));
});

module.exports = router;
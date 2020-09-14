const router = require('express').Router();
const meets = require('../../database/controllers/meets');

router.get('/upcoming', async function(req, res, next) {
    await meets.getAllUpcoming().then(upcoming => res.json(upcoming));
});

router.post('/view', async function(req, res) {
    await meets.getOneUpcoming(req.body.id).then(meet => {
        return meet.getUser().then(org => {
            meet.organiser = `The emergency contact for this meet is ${org.firstName} ${org.lastName} on ${org.phone}`
            res.json(meet);
        });
    }).catch(err => {
        console.error("Database error: ", err);
        res.json({err: "Database error: Please contact the webmaster"});
    });
});

module.exports = router;
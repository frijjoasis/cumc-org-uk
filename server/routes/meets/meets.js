const router = require('express').Router();
const meets = require('../../database/controllers/meets');
const users = require('../../database/controllers/users');
const signups = require('../../database/controllers/signups');
const {committeeAuth, userAuth} = require('../middleware');

router.get('/upcoming', async function(req, res, next) {
    await meets.getAllUpcoming().then(upcoming => res.json(upcoming));
});

router.get('/all', committeeAuth, async function(req, res) {
    return meets.getAll().then(all => res.json(all));
});

router.post('/view', async function(req, res) {
    await meets.getOneUpcoming(req.body.id).then(meet => {
        if (meet) res.json(meet);
        else res.json({err: "Database error: Could not find meet"})
    }).catch(err => {
        console.error("Database error: ", err);
        res.json({err: "Database error: Please contact the webmaster"});
    });
});

router.post('/edit', committeeAuth, async function(req, res) {
    await meets.upsertMeet(req.body, req.user.id).then(meet => {
        if (meet.length) res.json(meet[0].dataValues.id);
        else res.json({err: "Could not find that meet!"})
    }).catch(err => {
        console.error("Database error: ", err);
        res.json({err: "Database error: Please contact the webmaster"});
    });
});

router.post('/questions', committeeAuth, async function(req, res) {
   await meets.upsertQuestions(req.body.questions, req.body.id).then(() => {
       res.json(true);
   }).catch(err => {
       console.error("Database error: ", err);
       res.json({err: "Database error: Please contact the webmaster"});
   })
});

router.post('/register', userAuth, async function(req, res) {
    await users.isMissing(req.user.id).then(missing => {
        if (!missing) {
            return signups.handleRegister(req.body, req.user).then(() => {
                res.json(true);
            }).catch(err => {
                console.error("Database error: ", err);
                res.json({err: "Database error: Please contact the webmaster"});
            });
        } else res.json({err: "You need to complete your profile to do that!"});
    });
});

router.post('/delete', committeeAuth, async function(req, res) {
    await meets.deleteMeet(req.body.id).then(() => {
        res.json(true);
    }).catch(err => {
        console.error("Database error: ", err);
        res.json({err: "Database error: Please contact the webmaster"});
    });
});

router.post('/historyOther', committeeAuth, async function(req, res) {
    return signups.getHistory(req.body.id).then(history => {
        res.json(history);
    });
});

router.get('/history', userAuth, async function(req, res) {
    return signups.getHistory(req.user.id).then(history => {
        res.json(history);
    });
});

module.exports = router;
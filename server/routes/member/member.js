const router = require('express').Router();
const members = require('../../database/controllers/members');

router.get('/', async function(req, res) {
    if (req.isAuthenticated()) {
        await members.getMember(req.user.id).then(member => {
            res.json({
                member: member
            });
        });
    } else res.json(false);
});

router.get('/committee', async function(req, res) {
    if (req.isAuthenticated()) {
        await members.getCommitteeRole(req.user.id).then(role => {
            res.json(role);
        });
    } else res.json(false);
});

router.post('/info', async function(req, res) {
   if (req.isAuthenticated()) {
       await members.getCommitteeRole(req.user.id).then(role => {
           if (role) {
               return members.getInfo(req.body.id).then(member => {
                   res.json(member);
               });
           } else res.json({err: "You need a committee role to do that!"});
       });
   } else res.json({err: "You need to be signed in to do that!"});
}); //TODO: Just make this a piece of middleware, it's cleaner

router.get('/list', async function(req, res) {
    if (req.isAuthenticated()) {
        await members.getCommitteeRole(req.user.id).then(role => {
            if (role) {
                return members.list().then(members => {
                    res.json(members);
                });
            } else res.json({err: "You need a committee role to do that!"});
        });
    } else res.json({err: "You need to be signed in to do that!"});
});

module.exports = router;
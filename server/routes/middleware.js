const members = require('../database/controllers/members');

async function committeeAuth(req, res, next) {
    if (req.isAuthenticated()) {
        await members.getCommitteeRole(req.user.id).then(role => {
            if (role) {
                return next();
            } else return res.json({err: "You need a committee role to do that!"});
        });
    } else return res.json({err: "You need to be signed in to do that!"});
}

function userAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else return res.json({err: "You need to be signed in to do that!"})
}

module.exports = {
    committeeAuth, userAuth
}
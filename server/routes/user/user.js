const router = require('express').Router();

router.get('/', async function(req, res) {
    if (req.isAuthenticated()) {
        await res.json({
            user: req.user});
    } else res.json(false);
});

router.post('/register', async function(req, res) {
    if (req.isAuthenticated()) {
        console.log(req.body);
        // Sanitise user input
    } else res.json({err: "You need to be signed in to do that!"});
});

router.get('/info', async function(req, res) {
    if (req.isAuthenticated()) {
        res.json({
            firstName: "",
            lastName: "",
            dob: "",
            college: "",
            phone: "",
            address1: "",
            address2: "",
            postCode: "",
            city: "",
            country: "",
            emergencyName: "",
            emergencyPhone: "",
            bmc: "", //TODO:
        })
    } else res.json(false);
});

module.exports = router;
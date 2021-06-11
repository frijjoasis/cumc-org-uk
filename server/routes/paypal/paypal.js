const {committeeAuth, userAuth} = require('../middleware');

const router = require('express').Router();
const members = require('../../database/controllers/members');
const users = require('../../database/controllers/users');
const signups = require('../../database/controllers/signups');
const meets = require('../../database/controllers/meets');
const axios = require('axios');

const PAYPAL_OAUTH_API = 'https://api.sandbox.paypal.com/v1/oauth2/token/';
const PAYPAL_ORDER_API = 'https://api.sandbox.paypal.com/v2/checkout/orders/';
const PAYPAL_AUTHORIZATION_API = 'https://api.sandbox.paypal.com/v2/payments/authorizations/';

let accessToken;

axios.post(PAYPAL_OAUTH_API, {}, {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
        username: process.env.PAYPAL_ID,
        password: process.env.PAYPAL_SECRET
    },
    params: {
        grant_type: 'client_credentials'
    }
}).then(res => {
    accessToken = res.data.access_token;
    console.log("PayPal API access token obtained.")
}).catch(err => {
    console.error('PayPal API error: ', err);
});

router.post('/membership', userAuth, async function(req, res) {
    return verify(req.body.data.orderID, '25.00').then(v => {
        if (v.err) res.json(v.err);
        else {
            return authorise(req.body.data.orderID).then(auth => {
                if (auth.err) res.json(auth.err);
                else {
                    return capture(auth, '25.00').then(cap => {
                        if (cap.err) res.json(cap.err);
                        else {
                            return members.upsert({
                                id: req.user.id,
                                hasPaid: true,
                                hasFree: false,
                                paymentID: cap
                            }).then(() => {
                                res.json(true)
                            }).catch(err => {
                                console.error("Database error: ", err);
                                res.json({err: "Database error: Please contact the webmaster"});
                            });
                        }
                    });
                }
            });
        } // Errors in verify, authorise and capture are caught by the respective functions
    });
});

router.post('/register', userAuth, async function(req, res) {
    await meets.getOneUpcoming(req.body.form.meetID).then(meet => {
        if (meet.disabled) {
            res.json({err: "Signups are not open for this meet!"});
        } else return verify(req.body.data.orderID, meet.price).then(v => {
            if (v.err) res.json(v.err);
            else {
                return authorise(req.body.data.orderID).then(auth => {
                    if (auth.err) res.json(auth.err);
                    else {
                        req.body.form.authID = auth;
                        return signups.handleRegister(req.body.form, req.user).then(() => {
                            res.json(true);
                        }); // An error here is caught by parent promise
                    }
                });
            } // Errors in verify and authorise are caught by the respective functions
        });
    }).catch(err => {
        console.error("Database error: ", err);
        res.json({err: "Database error: Please contact the webmaster"});
    });
});

router.post('/capture', committeeAuth, async function(req, res) {
    await meets.getOneUpcoming(req.body.id).then(meet => {
        let promises = [];
        meet.signups.forEach(signup => {
            if (signup.authID && !signup.captureID && (!req.body.authID || req.body.authID === signup.authID)) {
                promises.push(capture(signup.authID, meet.price).then(captureID => {
                    if (captureID.err) captureID = 'Capture Failed';
                    return signups.updatePayment(signup.id, captureID);
                }));
            }
        });
        return Promise.all(promises).then(() => res.json(true)).catch(err => {
            console.error(err);
            res.json({err: "Encountered an error. Please contact the webmaster"});
        })
    }).catch(err => {
        console.error("Database error: ", err);
        res.json({err: "Database error: Please contact the webmaster"});
    });
});

router.post('/void', committeeAuth, async function(req, res) {
    await meets.getOneUpcoming(req.body.id).then(meet => {
        let promises = [];
        meet.signups.forEach(signup => {
            if (signup.authID && !signup.captureID && (!req.body.authID || req.body.authID === signup.authID)) {
                promises.push(voidPayment(signup.authID).then(voidRes => {
                    return signups.updatePayment(signup.id, voidRes.err ? 'Void Failed' : 'Void');
                }));
            }
        });
        return Promise.all(promises).then(() => res.json(true)).catch(err => {
            console.error(err);
            res.json({err: "Encountered an error. Please contact the webmaster"});
        })
    }).catch(err => {
        console.error("Database error: ", err);
        res.json({err: "Database error: Please contact the webmaster"});
    });
});

router.post('/required', userAuth, async function(req, res) {
    await isPaymentNeeded(req.user.id, req.body.meetID).then(isNeeded => {
        if (isNeeded) {
            res.json(isNeeded); // Error or payment required
        } else {
            req.body.captureID = 'Not Paying';
            return signups.handleRegister(req.body, req.user).then(() => {
                res.json(isNeeded);
            });
        } // Payment not required
    }).catch(err => {
        console.error("Database error: ", err);
        res.json({err: "Database error: Please contact the webmaster"});
    });
});

function isPaymentNeeded(id, meetID) {
    return users.isMissing(id).then(missing => {
        if (!missing) {
            return meets.getOneUpcoming(meetID).then(meet => {
                if (!meet.price || parseFloat(meet.price) < 0.01) {
                    return false; // Meet is free!
                } else if (meet.disabled) {
                    return {err: "Signups are not open for this meet!"}
                } else {
                    return members.getMember(id).then(member => {
                        //TODO: Condition this on the first 3 months of the year, somehow...
                        if (!member || member.hasFree) {
                            // User not known to have gone on any meets
                            return members.upsert({
                                id: id,
                                // hasPaid defaults to false
                                hasFree: false
                                //TODO: This should be updated on signup, not on checking if they need to pay...
                            }).then(() => {
                                return true;
                                // Policy is that a user gets to attend one meet before having to become a full member
                            });
                        } else if (member.hasPaid) {
                            // They are a current member
                            return true;
                        } else {
                            // Neither paid nor a free meet remaining
                            return {err: "You need to pay for membership to do that!"}
                        }
                    });
                }
            });
        } return {err: "You need to complete your profile to do that!"};
    });
}

function verify(orderID, price) {
    return axios.get(`${PAYPAL_ORDER_API}${orderID}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then(verifyRes => {
        if (parseFloat(verifyRes.data.purchase_units[0].amount.value) === parseFloat(price)) {
            // Check the order is for the correct amount.
            return true;
        } else {
            return {err: "An error occurred verifying the amount paid. You have not been charged"};
        }
    }).catch(err => {
        console.error(err);
        return {err: "An error occurred verifying the payment. You have not been charged"};
    });
}

function authorise(orderID) {
    return axios.post(`${PAYPAL_ORDER_API}${orderID}/authorize`, {}, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then(authRes => {
        return authRes.data.purchase_units[0].payments.authorizations[0].id;
    }).catch(err => {
        console.error(err);
        return {err: "An error occurred authorising payment. You may be charged. Please contact the webmaster"};
    });
}

function capture(authID, price) {
    return axios.post(`${PAYPAL_AUTHORIZATION_API}${authID}/capture`, {
        amount: {
            value: price,
            currency_code: "GBP"
        }
    }, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then(captureRes => {
        return captureRes.data.id;
    }).catch(err => {
        console.error(err);
        return {err: "An error occurred capturing payment. You may have been charged. Please contact the webmaster"};
    });
}

function voidPayment(authID) {
    return axios.post(`${PAYPAL_AUTHORIZATION_API}${authID}/void`, {}, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then(() => {
        return true;
        // Returns 204 No Content
    }).catch(err => {
        console.error(err);
        return {err: "An error occurred voiding payment. Please contact the webmaster"};
    });
}

module.exports = router;
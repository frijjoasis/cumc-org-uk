const router = require('express').Router();
const members = require('../../database/controllers/members');
const axios = require('axios');
const {userAuth} = require('../middleware');

const PAYPAL_OAUTH_API = 'https://api.sandbox.paypal.com/v1/oauth2/token/';
const PAYPAL_ORDER_API = 'https://api.sandbox.paypal.com/v2/checkout/orders/';

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
}).catch(err => {
    console.error('PayPal API error: ', err);
});

router.post('/membership', userAuth, async function(req, res) {
    await axios.get(`${PAYPAL_ORDER_API}${req.body.data.orderID}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then(r => {
        if (r.data.purchase_units[0].amount.value === '25.00') {
            // Check they've paid the full amount
            return members.upsert({id: req.user.id, hasPaid: true}).then(() => res.json(true));
        } else {
            res.json({err: 'An error occurred verifying the amount paid. Please contact the webmaster, your payment might have gone through'});
        }
    }).catch(err => {
        console.error(err);
        res.json({err: 'An error occurred verifying the payment. Please contact the webmaster, your payment might have gone through'});
    });
});

module.exports = router;
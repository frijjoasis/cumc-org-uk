var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const routers = [
    {path: '/api/', router: require('./routes/index')},
    {path: '/api/about/', router: require('./routes/about/about')},
    {path: '/api/gear/', router: require('./routes/gear/gear')},
    {path: '/api/committee', router: require('./routes/committee/committee')},
];

var app = express();

var port = 5000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

routers.forEach(i => {
    app.use(i.path, i.router);
});

app.listen(port, () => console.log(`Listening on port ${port}`));
//load modules
const express = require('express');
const exphbs = require('express-handlebars');

//connect to mongouri exported from external file
const keys = require('./config/keys');
const mongoose = require('mongoose');

//initalise the application
const app = express();

// app.engine('handlebars', exphbs({
//     defaultLayout: 'main'
// }));

//setup template engine 
app.engine('handlebars', exphbs.engine({ defaultLayout: "main" }));

//set up static files to serve css javascrit and images
app.set('view engine', 'handlebars');

app.use(express.static('public'));
//connect to remote database
mongoose.connect(keys.MongoURI)
    .then(() => {
        console.log('Connected to remote Database...');
    }).catch(() => {
        console.log(err);
    });
// set environment variable for port
const port = process.env.PORT || 3000;
// handle routes
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

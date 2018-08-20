const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/database');
const cookieParser = require('cookie-parser');
const session = require('express-session');

mongoose.connect(config.config, { useNewUrlParser: true });

// ON connection
mongoose.connection.on('connected' , () => {
    console.log('connected to database' + config.config);
})

// ON error
mongoose.connection.on('error' , (err) => {
    console.log('connected to database' + err);
})

const app = express();
const server = require('http').createServer(app);

const products = require('./routes/product');

//Port number
const port = 3000;

//Cors Module
app.use(cors());

app.use(express.static(path.join(__dirname,'public')));

//Body Parser
app.use(bodyParser.json());

//Session initialize
app.use(session({secret: 'abcd', saveUninitialized: true, resave: true}));

//Product Routing
app.use('/product',products);

app.get('/', (req,res) => {
    res.send('Working');
})

server.listen(port, () => {
    console.log('Server Started'+port);
});

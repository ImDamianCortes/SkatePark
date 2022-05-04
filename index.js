const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const expressFileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
require('dotenv').config();

const chalk = require('chalk'); // dev only

// Initialization
const app = express();

// Settings
const host = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

app.engine('hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '/views/layouts'),
    partialsDir: path.join(__dirname, '/views/partials'),
    extname: 'hbs',
}));

app.set('view engine', 'hbs');

// Middlewares
app.use("/public", express.static(path.join(__dirname, '/public')));

app.use('/bootCss', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/bootJs', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressFileUpload(
    {
        limits: { fileSize: 50 * 1024 * 1024 },
        abortOnLimit: true,
        responseOnLimit: "El tamano del archivo es demasiado grande",
    }
));

// Routes
app.use(require("./routes/router"));

// Starting the server
app.listen(PORT, () => {
    console.log(chalk.yellow(`\nServer is running on port ${PORT}\nhttp://${host}:${PORT}/skatepark\n`));
});
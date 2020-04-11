let express = require('express'),
    app = express(),
    bodyparser = require('body-parser'),
    mysql = require('mysql'),
    session = require('express-session'),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    bcrypt = require('bcrypt'),
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'onu'
    });
    

app.use(session({
    secret: 'crayonrouge',
    resave: true,
    saveUninitialized: true
}
));

//Use of body-parser
app.use(bodyparser.urlencoded({ extended: false }));
//use of static folder
app.use(express.static('public'));
//use of ejs template engine
app.set('view engine', 'ejs');
//Securisation input
function blbl(str) {
    if (str == null) return '';
    return String(str).
        replace(/&/g, '&amp;').
        replace(/</g, '&lt;').
        replace(/>/g, '&gt;').
        replace(/"/g, '&quot;').
        replace(/--/g, '&#151;').
        replace(/'/g, '&#039;');
};

let sess;

app.get('/', (req, res) => {
    sess = req.session;
    if(sess.pseudo){
        return res.render('index',{pseudo:sess.pseudo});
    } else {
        return res.render('index');
    }
});



//create an account
app.post('/register', (req, res) => {
	let pseudo = blbl(req.body.pseudo)
        pass = blbl(req.body.password),
        firstName = blbl(req.body.firstName),
        lastName = blbl(req.body.lastName),
        birthDate = blbl(req.body.birthDate),
        city = blbl(req.body.city),
        zip = blbl(req.body.zip),
        sess=req.session;

	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(pass, salt, (err, hash) => {
			pass = hash;
			let createAccount = `INSERT INTO Users (Pseudo,Password,First_name,Last_name,Birth_date,City,Zipcode) VALUES ('${pseudo}','${pass}','${firstName}','${lastName}','${birthDate}','${city}','${zip}');`;
			connection.query(createAccount, (error, results, field) => {
				if (error) {
					console.log(error);
					res.redirect('/');
				} else {
                    sess.pseudo = pseudo;
					res.redirect('/');
				}
			});
		})
	});

});
//Connect to an account
app.post('/connect', (req, res) => {
	sess = req.session;
	let pseudo = blbl(req.body.pseudo);
	let pass = blbl(req.body.password);
	let connectAccount = `SELECT Password FROM Users WHERE Pseudo='${pseudo}'`;
	connection.query(connectAccount, (error, results, field) => {
		if (error) {
			console.log(error);
		} else {
			bcrypt.compare(pass, results[0].Password, (err, result) => {
				if (result) {
					sess.pseudo = pseudo;
					res.redirect('/');
				} else {
					res.redirect('/')
				}
			})
		}
	});
});
//Logout part
app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
});

app.get('*', (req, res) => {
    res.redirect('/');
})

//Opening the server on the following port
http.listen(process.env.PORT || 8080, () => {
    console.log('listening on ' + (process.env.PORT || '8080'));
});
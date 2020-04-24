let express = require('express'),
    app = express(),
    bodyparser = require('body-parser'),
    fs = require('fs'),
    mysql = require('mysql'),
    session = require('express-session'),
    http = require('http').Server(app),
    https = require('https'),
    bcrypt = require('bcrypt'),
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'onu',
        password: '8i;25bbPh=Yi7P~8R;P)',
        database: 'onu'
    });


app.use(session({
    secret: 'crayonrouge',
    resave: true,
    saveUninitialized: true
}
));

const privateKey = fs.readFileSync('/etc/letsencrypt/live/firstthegame.fr/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/firstthegame.fr/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/firstthegame.fr/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

const httpsServer = https.Server(credentials, app);
let io = require('socket.io')(http);


//Use of body-parser
app.use(bodyparser.urlencoded({ extended: false }));
//use of static folder
app.use(express.static('dist/public'));
app.use(express.static(__dirname, { dotfiles: 'allow' } ));
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
let allClients = [];
io.on('connection', (socket) => {
    console.log('user connected');
    allClients.push(socket.id);

    let room;
    socket.on('createGroup', (pseudo) => {
        socket.pseudo = pseudo
        room = socket.id;
        socket.roomId = room;
        socket.join(room);
        io.to(room).emit('party created', room, [pseudo]);
    });

    socket.on('retrieve',(pseudo,roomId)=>{
        if(!socket.roomId){
            socket.pseudo = pseudo;
            socket.roomId = roomId;
            socket.join(roomId);
            let clients = io.sockets.adapter.rooms[roomId].sockets;
            let party = [];
            for (var client in clients) {
                party.push(io.sockets.connected[client].pseudo);
            }
            io.to(roomId).emit('party refresh',party);
        };
    });

    socket.on('looking for party', (room, pseudo) => {
        socket.pseudo = pseudo;
        socket.roomId = room;
        socket.join(room);
        let clients = io.sockets.adapter.rooms[room].sockets;
        let list = []
        for (var client in clients) {
            list.push(io.sockets.connected[client].pseudo);
        }
        io.to(room).emit('party joined', list);
    });
    socket.on('group size', (price) => {
        let room = socket.roomId;
        io.to(room).emit('group size', Object.keys(io.sockets.adapter.rooms[room].sockets).length, room, price);
    });

    socket.on('connect me', (room, pseudo) => {
        room += '1'
        socket.roomId = room;
        socket.pseudo = pseudo;
        socket.join(room);
        io.to(room).emit('connect me', Object.keys(io.sockets.adapter.rooms[room].sockets).length)
    });


    socket.on('start game', (price) => {
        let room = socket.roomId;
        let players = Object.keys(io.sockets.adapter.rooms[room].sockets);
        players.sort();
        //choix de l'hote
        if (players[0] == socket.id) {
            // envoyer uniquement à l'hote
            io.to(socket.id).emit('you are the host', players.length, price);
        }
    });

    socket.on('setup', (game) => {
        //assigner les ids aux joueurs
        let room = socket.roomId;
        let players = Object.keys(io.sockets.adapter.rooms[room].sockets);
        players.sort();
        allClients.sort();
        let placement = {};
        players.map(e => {
            placement[players.indexOf(e)] = io.sockets.connected[e].pseudo
        })
        game['pos'] = placement;
        game['game'] = game.game;
        io.to(room).emit('setup', game);
        //envoyer les infos aux joueurs
    });

    socket.on('PlayedEvent', (card, current, previousPos) => {
        let room = socket.roomId;
        io.to(room).emit('PlayedEvent', card, current, previousPos);
    }
    );

    socket.on('Change Color', (color,previousPos) => {
        let room = socket.roomId;
        io.to(room).emit('Change Color', color,previousPos);
    });

    socket.on('uno',(type,pos)=>{
        io.to(socket.roomId).emit('uno',type,pos);
    })

    socket.on('disconnect', () => {
        let room = socket.roomId;
        let i = allClients.indexOf(socket.id);
        allClients.splice(i, 1);
        let pos = i;
        io.to(room).emit('disconnected', pos);
        console.log('user ' + socket.pseudo + ' disconnected');
    })

})


app.get('/', (req, res) => {
    sess = req.session;
    if (sess.pseudo) {
        let getprofile = `SELECT * from Stats WHERE Id_user = '${sess.idUser}' `;
        connection.query(getprofile, (err, results, field) => {
            if (err) {
                console.log(err);
                return res.render('index', { pseudo: sess.pseudo });
            } else {
                return res.render('index', {
                    pseudo: sess.pseudo,
                    gplayed: results[0].Games_played.toString(),
                    wrate: ((results[0].Games_won / results[0].Games_played * 100) || 0).toString(),
                    tokenswon: results[0].Tokens_won.toString(),
                    tokenslost: results[0].Tokens_lost.toString(),
                    xpAmount: sess.xpAmount.toString()
                })
            }
        })
    } else {
        return res.render('index');
    }
});

app.post('/room', (req, res) => {
    sess = req.session;
    if (!sess.pseudo) return res.redirect('/');
    sess.gameRoom = req.body.id;
    sess.gameNumber = req.body.groupSize;
    sess.gamePrice = req.body.groupPrice;
    return res.render('room', { pseudo: sess.pseudo, roomId: sess.gameRoom, number: sess.gameNumber, price: sess.groupPrice });
});

//create an account
app.post('/register', (req, res) => {
    let pseudo = blbl(req.body.pseudo)
    pass = blbl(req.body.password),
    email = blbl(req.body.Email),
    sess = req.session;

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(pass, salt, (err, hash) => {
            pass = hash;
            let createAccount = `INSERT INTO Users (Pseudo,Password,Email) VALUES ('${pseudo}','${pass}','${email}');`;
            connection.query(createAccount, (error, results, field) => {
                if (error) {
                    console.log(error);
                    res.redirect('/');
                } else {
                    //    Ici aller chercher directement l'idUser pour le stocker coté serveur
                    let getId = `SELECT Id_user,Xp from Users WHERE pseudo = '${pseudo}'`
                    connection.query(getId, (err, results, field) => {
                        if (err) {
                            console.log(err);
                            res.redirect('/');
                        } else {
                            sess.idUser = results[0].Id_user;
                            sess.xpAmount = results[0].Xp;
                            sess.pseudo = pseudo;

                            let createStats = `INSERT INTO Stats (Id_user) VALUES ('${sess.idUser}')`;
                            connection.query(createStats, (err, results, field) => {
                                if (err) {
                                    console.log(err);
                                }
                                res.redirect('/');
                            })
                        }
                    })
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
    let connectAccount = `SELECT Id_user,Xp,Password FROM Users WHERE Pseudo='${pseudo}'`;
    connection.query(connectAccount, (error, results, field) => {
        if (error) {
            console.log(error);
        } else {
            if (results.length) {
                bcrypt.compare(pass, results[0].Password, (err, result) => {
                    if (result) {
                        sess.pseudo = pseudo;
                        sess.idUser = results[0].Id_user;
                        sess.xpAmount = results[0].Xp;
                        res.redirect('/');
                    } else {
                        res.redirect('/')
                    }
                })
            } else {
                res.redirect('/');
            }
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





http.listen(80, () => {
	console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});
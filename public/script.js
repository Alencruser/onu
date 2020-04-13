//variable stocke la game
let game;

//variables pour echanger les valeurs en couleur ou valeur
let colKeys = Object.keys(Color),
    colVal = Object.values(Color),
    valKeys = Object.keys(Value),
    valVal = Object.values(Value),
    convertValue = {
        ZERO: 0,
        ONE: 1,
        TWO: 2,
        THREE: 3,
        FOUR: 4,
        FIVE: 5,
        SIX: 6,
        SEVEN: 7,
        EIGHT: 8,
        NINE: 9
    };

function launchCustom() {
    socket.emit('group size', 0);
}
socket.on('group size', (size, room, price) => {
    if (size > 1) {
        let form = document.createElement('form');
        form.action = "/room/" + room;
        form.method = 'POST';
        let input = document.createElement('input');
        input.name = "groupSize";
        input.value = size;
        let input2 = document.createElement('input');
        input2.name = "groupPrice";
        input2.value = price;
        form.append(input);
        form.append(input2);
        document.body.append(form);
        form.submit();
    }
});


socket.on('you are the host', (partySize, price) => {
    game = new Game(partySize, price);
    //envoyer un socket avec les objets player + la carte en cours.
    socket.emit('setup', { players: game._players, discardedCard: game._discardedCard, currentPlayer: game._currentPlayer, game: game })
});

socket.on('setup', (session) => {
    game = new Game(4, 0);
    game._price = session.game._price;
    game.drawPile.drawpile = session.game.drawPile.drawpile;
    game.direction = session.game.direction;
    game._currentPlayer.hand = session.game._currentPlayer.hand;
    game._currentPlayer._pos = session.game._currentPlayer._pos;
    game._discardedCard = session.game._discardedCard;
    game.hasdrawn = session.game.hasdrawn;
    game.NUMBER_OF_PLAYER = session.game.NUMBER_OF_PLAYER;
    game.cumulativeamount = session.game.cumulativeamount;
    let placement = session.pos;
    for (var player in placement) {
        if (mypseudo == placement[player]) {
            let numberOfPlayers = session.players.length;
            document.getElementById('siege0').dataset.pos = player;
            //placement de la carte du haut de pile
            let discarded = document.createElement('img');
            discarded.src = "img/card/" + colKeys[colVal.indexOf(session.discardedCard._color)] + '_' + ((Object.keys(convertValue).includes(valKeys[valVal.indexOf(session.discardedCard._value)])) ? convertValue[valKeys[valVal.indexOf(session.discardedCard._value)]] : valKeys[valVal.indexOf(session.discardedCard._value)]) + ".png";
            discarded.id = "discard";
            if (document.getElementById('discardedCard').children.length) document.getElementById('discardedCard').removeChild(document.getElementById('discardedCard').lastElementChild);
            document.getElementById('discardedCard').append(discarded);
            //placer joueur principal ett ses cartes
            document.getElementById('siege0').innerHTML = "";
            session.players[player].hand.map(e => {
                let src = "img/card/" + colKeys[colVal.indexOf(e._color)] + '_' + ((Object.keys(convertValue).includes(valKeys[valVal.indexOf(e._value)])) ? convertValue[valKeys[valVal.indexOf(e._value)]] : valKeys[valVal.indexOf(e._value)]) + ".png";
                let img = document.createElement('img');
                img.src = src;
                img.dataset.attr = e._color + ',' + e._value;
                document.getElementById('siege0').append(img);
                img.addEventListener("click", function () { centralizeEvents("clickcardEvent", e._value, e._color); });
            })


            //placer autres joueurs
            let siegeIndex = 1;
            for (i = 1; i < numberOfPlayers; i++) {
                let actualPlayer;
                let placed = false;
                if (numberOfPlayers == 2) {
                    actualPlayer = 1 - player;
                } else {
                    actualPlayer = (player + i) % (numberOfPlayers);
                }

                //ici assigner les places avec un while
                while (!placed) {
                    siegeIndex++;
                    console.log(document.getElementById('siege' + siegeIndex).dataset.socket);
                    let siege = document.getElementById('siege' + siegeIndex).dataset.socket;
                    let permit = []
                    if (siege.includes(',')) permit = siege.split(',');
                    else permit.push(siege);

                    if (permit.includes(numberOfPlayers.toString())) {
                        //assigner la place au siege
                        document.getElementById('siege' + siegeIndex).textContent = placement[actualPlayer] + ': Cartes en mains : ' + session.players[actualPlayer].hand.length;
                        //placed passe true
                        placed = true;
                    }

                }
                console.log('tour numero :' + i);
                console.log('acttual player pos', actualPlayer);
                console.log(placement[actualPlayer]);
            }
        }
    }
    console.log(session);
})

socket.on('PlayedEvent', (card, current) => {
    document.getElementById('discard').src = "img/card/" + colKeys[colVal.indexOf(card._color)] + '_' +
        ((Object.keys(convertValue).includes(valKeys[valVal.indexOf(card._value)])) ?
            convertValue[valKeys[valVal.indexOf(card._value)]] :
            valKeys[valVal.indexOf(card._value)]) + ".png";
    let siege0 = document.getElementById('siege0');
    if (current == game._currentPlayer._pos) {
        for (let i = 0; i < Object.keys(game._currentPlayer.hand).length; i++) {
            console.log(siege0.children[i]);
            let car = new Card(siege0.children[i].dataset.attr.split(',')[1], siege0.children[i].dataset.attr.split(',')[0]);
            if (car.matches(card)) {
                console.log(siege0.children);
                siege0.removeChild(siege0.children[i]);
                console.log(siege0.children);
                break;
            }
        }
    }
    else { }
});

// socket.on('clickcardEvent', (card) => {
//     let room = socket.roomId;
//     let players = Object.keys(io.sockets.adapter.rooms[room].sockets);
//     players.sort();
//     io.to(players[0]).emit('play card', card);
// });

function centralizeEvents(Message, value, color) {
    if (siege0.dataset.pos == game._currentPlayer._pos) {
        switch (Message) {
            case "clickcardEvent":
                game.play(new Card(value, color));
                socket.emit('PlayedEvent', new Card(value, color), game._currentPlayer._pos); //TEMPORAIRE
                break;
            case "StartEvent": // Nothing
                break;
            case "NextPlayerEvent": // Message.nextPlayer
                break;
            case "CardDenyEvent": // Message.currentPlayer
                break;
            case "CardPlayEvent": socket.emit('PlayedEvent', game);
                break;
            case "GameEndEvent": // Message.currentPlayer & Message.price
                break;
            case "DrawEvent": // Message.drawPlayer & Message.cards
                break;
        }
    }
};
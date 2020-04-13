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
        form.action = "/room";
        form.method = 'POST';
        let input = document.createElement('input');
        input.name = "groupSize";
        input.value = size;
        let input2 = document.createElement('input');
        input2.name = "groupPrice";
        input2.value = price;
        let input3 = document.createElement('input');
        input3.name = 'id';
        input3.value = room;
        form.append(input);
        form.append(input2);
        form.append(input3);
        document.body.append(form);
        form.submit();
        form.style.display = "none";
    }
});


socket.on('you are the host', (partySize, price) => {
    game = new Game(partySize, price);
    //envoyer un socket avec les objets player + la carte en cours.
    socket.emit('setup', { players: game._players, discardedCard: game._discardedCard, currentPlayer: game._currentPlayer, game: game })
});

socket.on('setup', (session) => {
    // game = new Game(2, 0);
    jQuery.extend(true,game,session.game);
    // game._price = session.game._price;
    // game.drawPile.drawpile = session.game.drawPile.drawpile;
    // game.direction = session.game.direction;
    // game._currentPlayer.hand = session.game._currentPlayer.hand;
    // game._currentPlayer._pos = session.game._currentPlayer._pos;
    // game._discardedCard = session.game._discardedCard;
    // game.hasdrawn = session.game.hasdrawn;
    // game.NUMBER_OF_PLAYER = session.game.NUMBER_OF_PLAYER;
    // game.cumulativeamount = session.game.cumulativeamount;
    // game._players = session.game._players;
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
                    let siege = document.getElementById('siege' + siegeIndex).dataset.socket;

                    let permit = []
                    if (siege.includes(',')) permit = siege.split(',');
                    else permit.push(siege);

                    if (permit.includes(numberOfPlayers.toString())) {
                        //assigner la place au siege
                        document.getElementById('siege' + siegeIndex).textContent = placement[actualPlayer];
                        document.getElementById('siege' + siegeIndex).dataset.pos = actualPlayer;
                        for (x = 0; x < session.players[actualPlayer].hand.length; x++) {
                            let img = document.createElement('img');
                            img.src = "img/Card/default_back.png";
                            document.getElementById('siege' + siegeIndex).append(img);
                        }

                        //placed passe true
                        placed = true;
                    }

                }
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
    console.log(current, game._currentPlayer._pos, document.getElementById('siege0').dataset.pos);
    if (current == game._currentPlayer._pos) {
        console.log("Hey");
        for (let i = 0; i < Object.keys(game._currentPlayer.hand).length; i++) {
            let car = new Card(siege0.children[i].dataset.attr.split(',')[1], siege0.children[i].dataset.attr.split(',')[0]);
            if (car.matches(card)) {
                siege0.removeChild(siege0.children[i]);
                break;
            }
        }
    }
    else {
        for (let i = 2; i < 15; i++) {
            let siege = document.getElementById('siege' + i);
            if (game._currentPlayer._pos == siege.dataset.pos) {
                console.log("C'est le siége " + i);
                siege.removeChild(siege.children[0]);
            }
        }
        game.play(card);

        console.log(game._currentPlayer._pos, siege0.dataset.pos);
    }
});

function centralizeEvents(Message, value, color) {
    if (siege0.dataset.pos == game._currentPlayer._pos) {
        switch (Message) {
            case "clickcardEvent":
                console.log("Je suis le joueur ", siege0.dataset.pos, ", le joueur " + game._currentPlayer._pos + " viens de jouer");
                console.log(game);
                game.play(new Card(value, color));
                console.log(game);
                socket.emit('PlayedEvent', new Card(value, color), game._currentPlayer._pos); //TEMPORAIRE
                break;
            case "CardDenyEvent": // Message.currentPlayer
                break;
            case "GameEndEvent": // Message.currentPlayer & Message.price
                break;
            case "DrawEvent": // Message.drawPlayer & Message.cards
                break;
        }
    }
};




//Choix couleur après +4 ou changement couleur
$('.color').click((e) => {
    game._discardedCard.color = Color[e.target.dataset.color.toUpperCase()];
    //console log de la nouvelle couleur
    console.log(game._discardedCard);
    //envoyer l'event aux autres
})


function chooseColor(color) {

}

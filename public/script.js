//variable stocke la game
let game;
let playersPseudo = [];

const Color = {
    RED: 1,
    BLUE: 2,
    GREEN: 3,
    YELLOW: 4,
}

const colors = [
    Color.RED,
    Color.BLUE,
    Color.GREEN,
    Color.YELLOW
];

const Value = {
    ZERO: 0,
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
    SEVEN: 7,
    EIGHT: 8,
    NINE: 9,
    DRAW_TWO: 10,
    REVERSE: 11,
    SKIP: 12,
    WILD: 13,
    WILD_DRAW_FOUR: 14,
    DECKEPTION: 15,
};

const values = [
    Value.ZERO,
    Value.ONE,
    Value.TWO,
    Value.THREE,
    Value.FOUR,
    Value.FIVE,
    Value.SIX,
    Value.SEVEN,
    Value.EIGHT,
    Value.NINE,
    Value.DRAW_TWO,
    Value.REVERSE,
    Value.SKIP,
    Value.WILD,
    Value.WILD_DRAW_FOUR,
    Value.DECKEPTION,
];
//variables pour echanger les valeurs en couleur ou valeur
let colKeys = Object.keys(Color);
let colVal = Object.values(Color);
let valKeys = Object.keys(Value);
let valVal = Object.values(Value);
let convertValue = {
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
    if (size > 1 && size < 9) {
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
    game = $.extend(true, Object.create(Object.getPrototypeOf(new Game())), session.game);
    //recursively create prototype of
    for (var property in game) {
        switch (property) {
            case '_currentPlayer':
                game[property] = $.extend(true, Object.create(Object.getPrototypeOf(new Player())), session.game._currentPlayer);
                break;
            case '_players':
                let x = game[property].map((e, i) => {
                    return $.extend(true, Object.create(Object.getPrototypeOf(new Player())), session.game._players[i]);
                })
                game[property] = x
                break;
            case 'drawPile':
                game[property] = $.extend(true, Object.create(Object.getPrototypeOf(new Deck())), session.game.drawPile)
                break;
        }
    }
    do {
        game.candraw();
    } while (!game._currentPlayer.hasPlayable(game._discardedCard));
    let placement = session.pos;
    playersPseudo = session.pos;
    for (var player in placement) {
        if (mypseudo == placement[player]) {
            let numberOfPlayers = session.players.length;
            document.getElementById('siege0').dataset.pos = player;
            document.getElementById('siege0').dataset.pseudo = mypseudo;
            //placement de la carte du haut de pile
            let discarded = document.createElement('img');
            discarded.src = "img/card/" + colKeys[colVal.indexOf(session.discardedCard._color)] + '_' + ((Object.keys(convertValue).includes(valKeys[valVal.indexOf(session.discardedCard._value)])) ? convertValue[valKeys[valVal.indexOf(session.discardedCard._value)]] : valKeys[valVal.indexOf(session.discardedCard._value)]) + ".png";
            discarded.src = discarded.src.toLowerCase();
            discarded.id = "discard";
            if (document.getElementById('discardedCard').children.length) document.getElementById('discardedCard').removeChild(document.getElementById('discardedCard').lastElementChild);
            document.getElementById('discardedCard').append(discarded);
            //placer joueur principal ett ses cartes
            document.getElementById('siege0').innerHTML = "";
            session.players[player].hand.map(e => {
                let src = "img/card/" + colKeys[colVal.indexOf(e._color)] + '_' + ((Object.keys(convertValue).includes(valKeys[valVal.indexOf(e._value)])) ? convertValue[valKeys[valVal.indexOf(e._value)]] : valKeys[valVal.indexOf(e._value)]) + ".png";
                let img = document.createElement('img');
                img.src = src.toLowerCase();
                img.dataset.attr = e._color + ',' + e._value;
                document.getElementById('siege0').append(img);
                img.addEventListener("click", function () { centralizeEvents("clickcardEvent", e._value, e._color, null); });
            })


            //placer autres joueurs
            let siegeIndex = 1;
            for (let i = 1; i < numberOfPlayers; i++) {
                let actualPlayer;
                let placed = false;
                if (numberOfPlayers == 2) {
                    actualPlayer = 1 - player;
                } else {
                    actualPlayer = (+player + i) % numberOfPlayers;
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
                        let p = document.createElement('p');
                        p.textContent = placement[actualPlayer];
                        document.getElementById('siege' + siegeIndex).dataset.pseudo = placement[actualPlayer];
                        document.getElementById('siege' + siegeIndex).dataset.pos = actualPlayer;
                        for (let x = 0; x < session.players[actualPlayer].hand.length; x++) {
                            let img = document.createElement('img');
                            img.src = "img/Card/default_back.png".toLowerCase();
                            document.getElementById('siege' + siegeIndex).append(img);
                        }
                        document.getElementById('siege' + siegeIndex).append(p);
                        //placed passe true
                        placed = true;
                    }
                }
            }
        }
    }
    let currentPseudo;
    game._players.map(e => {
        let pos = e._pos;
        for (let i = 0; i < 15;) {
            let div = document.getElementById('siege' + i);
            //si la main que je regarde est dans cette div
            if (div.dataset.pos == pos) {
                //je check si le nombre de cartes est similaire
                if (div.children.length != e.hand.length) {
                    //je vide les cartes du joueur déphasé
                    div.innerHTML = "";
                    //tentative de sort au dernier moment (après pioche)
                    let m = e.hand.slice();
                    m.sort((a, b) => {
                        return ((((+a._value) + (+a._color) * 15) > ((+b._color) * 15 + (+b._value))) ? 1 : -1);
                    });
                    m.map(y => {
                        //creer une variable image
                        let img = document.createElement('img')
                        //prendre la combinaison value color pour aller chercher la bonne carte cf : le ternaire de fou
                        img.src = i == 0 ? ("img/card/" + colKeys[colVal.indexOf(y._color)] + '_' + ((Object.keys(convertValue).includes(valKeys[valVal.indexOf(y._value)])) ? convertValue[valKeys[valVal.indexOf(y._value)]] : valKeys[valVal.indexOf(y._value)]) + ".png") : "img/Card/default_back.png";
                        //append à div mon img
                        img.src= img.src.toLowerCase();
                        img.dataset.attr = y._color + ',' + y._value;
                        if (i == 0) {
                            img.addEventListener("click", function () { centralizeEvents("clickcardEvent", y._value, y._color, null); });
                            if (e.hand.length > 10)
                                img.style.height = '20' - (e.hand.length - 10) + 'vh';
                        }
                        div.append(img);
                    })
                    //je redonne les cartes;
                    let p = document.createElement('p');
                    p.textContent = div.dataset.pseudo
                    if (i != 0) div.append(p);
                }
            }
            if (i == 0) i += 2
            else i++
        }
    });

    let p = document.createElement('p');
    p.textContent = "C'est au tour de " + playersPseudo[game._currentPlayer._pos];
    document.getElementById('discardedCard').append(p);
})

socket.on('PlayedEvent', (card, current, previousPos) => {
    let siege0 = document.getElementById('siege0');
    if (previousPos == siege0.dataset.pos) {
        for (let i = 0; i < Object.keys(game._currentPlayer.hand).length; i++) {
            let car = new Card(siege0.children[i].dataset.attr.split(',')[1], siege0.children[i].dataset.attr.split(',')[0]);
            if (car.is(card.value, card.color) && (card.value == game._discardedCard._value && card.color == game._discardedCard._color)) {
                siege0.removeChild(siege0.children[i]);
                break;
            }
        }
    }
    else {
        for (let i = 2; i < 15; i++) {
            let siege = document.getElementById('siege' + i);
            if (previousPos == siege.dataset.pos) {
                siege.style.border = "none";
                siege.removeChild(siege.children[0]);
            }
        }
        game.play(new Card(card.value, card.color));
    }
    let currentPseudo;
    game._players.map(e => {
        let pos = e._pos;
        for (let i = 0; i < 15;) {
            let div = document.getElementById('siege' + i);
            //si la main que je regarde est dans cette div
            if (div.dataset.pos == pos) {
                //je check si le nombre de cartes est similaire
                if ((div.children.length != e.hand.length && i==0) || (div.children.length-1 != e.hand.length && i!=0)) {
                    //je vide les cartes du joueur déphasé
                    div.innerHTML = "";
                    //tentative de sort au dernier moment (après pioche)
                    let m = e.hand.slice();
                    m.sort((a, b) => {
                        return ((((+a._value) + (+a._color) * 15) > ((+b._color) * 15 + (+b._value))) ? 1 : -1);
                    });
                    m.map(y => {
                        //creer une variable image
                        let img = document.createElement('img')
                        //prendre la combinaison value color pour aller chercher la bonne carte cf : le ternaire de fou
                        img.src = i == 0 ? ("img/card/" + colKeys[colVal.indexOf(y._color)] + '_' + ((Object.keys(convertValue).includes(valKeys[valVal.indexOf(y._value)])) ? convertValue[valKeys[valVal.indexOf(y._value)]] : valKeys[valVal.indexOf(y._value)]) + ".png") : "img/Card/default_back.png";
                        //append à div mon img
                        img.src = img.src.toLowerCase() ;
                        img.dataset.attr = y._color + ',' + y._value;
                        if (i == 0) {
                            img.addEventListener("click", function () { centralizeEvents("clickcardEvent", y._value, y._color, null); });
                            if (e.hand.length > 10)
                            img.style.height = '20' - (e.hand.length - 10) + 'vh';
                        }
                        div.append(img);
                    })
                    //je redonne les cartes;
                    let p = document.createElement('p');
                    p.textContent = div.dataset.pseudo
                    if (i != 0) div.append(p);
                }
            }
            if (div.dataset.pos == game.currentPlayer._pos) currentPseudo = div.dataset.pseudo;
            if (!e.hand.length && pos == div.dataset.pos) document.getElementById('popupContainer').innerHTML = "<p><b>" + div.dataset.pseudo + "</b> gagne la partie !</p>"
            if (i == 0) i += 2
            else i++
        }
        //uno event ? (si carte != changement couleur ou +4 )
        if (e.hand.length == 1 && ![13, 14].includes(card.value) && e._pos == previousPos) {
            if (document.getElementById('siege0').dataset.pos == e._pos) {
                //bouton uno pour le joueur concerné
                let img = document.createElement('img');
                img.src = "img/uno.png";
                img.addEventListener('click', () => {
                    socket.emit('uno', 'uno');
                })
                document.getElementById('unoDiv0').append(img);
            } else {
                let i = Math.floor(Math.random() * Math.floor(8));
                let img = document.createElement('img');
                img.src = "img/contreUno.png";
                let target = e._pos;
                img.addEventListener('click', () => {
                    socket.emit('uno', 'contreuno', target);
                })
                document.getElementById('unoDiv' + i).append(img);
            }
        }
        //Fin de partie
        if (!e.hand.length) $('#popup').modal('show');

    });

    if (card.value == game._discardedCard._value && card.color == game._discardedCard._color)
        document.getElementById('discard').src = ("img/card/" + colKeys[colVal.indexOf(card.color)] + '_' +
            ((Object.keys(convertValue).includes(valKeys[valVal.indexOf(card.value)])) ?
                convertValue[valKeys[valVal.indexOf(card.value)]] :
                valKeys[valVal.indexOf(card.value)]) + ".png").toLowerCase();

    let p = document.createElement('p');
    p.textContent = "C'est au tour de " + currentPseudo;
    document.getElementById('discardedCard').removeChild(document.getElementById('discardedCard').lastChild);
    document.getElementById('discardedCard').append(p);

});

function centralizeEvents(Message, value, color, player) {
    siege0.style.border = "none";
    if (siege0.dataset.pos == game._currentPlayer._pos) {
        switch (Message) {
            case "clickcardEvent":
                let previousPos = game._currentPlayer._pos;
                game.play(new Card(value, color));
                socket.emit('PlayedEvent', { value: value, color: color }, game._currentPlayer._pos, previousPos); //TEMPORAIRE
                break;
        }
    }
};

//Choix couleur après +4 ou changement couleur
$('.color').click((e) => {
    game._discardedCard.color = Color[e.target.dataset.color.toUpperCase()];
    socket.emit('Change Color', game._discardedCard.color, document.getElementById('siege0').dataset.pos);
})

socket.on('Change Color', (color, previousPos) => {
    let currentPseudo;
    game._discardedCard.color = color;
    document.getElementById('discard').src = document.getElementById('discard').src.replace('undefined', colKeys[colVal.indexOf(color)]).toLowerCase();
    game.choice = 1;
    game.goToNextPlayer();
    game.round++;
    game._players.map(e => {
        let pos = e._pos;
        for (let i = 0; i < 15;) {
            let div = document.getElementById('siege' + i);
            //si la main que je regarde est dans cette div
            if (div.dataset.pos == pos) {
                //je check si le nombre de cartes est similaire
                if (div.children.length != e.hand.length) {
                    //je vide les cartes du joueur déphasé
                    div.innerHTML = "";
                    e.hand.map(y => {
                        //creer une variable image

                        let img = document.createElement('img')
                        //prendre la combinaison value color pour aller chercher la bonne carte cf : le ternaire de fou
                        img.src = i == 0 ? ("img/card/" + colKeys[colVal.indexOf(y._color)] + '_' + ((Object.keys(convertValue).includes(valKeys[valVal.indexOf(y._value)])) ? convertValue[valKeys[valVal.indexOf(y._value)]] : valKeys[valVal.indexOf(y._value)]) + ".png") : "img/Card/default_back.png";
                        //append à div mon img
                        img.src = img.src.toLowerCase();
                        img.dataset.attr = y._color + ',' + y._value;
                        if (i == 0) img.addEventListener("click", function () { centralizeEvents("clickcardEvent", y._value, y._color, null); });
                        div.append(img);
                    })
                    //je redonne les cartes;
                }
            }
            //uno event ? (si carte == changement couleur ou +4 )

            if (div.dataset.pos == game.currentPlayer._pos) currentPseudo = div.dataset.pseudo;
            if (i == 0) i += 2
            else i++;
        }
        if (e.hand.length == 1 && e._pos == previousPos) {
            if (document.getElementById('siege0').dataset.pos == e._pos) {
                //bouton uno pour le joueur concerné
                let img = document.createElement('img');
                img.src = "img/uno.png";
                img.addEventListener('click', () => {
                    socket.emit('uno', 'uno');
                })
                document.getElementById('unoDiv0').append(img);
            } else {
                let i = Math.floor(Math.random() * Math.floor(8));
                let img = document.createElement('img');
                img.src = "img/contreUno.png";
                let target = e._pos;
                img.addEventListener('click', () => {
                    socket.emit('uno', 'contreuno', target);
                })
                document.getElementById('unoDiv' + i).append(img);
            }
        }
    })


    //check le nombre de cartes de chaque main pour verifier uno

    let p = document.createElement('p');
    p.textContent = "C'est au tour de " + currentPseudo;
    document.getElementById('discardedCard').removeChild(document.getElementById('discardedCard').lastChild);
    document.getElementById('discardedCard').append(p);
});


socket.on('uno', (type, pos) => {
    for (let i = 0; i < 8; i++) {
        document.getElementById('unoDiv' + i).innerHTML = "";
    }
    if (type == 'contreuno') {
        game.uno(pos);
        let currentPseudo;
        game._players.map(e => {
            let pos = e._pos;
            for (let i = 0; i < 15;) {
                let div = document.getElementById('siege' + i);
                //si la main que je regarde est dans cette div
                if (div.dataset.pos == pos) {
                    //je check si le nombre de cartes est similaire
                    if (div.children.length != e.hand.length) {
                        //je vide les cartes du joueur déphasé
                        div.innerHTML = "";
                        e.hand.map(y => {
                            //creer une variable image
                            let img = document.createElement('img')
                            //prendre la combinaison value color pour aller chercher la bonne carte cf : le ternaire de fou
                            img.src = i == 0 ? ("img/card/" + colKeys[colVal.indexOf(y._color)] + '_' + ((Object.keys(convertValue).includes(valKeys[valVal.indexOf(y._value)])) ? convertValue[valKeys[valVal.indexOf(y._value)]] : valKeys[valVal.indexOf(y._value)]) + ".png") : "img/Card/default_back.png";
                            //append à div mon img
                            img.src = img.src.toLowerCase();
                            img.dataset.attr = y._color + ',' + y._value;
                            if (i == 0) img.addEventListener("click", function () { centralizeEvents("clickcardEvent", y._value, y._color, null); });
                            div.append(img);
                        })
                        //je redonne les cartes;
                        if (div.dataset.pos && i != 0) currentPseudo = div.dataset.pseudo;
                        if (i != 0) {
                            let p = document.createElement('p');
                            p.textContent = currentPseudo
                            div.append(p);
                        }
                    }
                }
                //uno event ? (si carte == changement couleur ou +4 )


                if (i == 0) i += 2
                else i++;
            }

        })
    }
})


socket.on('disconnected', (pos) => {

    let currentPseudo;
    game.playerLeave(pos);

    for (var i = 0; i < 15;) {
        let div = document.getElementById('siege' + i).dataset.pos;
        if (div > pos) {
            document.getElementById('siege' + i).dataset.pos = div - 1
        } else if (div == pos) {
            document.getElementById('siege' + i).dataset.pos = "-9999999"
        }
        if (i == 0) i += 2;
        else i++;
    }
    for (var i = 0; i < 15;) {
        let div = document.getElementById('siege' + i).dataset.pos;
        if (div == game.currentPlayer._pos) currentPseudo = document.getElementById('siege' + i).dataset.pseudo;
        if (i == 0) i += 2;
        else i++;
    }

    let p = document.createElement('p');
    p.textContent = "C'est au tour de " + currentPseudo;
    document.getElementById('discardedCard').removeChild(document.getElementById('discardedCard').lastChild);
    document.getElementById('discardedCard').append(p);
})
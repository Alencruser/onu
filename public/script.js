//variable stocke la game
let game;
let playersPseudo = [];
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
    game = $.extend(true, Object.create(Object.getPrototypeOf(new Game())), session.game);
    console.log('session game avant clone property', session.game);
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
    let placement = session.pos;
    playersPseudo = session.pos;
    console.log(playersPseudo);
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
                img.addEventListener("click", function () { centralizeEvents("clickcardEvent", e._value, e._color, null); });
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
    game._players.map(e=>{
        let pos = e._pos;
        for(i=0;i<15;){
            let div = document.getElementById('siege'+i);
            //si la main que je regarde est dans cette div
            
            if(div.dataset.pos == game._currentPlayer._pos){
                div.style.border = "2px solid black";

            }
            if(i==0)i+=2
            else i++
        }
    });
    console.log(session);
})

socket.on('PlayedEvent', (card, current, previousPos) => {
    document.getElementById('discard').src = "img/card/" + colKeys[colVal.indexOf(card.color)] + '_' +
        ((Object.keys(convertValue).includes(valKeys[valVal.indexOf(card.value)])) ?
            convertValue[valKeys[valVal.indexOf(card.value)]] :
            valKeys[valVal.indexOf(card.value)]) + ".png";
    let siege0 = document.getElementById('siege0');
    console.log(current, game._currentPlayer._pos, document.getElementById('siege0').dataset.pos);
    if (previousPos == siege0.dataset.pos) {
        for (let i = 0; i < Object.keys(game._currentPlayer.hand).length; i++) {
            console.log('i au moment suppress',i);
            console.log('le siege 0',siege0);
            console.log('les children de i')
            let car = new Card(siege0.children[i].dataset.attr.split(',')[1], siege0.children[i].dataset.attr.split(',')[0]);
            if (car.is(card.value, card.color)) {
                siege0.removeChild(siege0.children[i]);
                break;
            }
        }
        //série de if elseif pour check, card deny, game ended, draw
        
        //aller check toutes les mains de players et toutes les images socket associées
    }
    else {
        for (let i = 2; i < 15; i++) {
            let siege = document.getElementById('siege' + i);
            if (previousPos == siege.dataset.pos) {
                
                siege.style.border = "none";
    
                
                console.log("C'est le siége " + i);
                siege.removeChild(siege.children[0]);
            }
        }
        //let currentpos = game._currentPlayer._pos;
        game.play(new Card(card.value, card.color));


        //série de if pour check les events
        //if currenttplayer pos == siege0 pos
        //else
        //meme traitement, check toutes les players hand et les socket img
            


    }
    console.log(game);

    console.log('game après la modif de ttous les joueurs',game);

    game._players.map(e=>{
        let pos = e._pos;
        for(i=0;i<15;){
            let div = document.getElementById('siege'+i);
            //si la main que je regarde est dans cette div
            
            if(div.dataset.pos == pos){
                console.log(' le joueur pos : '+pos+' est au siege '+i);
                //je check si le nombre de cartes est similaire
                if(div.children.length != e.hand.length){
                    console.log('le joueur '+ pos +' a : '+e.hand.length+' et moi jai x images : '+div.children.length);
                    //je vide les cartes du joueur déphasé
                    div.innerHTML = "";
                    e.hand.map(y=>{
                        //creer une variable image
                        let img = document.createElement('img')
                        //prendre la combinaison value color pour aller chercher la bonne carte cf : le ternaire de fou
                        img.src = i==0?("img/card/" + colKeys[colVal.indexOf(y._color)] + '_' + ((Object.keys(convertValue).includes(valKeys[valVal.indexOf(y._value)])) ? convertValue[valKeys[valVal.indexOf(y._value)]] : valKeys[valVal.indexOf(y._value)]) + ".png"):"img/Card/default_back.png";
                        //append à div mon img
                        img.dataset.attr = y._color + ',' + y._value;
                        if(i==0)img.addEventListener("click", function () { centralizeEvents("clickcardEvent", y._value, y._color, null); });
                        div.append(img);
                    })
                    //je redonne les cartes;
                }

            }
            if(div.dataset.pos == game._currentPlayer._pos){
                div.style.border = "2px solid black";

            }
            if(i==0)i+=2
            else i++
        }
    });

    

});

function centralizeEvents(Message, value, color, player) {
    siege0.style.border = "none";
    if (siege0.dataset.pos == game._currentPlayer._pos) {
        switch (Message) {
            case "clickcardEvent":
                let previousPos = game._currentPlayer._pos;
                console.log("Je suis le joueur ", siege0.dataset.pos, ", le joueur " + game._currentPlayer._pos + " viens de jouer");
                game.play(new Card(value, color));
                console.log('game après play coté joueur qui a joué', game);
                socket.emit('PlayedEvent', { value: value, color: color }, game._currentPlayer._pos, previousPos); //TEMPORAIRE
                break;
        }
    }
};

//Choix couleur après +4 ou changement couleur
$('.color').click((e) => {
    game._discardedCard.color = Color[e.target.dataset.color.toUpperCase()];
    //console log de la nouvelle couleur
  //  console.log(game._discardedCard);
   // envoyer l'event aux autres
    socket.emit('Change Color', game._discardedCard.color);
})

socket.on('Change Color', (color) => {
    game._discardedCard.color = color;
    game.choice = 1;
    game._players.map(e=>{
        let pos = e._pos;
        for(i=0;i<15;){
            let div = document.getElementById('siege'+i);
            //si la main que je regarde est dans cette div
            if(div.dataset.pos == game._currentPlayer._pos){
                div.style.border = "2px solid black";

            }
            if(i==0)i+=2
            else i++
        }
    });
    game.goToNextPlayer();
    game.round++;
    console.log(game);


    game._players.map(e=>{
        let pos = e._pos;
        for(i=0;i<15;){
            let div = document.getElementById('siege'+i);
            //si la main que je regarde est dans cette div
            if(div.dataset.pos == pos){
                console.log(' le joueur pos : '+pos+' est au siege '+i);
                //je check si le nombre de cartes est similaire
                if(div.children.length != e.hand.length){
                    console.log('le joueur '+ pos +' a : '+e.hand.length+' et moi jai x images : '+div.children.length);
                    //je vide les cartes du joueur déphasé
                    div.innerHTML = "";
                    e.hand.map(y=>{
                        //creer une variable image
                        let img = document.createElement('img')
                        //prendre la combinaison value color pour aller chercher la bonne carte cf : le ternaire de fou
                        img.src = i==0?("img/card/" + colKeys[colVal.indexOf(y._color)] + '_' + ((Object.keys(convertValue).includes(valKeys[valVal.indexOf(y._value)])) ? convertValue[valKeys[valVal.indexOf(y._value)]] : valKeys[valVal.indexOf(y._value)]) + ".png"):"img/Card/default_back.png";
                        //append à div mon img
                        img.dataset.attr = y._color + ',' + y._value;
                        if(i==0)img.addEventListener("click", function () { centralizeEvents("clickcardEvent", y._value, y._color, null); });
                        div.append(img);
                    })
                    //je redonne les cartes;
                }

            }
            if(div.dataset.pos == game._currentPlayer._pos){
                div.style.border = "2px solid black";

            }
            if(i==0)i+=2
            else i++;
        }
    })



});

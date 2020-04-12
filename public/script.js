//variable stocke la game
let game;

//variables pour echanger les valeurs en couleur ou valeur
let colKeys = Object.keys(Color),
    colVal = Object.values(Color),
    valKeys = Object.keys(Value),
    valVal = Object.values(Value),
    convertValue = {
        ZERO:0,
        ONE:1,
        TWO:2,
        THREE:3,
        FOUR:4,
        FIVE:5,
        SIX:6,
        SEVEN:7,
        EIGHT:8,
        NINE:9
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
    socket.emit('setup', { players: game._players, discardedCard: game._discardedCard, currentPlayer: game._currentPlayer })
});

socket.on('setup', (session) => {
    let placement = session.pos;
    for (var player in placement) {
        if (mypseudo == placement[player]) {
            let numberOfPlayers = session.players.length;
            //placement de la carte du haut de pile
            let discarded = document.createElement('img');
            discarded.src= "img/card/"+colKeys[colVal.indexOf(session.discardedCard._color)]+'_'+ ((Object.keys(convertValue).includes(valKeys[valVal.indexOf(session.discardedCard._value)]))?convertValue[valKeys[valVal.indexOf(session.discardedCard._value)]]:valKeys[valVal.indexOf(session.discardedCard._value)] )+".png";
            if(document.getElementById('discardedCard').children.length)document.getElementById('discardedCard').removeChild(document.getElementById('discardedCard').lastElementChild);
            document.getElementById('discardedCard').append(discarded);
            //placer joueur principal ett ses cartes
            document.getElementById('siege0').innerHTML="";
            session.players[player].hand.map(e=>{
                let src = "img/card/"+ colKeys[colVal.indexOf(e._color)]+'_'+ ((Object.keys(convertValue).includes(valKeys[valVal.indexOf(e._value)]))?convertValue[valKeys[valVal.indexOf(e._value)]]:valKeys[valVal.indexOf(e._value)] )+".png";
                let img = document.createElement('img');
                img.src=src;
                img.dataset.attr = e._color+','+e._value;
                document.getElementById('siege0').append(img);
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
                while(!placed){
                    siegeIndex++;
                    console.log(document.getElementById('siege'+siegeIndex).dataset.socket);
                    let siege =  document.getElementById('siege'+siegeIndex).dataset.socket;
                    let permit = []
                    if(siege.includes(','))permit = siege.split(',');
                    else permit.push(siege);

                    if(permit.includes(numberOfPlayers.toString())){
                        //assigner la place au siege
                        document.getElementById('siege'+siegeIndex).textContent = placement[actualPlayer]+': Cartes en mains : '+ session.players[actualPlayer].hand.length;
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
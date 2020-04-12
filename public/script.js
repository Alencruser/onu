//variable stocke la game
let game;

//variables pour echanger les valeurs en couleur ou valeur
let colKeys = Object.keys(Color),
    colVal = Object.values(Color),
    valKeys = Object.keys(Value),
    valVal = Object.values(Value);

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
            discarded.src= colKeys[colVal.indexOf(session.discardedCard._color)]+'_'+ valKeys[valVal.indexOf(session.discardedCard._value)] +".png"
            document.getElementById('discardedCard').append();
            //placer joueur principal
            document.getElementById('siege0').textContent = mypseudo + ': Cartes en mains : ' + session.players[player].hand.length;
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
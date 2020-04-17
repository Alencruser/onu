"use strict";var game,playersPseudo=[],Color={RED:1,BLUE:2,GREEN:3,YELLOW:4},colors=[Color.RED,Color.BLUE,Color.GREEN,Color.YELLOW],Value={ZERO:0,ONE:1,TWO:2,THREE:3,FOUR:4,FIVE:5,SIX:6,SEVEN:7,EIGHT:8,NINE:9,DRAW_TWO:10,REVERSE:11,SKIP:12,WILD:13,WILD_DRAW_FOUR:14,DECKEPTION:15},values=[Value.ZERO,Value.ONE,Value.TWO,Value.THREE,Value.FOUR,Value.FIVE,Value.SIX,Value.SEVEN,Value.EIGHT,Value.NINE,Value.DRAW_TWO,Value.REVERSE,Value.SKIP,Value.WILD,Value.WILD_DRAW_FOUR,Value.DECKEPTION],colKeys=Object.keys(Color),colVal=Object.values(Color),valKeys=Object.keys(Value),valVal=Object.values(Value),convertValue={ZERO:0,ONE:1,TWO:2,THREE:3,FOUR:4,FIVE:5,SIX:6,SEVEN:7,EIGHT:8,NINE:9};function launchCustom(){socket.emit("group size",0)}function centralizeEvents(e,a,t,n){if(siege0.style.border="none",siege0.dataset.pos==game._currentPlayer._pos)switch(e){case"clickcardEvent":var o=game._currentPlayer._pos;game.play(new Card(a,t)),socket.emit("PlayedEvent",{value:a,color:t},game._currentPlayer._pos,o)}}socket.on("group size",function(e,a,t){if(1<e){var n=document.createElement("form");n.action="/room",n.method="POST";var o=document.createElement("input");o.name="groupSize",o.value=e;var l=document.createElement("input");l.name="groupPrice",l.value=t;var d=document.createElement("input");d.name="id",d.value=a,n.append(o),n.append(l),n.append(d),document.body.append(n),n.submit(),n.style.display="none"}}),socket.on("you are the host",function(e,a){game=new Game(e,a),socket.emit("setup",{players:game._players,discardedCard:game._discardedCard,currentPlayer:game._currentPlayer,game:game})}),socket.on("setup",function(t){for(var e in game=$.extend(!0,Object.create(Object.getPrototypeOf(new Game)),t.game))switch(e){case"_currentPlayer":game[e]=$.extend(!0,Object.create(Object.getPrototypeOf(new Player)),t.game._currentPlayer);break;case"_players":var a=game[e].map(function(e,a){return $.extend(!0,Object.create(Object.getPrototypeOf(new Player)),t.game._players[a])});game[e]=a;break;case"drawPile":game[e]=$.extend(!0,Object.create(Object.getPrototypeOf(new Deck)),t.game.drawPile)}for(;game.candraw(),!game._currentPlayer.hasPlayable(game._discardedCard););console.log(game);var n=t.pos;for(var o in playersPseudo=t.pos,n)if(mypseudo==n[o]){var l=t.players.length;document.getElementById("siege0").dataset.pos=o,document.getElementById("siege0").dataset.pseudo=mypseudo;var d=document.createElement("img");d.src="img/card/"+colKeys[colVal.indexOf(t.discardedCard._color)]+"_"+(Object.keys(convertValue).includes(valKeys[valVal.indexOf(t.discardedCard._value)])?convertValue[valKeys[valVal.indexOf(t.discardedCard._value)]]:valKeys[valVal.indexOf(t.discardedCard._value)])+".png",d.src=d.src.toLowerCase(),d.id="discard",document.getElementById("discardedCard").children.length&&document.getElementById("discardedCard").removeChild(document.getElementById("discardedCard").lastElementChild),document.getElementById("discardedCard").append(d),document.getElementById("siege0").innerHTML="",t.players[o].hand.map(function(e){var a="img/card/"+colKeys[colVal.indexOf(e._color)]+"_"+(Object.keys(convertValue).includes(valKeys[valVal.indexOf(e._value)])?convertValue[valKeys[valVal.indexOf(e._value)]]:valKeys[valVal.indexOf(e._value)])+".png",t=document.createElement("img");t.src=a.toLowerCase(),t.dataset.attr=e._color+","+e._value,document.getElementById("siege0").append(t),t.addEventListener("click",function(){centralizeEvents("clickcardEvent",e._value,e._color,null)})});for(var r=1,c=1;c<l;c++){var s=void 0,u=!1;for(s=2==l?1-o:(+o+c)%l;!u;){r++;var i=document.getElementById("siege"+r).dataset.socket,m=[];if(i.includes(",")?m=i.split(","):m.push(i),m.includes(l.toString())){var g=document.createElement("p");g.textContent=n[s],document.getElementById("siege"+r).dataset.pseudo=n[s],document.getElementById("siege"+r).dataset.pos=s;for(var v=0;v<t.players[s].hand.length;v++){var p=document.createElement("img");p.src="img/Card/default_back.png".toLowerCase(),document.getElementById("siege"+r).append(p)}document.getElementById("siege"+r).append(g),u=!0}}}}game._players.map(function(o){for(var l=o._pos,e=function(t){var n=document.getElementById("siege"+t);if(n.dataset.pos==l&&n.children.length!=o.hand.length){n.innerHTML="";var e=o.hand.slice();e.sort(function(e,a){return d=t,+e._value+15*e._color>15*a._color+ +a._value?1:-1}),e.map(function(e){var a=document.createElement("img");a.src=0==t?"img/card/"+colKeys[colVal.indexOf(e._color)]+"_"+(Object.keys(convertValue).includes(valKeys[valVal.indexOf(e._value)])?convertValue[valKeys[valVal.indexOf(e._value)]]:valKeys[valVal.indexOf(e._value)])+".png":"img/Card/default_back.png",a.src=a.src.toLowerCase(),a.dataset.attr=e._color+","+e._value,0==t&&(a.addEventListener("click",function(){centralizeEvents("clickcardEvent",e._value,e._color,null)}),10<o.hand.length&&(a.style.height="20"-(o.hand.length-10)+"vh")),n.append(a)});var a=document.createElement("p");a.textContent=n.dataset.pseudo,0!=t&&n.append(a)}0==t?t+=2:t++,d=t},d=0;d<15;)e(d)});var E=document.createElement("p");E.textContent="C'est au tour de "+playersPseudo[game._currentPlayer._pos],document.getElementById("discardedCard").append(E)}),socket.on("PlayedEvent",function(c,e,s){var u,a=document.getElementById("siege0");if(s==a.dataset.pos)for(var t=0;t<Object.keys(game._currentPlayer.hand).length;t++){if(new Card(a.children[t].dataset.attr.split(",")[1],a.children[t].dataset.attr.split(",")[0]).is(c.value,c.color)&&c.value==game._discardedCard._value&&c.color==game._discardedCard._color){a.removeChild(a.children[t]);break}}else{for(var n=2;n<15;n++){var o=document.getElementById("siege"+n);s==o.dataset.pos&&(o.style.border="none",o.removeChild(o.children[0]))}game.play(new Card(c.value,c.color))}console.log("game avant map",game),game._players.map(function(o){for(var l=o._pos,e=function(t){var n=document.getElementById("siege"+t);if(n.dataset.pos==l&&(n.children.length!=o.hand.length&&0==t||n.children.length-1!=o.hand.length&&0!=t)){n.innerHTML="";var e=o.hand.slice();e.sort(function(e,a){return d=t,+e._value+15*e._color>15*a._color+ +a._value?1:-1}),e.map(function(e){var a=document.createElement("img");a.src=0==t?"img/card/"+colKeys[colVal.indexOf(e._color)]+"_"+(Object.keys(convertValue).includes(valKeys[valVal.indexOf(e._value)])?convertValue[valKeys[valVal.indexOf(e._value)]]:valKeys[valVal.indexOf(e._value)])+".png":"img/Card/default_back.png",a.src=a.src.toLowerCase(),a.dataset.attr=e._color+","+e._value,0==t&&(a.addEventListener("click",function(){centralizeEvents("clickcardEvent",e._value,e._color,null)}),10<o.hand.length&&(a.style.height="20"-(o.hand.length-10)+"vh")),n.append(a)}),console.log("playedevent game",game);var a=document.createElement("p");a.textContent=n.dataset.pseudo,0!=t&&n.append(a)}n.dataset.pos==game.currentPlayer._pos&&(u=n.dataset.pseudo),o.hand.length||l!=n.dataset.pos||(document.getElementById("popupContainer").innerHTML="<p><b>"+n.dataset.pseudo+"</b> gagne la partie !</p>"),0==t?t+=2:t++,d=t},d=0;d<15;)e(d);if(1==o.hand.length&&![13,14].includes(c.value)&&o._pos==s)if(console.log("uno event !"),document.getElementById("siege0").dataset.pos==o._pos){console.log("je suis le joueur qui a uno");var a=document.createElement("img");a.src="img/uno.png",a.addEventListener("click",function(){socket.emit("uno","uno")}),document.getElementById("unoDiv0").append(a)}else{console.log("un autre joueur est en uno");var t=Math.floor(Math.random()*Math.floor(8)),n=document.createElement("img");n.src="img/contreUno.png";var r=o._pos;n.addEventListener("click",function(){socket.emit("uno","contreuno",r)}),document.getElementById("unoDiv"+t).append(n)}o.hand.length||$("#popup").modal("show")}),c.value==game._discardedCard._value&&c.color==game._discardedCard._color&&(document.getElementById("discard").src=("img/card/"+colKeys[colVal.indexOf(c.color)]+"_"+(Object.keys(convertValue).includes(valKeys[valVal.indexOf(c.value)])?convertValue[valKeys[valVal.indexOf(c.value)]]:valKeys[valVal.indexOf(c.value)])+".png").toLowerCase());var l=document.createElement("p");l.textContent="C'est au tour de "+u,document.getElementById("discardedCard").removeChild(document.getElementById("discardedCard").lastChild),document.getElementById("discardedCard").append(l)}),$(".color").click(function(e){game._discardedCard.color=Color[e.target.dataset.color.toUpperCase()],socket.emit("Change Color",game._discardedCard.color,document.getElementById("siege0").dataset.pos)}),socket.on("Change Color",function(e,c){var s;game._discardedCard.color=e,document.getElementById("discard").src=document.getElementById("discard").src.replace("undefined",colKeys[colVal.indexOf(e)]).toLowerCase(),game.choice=1,game.goToNextPlayer(),game.round++,game._players.map(function(e){for(var a=e._pos,t=function(t){var n=document.getElementById("siege"+t);n.dataset.pos==a&&n.children.length!=e.hand.length&&(n.innerHTML="",e.hand.map(function(e){console.log("ligne 333 card",e);var a=document.createElement("img");a.src=0==t?"img/card/"+colKeys[colVal.indexOf(e._color)].toLowerCase()+"_"+(Object.keys(convertValue).includes(valKeys[valVal.indexOf(e._value)])?convertValue[valKeys[valVal.indexOf(e._value)]]:valKeys[valVal.indexOf(e._value)])+".png":"img/Card/default_back.png",a.src=a.src.toLowerCase(),a.dataset.attr=e._color+","+e._value,0==t&&a.addEventListener("click",function(){centralizeEvents("clickcardEvent",e._value,e._color,null)}),n.append(a)})),n.dataset.pos==game.currentPlayer._pos&&(s=n.dataset.pseudo),0==t?t+=2:t++,o=t},o=0;o<15;)t(o);if(1==e.hand.length&&e._pos==c)if(console.log("uno event !"),document.getElementById("siege0").dataset.pos==e._pos){console.log("je suis le joueur qui a uno");var n=document.createElement("img");n.src="img/uno.png",n.addEventListener("click",function(){socket.emit("uno","uno")}),document.getElementById("unoDiv0").append(n)}else{console.log("un autre joueur est en uno");var l=Math.floor(Math.random()*Math.floor(8)),d=document.createElement("img");d.src="img/contreUno.png";var r=e._pos;d.addEventListener("click",function(){socket.emit("uno","contreuno",r)}),document.getElementById("unoDiv"+l).append(d)}});var a=document.createElement("p");a.textContent="C'est au tour de "+s,document.getElementById("discardedCard").removeChild(document.getElementById("discardedCard").lastChild),document.getElementById("discardedCard").append(a)}),socket.on("uno",function(e,a){for(var t=0;t<8;t++)document.getElementById("unoDiv"+t).innerHTML="";var d;"contreuno"==e&&(game.uno(a),game._players.map(function(a){for(var o=a._pos,e=function(t){var n=document.getElementById("siege"+t);if(n.dataset.pos==o&&n.children.length!=a.hand.length&&(n.innerHTML="",a.hand.map(function(e){var a=document.createElement("img");a.src=0==t?("img/card/"+colKeys[colVal.indexOf(e._color)]+"_"+(Object.keys(convertValue).includes(valKeys[valVal.indexOf(e._value)])?convertValue[valKeys[valVal.indexOf(e._value)]]:valKeys[valVal.indexOf(e._value)])+".png").toLowerCase():"img/Card/default_back.png".toLowerCase(),a.src=a.src.toLowerCase(),a.dataset.attr=e._color+","+e._value,0==t&&a.addEventListener("click",function(){centralizeEvents("clickcardEvent",e._value,e._color,null)}),n.append(a)}),n.dataset.pos&&0!=t&&(d=n.dataset.pseudo),0!=t)){var e=document.createElement("p");e.textContent=d,n.append(e)}0==t?t+=2:t++,l=t},l=0;l<15;)e(l)}))}),socket.on("disconnected",function(e){var a;game.playerLeave(e);for(var t=0;t<15;){var n=document.getElementById("siege"+t).dataset.pos;e<n?document.getElementById("siege"+t).dataset.pos=n-1:n==e&&(document.getElementById("siege"+t).dataset.pos="-9999999"),0==t?t+=2:t++}for(t=0;t<15;){document.getElementById("siege"+t).dataset.pos==game.currentPlayer._pos&&(a=document.getElementById("siege"+t).dataset.pseudo),0==t?t+=2:t++}var o=document.createElement("p");o.textContent="C'est au tour de "+a,document.getElementById("discardedCard").removeChild(document.getElementById("discardedCard").lastChild),document.getElementById("discardedCard").append(o)});
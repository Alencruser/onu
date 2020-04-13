const CARDS_PER_PLAYER = 7;
const NUMBER_OF_DRAW_TWO = 2;
const NUMBER_OF_REVERSE = 2;
const NUMBER_OF_SKIP = 2;
const NUMBER_OF_WILD = 4;
const NUMBER_OF_WILD_DRAW_FOUR = 4;

Color = {
    RED: 1,
    BLUE: 2,
    GREEN: 3,
    YELLOW: 4,
}

colors = [
    Color.RED,
    Color.BLUE,
    Color.GREEN,
    Color.YELLOW
];

Value = {
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

values = [
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

function isWild(value) {
    return value === Value.WILD || value === Value.WILD_DRAW_FOUR;
}

GameDirection = {
    CLOCKWISE: 1,
    COUNTER_CLOCKWISE: 2,
};

class Card {
    constructor(value, color = null) {
        this.color = color;
        this.value = value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    get color() {
        return this._color;
    }

    set color(color) {
        this._color = color;
    }

    isWildCard() {
        return isWild(this.value);
    }

    isSpecialCard() {
        return (
            this.isWildCard() ||
            this.value === Value.DRAW_TWO ||
            this.value === Value.REVERSE ||
            this.value === Value.SKIP
        );
    }

    matches(other) {
        if (this.isWildCard()) return true;
        return other._value == this.value || other._color == this.color;
    }

    is(value, color = null) {
        let matches = this.value === value;
        if (color) matches = matches && this.color === color;
        return matches;
    }
}

function createUnoDeck() {
    /*
      108 cards
      76x numbers (0-9, all colors)
      8x draw two (2x each color)
      8x reverse (2x each color)
      8x skip (2x each color)
      4x wild
      4x wild draw four
    */

    const deck = [];

    const createCards = (qty, value, color = null) => {
        const cards = [];

        for (let i = 0; i < qty; i++) cards.push(new Card(value, color));

        return cards;
    };

    colors.forEach((color) => {
        deck.push.apply(deck, createCards(1, Value.ZERO, color));
        for (let n = Value.ONE; n <= Value.NINE; n++) {
            deck.push.apply(deck, createCards(2, n, color));
        }

        deck.push.apply(deck, createCards(NUMBER_OF_DRAW_TWO, Value.DRAW_TWO, color));
        deck.push.apply(deck, createCards(NUMBER_OF_SKIP, Value.SKIP, color));
        deck.push.apply(deck, createCards(NUMBER_OF_REVERSE, Value.REVERSE, color));
    });

    deck.push.apply(deck, createCards(NUMBER_OF_WILD, Value.WILD));
    deck.push.apply(deck, createCards(NUMBER_OF_WILD_DRAW_FOUR, Value.WILD_DRAW_FOUR));

    return deck;
}

class Deck {

    drawpile = [];
    constructor() {
        this.drawpile = createUnoDeck();
        let m = Object.keys(this.drawpile).length, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            [this.drawpile[m], this.drawpile[i]] = [this.drawpile[i], this.drawpile[m]];
        }
        this.drawpile.push(new Card(1, Value.DECKEPTION));
    }

    draw(num = 1) {
        let cards = [];
        let top;
        for (let i = 0; i < num; i++) {
            if (this.drawpile[0].value == Value.DECKEPTION) {
                this.drawpile.shift();
                let m = this.size(), i;
                while (m) {
                    i = Math.floor(Math.random() * m--);
                    [this.drawpile[m], this.drawpile[i]] = [this.drawpile[i], this.drawpile[m]];
                }
                this.drawpile.push(new Card(1, Value.DECKEPTION));
            }
            top = this.drawpile[0];
            this.drawpile.shift()
            cards.push(top);
        }
        return cards;
    }

    get length() {
        return Object.keys(this.drawpile).length;
    }

}

class Player {
    hand = [];
    _pos;

    constructor(pos) {
        this._pos = pos;
    }

    getCardByValue(value) {
        if (!value) return undefined;

        return this.hand.find((c) => c.value === value);
    }

    hasCard(card) {
        if (!card) return false;

        return this.hand.some(
            (c) => c.value === card.value && c.color === card.color,
        );
    }

    hasPlayable(card) {
        if (!card) return false;

        return this.hand.some(
            (c) => c.value === card.value || c.color === card.color || c.value > 12,
        );
    }

    hasPlayableDodgeDraw(card) {
        if (!card) return false;

        return this.hand.some(
            (c) => c.value === card.value || c.value === Value.WILD_DRAW_FOUR,
        );
    }

    removeCard(card) {
        const i = this.hand.findIndex(
            (c) => c.value === card.value && c.color === card.color,
        );
        this.hand.splice(i, 1);
    }

    get pos() {
        return this._pos;
    }

    get length() {
        return Object.keys(this.hand).length;
    }

}

class Game {
    _price;
    drawPile;
    direction;
    _currentPlayer;
    _discardedCard;
    _players = [];
    hasdrawn = false;
    NUMBER_OF_PLAYER;
    cumulativeamount = 0;

    constructor(NUMBER_OF_PLAYER, price) {
        this.NUMBER_OF_PLAYER = NUMBER_OF_PLAYER;
        this._price = price;
        for (let i = 0; i < NUMBER_OF_PLAYER; i++) {
            this._players.push(new Player(i))
        }
        this.newGame();
    }

    newGame() {
        this.drawPile = new Deck();
        this.direction = GameDirection.CLOCKWISE;
        this._players.forEach(
            (p) => (p.hand = (this.drawPile.draw(CARDS_PER_PLAYER)).sort(function (a, b) { return ((a.value + a.color * 15) < (b.color * 15 + b.value)) ? 1 : -1 })),
        );

        do {
            this._discardedCard = this.drawPile.draw()[0];
            if (this._discardedCard.isSpecialCard()) this.drawPile.drawpile.push(this._discardedCard);
        } while (this._discardedCard.isSpecialCard());
        this._currentPlayer = this._players[
            Math.floor(Math.random() * this._players.length)
        ];
    }

    get currentPlayer() {
        return this._currentPlayer;
    }

    get discardedCard() {
        return this._discardedCard;
    }

    get players() {
        return this._players;
    }

    get nextPlayer() {
        return this.getNextPlayer();
    }

    get deck() {
        return this.drawPile;
    }

    get playingDirection() {
        return this.direction;
    }

    set playingDirection(dir) {
        if (dir !== this.direction) this.reverseGame();
    }

    reverseGame() {
        this.direction =
            this.direction == GameDirection.CLOCKWISE
                ? GameDirection.COUNTER_CLOCKWISE
                : GameDirection.CLOCKWISE;
    }

    getNextPlayer() {
        let idx = this._currentPlayer._pos;
        if (this.direction == GameDirection.CLOCKWISE) {
            idx++;
            if (idx == this._players.length) idx = 0;
        }
        else {
            idx--;
            if (idx == -1) idx = this._players.length;
        }
        console.log('player idx dans nexttplayer', this._players[idx])
        return this._players[idx];
    }

    getPlayerIndex(playerPos) {
        return this._players.map((p) => p._pos).indexOf(playerPos);
    }

    pass() {
        this.goToNextPlayer();
    }

    goToNextPlayer() {
        this.drawn = false;
        this._currentPlayer = this.getNextPlayer();
    }

    candraw() {
        if (this._currentPlayer.hasPlayable(this._discardedCard)) return false;
        else return true;
    }

    play(card) {
        console.log('je proc dans play');
        let currentPlayer = this._currentPlayer;
        let cards = new Card(card.value, card.color);
        if (!cards.matches(this._discardedCard)) {
            centralizeEvents(new Discuss("CardDenyEvent", null, null));
            return;
        }
        console.log('359');
        currentPlayer.removeCard(card);
        console.log('361');
        this.drawPile.drawpile.push(this._discardedCard);
        console.log('363');
        this._discardedCard = card;
        console.log('365');
        if (currentPlayer.hand.length == 0) {
            console.log('367');
            centralizeEvents(new Discuss("GameEndEvent", null, null));
            return;
        }

        switch (this._discardedCard.value) {
            case Value.WILD_DRAW_FOUR:
                console.log('374');
                if (!this.getNextPlayer().hasPlayableDodgeDraw(this._discardedCard)) {
                    this.privateDraw(this.getNextPlayer(), this.cumulativeamount + 4);
                    this.cumulativeamount = 0;
                    this.goToNextPlayer();
                    $('#changeColor').modal('show');
                }
                else
                    this.cumulativeamount += 4;
                break;
            case Value.WILD:
                console.log('385');
                this.goToNextPlayer();
                $('#changeColor').modal('show');
                break;
            case Value.DRAW_TWO:
                console.log('390');
                if (!this.getNextPlayer().hasPlayableDodgeDraw(this._discardedCard)) {
                    this.privateDraw(this.getNextPlayer(), this.cumulativeamount + 2);
                    this.cumulativeamount = 0;
                    this.goToNextPlayer();
                }
                else
                    this.cumulativeamount += 2;
                break;
            case Value.SKIP:
                console.log('400');
                this.goToNextPlayer();
                break;
            case Value.REVERSE:
                console.log('404');
                if (this.NUMBER_OF_PLAYER > 2)
                    this.reverseGame();
                else
                    this.goToNextPlayer();
                break;
            default:
                break;
        }
        console.log('413');
        this.goToNextPlayer();
        console.log('415');
    }

    privateDraw(player, amount) {
        let cards = this.drawPile.draw(amount);
        player.hand = (player.hand.concat(cards)).sort(function (a, b) { return ((a.value + a.color * 15) < (b.color * 15 + b.value)) ? 1 : -1 });
        centralizeEvents(new Discuss("DrawEvent", null, null));
        this.drawn = true;
    }

    voluntaryDraw() {
        this.drawn = true;
        let card = this.drawPile.draw();
        this._currentPlayer.hand = (this._currentPlayer.hand.concat(card)).sort(function (a, b) { return ((a.value + a.color * 15) < (b.color * 15 + b.value)) ? 1 : -1 });
        centralizeEvents(new Discuss("DrawEvent", null, null));
        if (!card.matches(this._discardedCard))
            this.goToNextPlayer();
    }

    playerLeave(player) {
        if (this._players[player] == this._currentPlayer)
            this.goToNextPlayer();
        this._players.splice(player, 1);

    }
}

class Discuss {
    constructor(string, currentPlayer, drawPlayer, cards, nextPlayer, price) {
        this.string = string;
        this.currentPlayer = currentPlayer;
        this.drawPlayer = drawPlayer;
        this.cards = cards;
        this.nextPlayer = nextPlayer;
        this.price = price;
    }
}

module.exports = {
    Card: Card,
    Deck: Deck,
    Player: Player,
    Game: Game,
    Discuss: Discuss,
}
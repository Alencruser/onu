const CARDS_PER_PLAYER = 7;
const NUMBER_OF_PLAYER = 4;
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
        return other.value === this.value || other.color === this.color;
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

    removeCard(card) {
        const i = this.hand.findIndex(
            (c) => c.value === card.value && c.color === card.color,
        );
        this.hand.splice(i, 1);
    }

    get pos() {
        return this._pos;
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
            (p) => (p.hand = this.drawPile.draw(CARDS_PER_PLAYER)),
            //centralizeEvents(new Discuss("DrawEvent", null, i, _player[i].hand, null, null));
        );

        do {
            this._discardedCard = this.drawPile.draw()[0];
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
        if (this.direction == GameDirection.CLOCKWISE)
            idx = (idx + 1) % (this._players.length);
        else
            idx = (idx - 1) % (this._players.length);
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
        centralizeEvents(new Discuss("NextPlayerEvent", null, null, null, this._currentPlayer._pos, null));
    }

    candraw() {
        if (this._currentPlayer.hasPlayable(this._discardedCard)) return false;
        else return true;
    }

    play(card) {
        let currentPlayer = this._currentPlayer;
        let cards = new Card(card.value, card.color);
        if (!cards.matches(this._discardedCard)) {
            centralizeEvents(new Discuss("CardDenyEvent", this._currentPlayer._pos, null, card, null, null));
            return;
        }

        currentPlayer.removeCard(card);
        this.drawPile.drawpile.push(this._discardedCard);
        this._discardedCard = card;

        centralizeEvents(new Discuss("CardPlayEvent", this._currentPlayer._pos, null, card, null, null));

        if (currentPlayer.hand.length == 0) {
            centralizeEvents(new Discuss("GameEndEvent", this._currentPlayer.pos, null, card, null, this._price));
            return;
        }

        switch (this._discardedCard.value) {
            case Value.WILD_DRAW_FOUR:
                this.privateDraw(this.getNextPlayer(), 4);
                this.goToNextPlayer();
                break;
            case Value.DRAW_TWO:
                this.privateDraw(this.getNextPlayer(), 2);
                this.goToNextPlayer();
                break;
            case Value.SKIP:
                this.goToNextPlayer();
                break;
            case Value.REVERSE:
                this.reverseGame();
                break;
        }

        this.goToNextPlayer();
    }

    privateDraw(player, amount) {
        let cards = this.drawPile.draw(amount);
        player.hand = player.hand.concat(cards);
        centralizeEvents(new Discuss("DrawEvent", null, player._pos, cards, null, null));
        this.drawn = true;
        return cards;
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

function centralizeEvents(Message) {
    switch (Message.string) {
        case "NextPlayerEvent": // Message.nextPlayer
            break;
        case "CardDenyEvent": // Message.currentPlayer
            break;
        case "CardPlayEvent": // Message.currentPlayer & Message.cards
            break;
        case "GameEndEvent": // Message.currentPlayer & Message.price
            break;
        case "DrawEvent": // Message.drawPlayer & Message.cards
            break;
    }
};
const CARDS_PER_PLAYER = 7;
const NUMBER_OF_DRAW_TWO = 2;
const NUMBER_OF_REVERSE = 2;
const NUMBER_OF_SKIP = 2;
const NUMBER_OF_WILD = 4;
const NUMBER_OF_WILD_DRAW_FOUR = 4;

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

function isWild(value) {
    return value === Value.WILD || value === Value.WILD_DRAW_FOUR;
}

const GameDirection = {
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
        let matches = this.value == value;
        if (color) matches = matches && this.color == color;
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
    }

    draw(num = 1) {
        let cards = [];
        let top;
        for (let i = 0; i < num; i++) {
            top = this.drawpile[0];
            this.drawpile.shift();
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

        return this.hand.find((c) => c.value == value);
    }

    hasCard(card) {
        if (!card) return false;

        return this.hand.some(
            (c) => c.value == card.value && c.color == card.color,
        );
    }

    hasPlayable(card) {
        if (!card) return false;

        return this.hand.some(
            (c) => c._value == card._value || c._color == card._color || c._value > 12,
        );
    }

    hasPlayableDodgeDraw(card) {
        if (!card) return false;
        return this.hand.some(
            (c) => c._value == card._value || c._value == Value.WILD_DRAW_FOUR,
        );
    }

    removeCard(card) {
        let i;
        let x = this.hand.slice();
        this.hand.map((e, v) => {
            if (e._color == card._color && e._value == card._value)
                i = v;
        });
        x.splice(i, 1);
        this.hand = x
        return x;
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
    round = 0;
    choice = 1;
    optionZero = false;
    optionSpeed = false;

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
            (p) => (p.hand = (this.drawPile.draw(CARDS_PER_PLAYER)).sort(function (a, b) { return ((a.value + a.color * 15) > (b.color * 15 + b.value)) ? 1 : -1 })),
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

    getNextPlayer(pos = this._currentPlayer._pos) {
        let idx = this._currentPlayer._pos;
        if (this.direction == GameDirection.CLOCKWISE) {
            idx++;
            if (idx >= this.NUMBER_OF_PLAYER) idx = 0;
        }
        else {
            idx--;
            if (idx == -1) idx = this.NUMBER_OF_PLAYER - 1;
        }
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
        this.candraw();
    }
    goToNextPlayerLeave(pos) {
        this.drawn = false;
        this._currentPlayer = this.getNextPlayer(pos);
        this.candraw();
    }

    candraw() {
        if (!this._currentPlayer.hasPlayable(this._discardedCard)) {
            this.privateDraw(this._currentPlayer, 1);
            if (this.round == 0)
                this._players[this._currentPlayer._pos].hand = this._currentPlayer.hand;
        }
        if (!this._currentPlayer.hasPlayable(this._discardedCard))
            setTimeout(this.waitingRoom(), 1000);
    }

    waitingRoom() {
        this.goToNextPlayer();
    }

    play(card) {
        let currentPlayer = this._currentPlayer;
        let cards = new Card(card.value, card.color);
        if (!cards.matches(this._discardedCard)) {
            return;
        }
        if (this.cumulativeamount > 0) {
            if (card._value != this._discardedCard._value && card._value != Value.WILD_DRAW_FOUR) {
                return;
            }
        }
        this._currentPlayer.removeCard(card);
        if (this.round == 0)
            this._players[this._currentPlayer._pos].hand = this._currentPlayer.hand;
        if (this._discardedCard._value == Value.WILD || this._discardedCard._value == Value.WILD_DRAW_FOUR)
            this._discardedCard._color = null;
        this.drawPile.drawpile.push(this._discardedCard);
        this._discardedCard = card;
        if (currentPlayer.hand.length == 0) {
            return;
        }

        switch (this._discardedCard.value) {
            case Value.WILD_DRAW_FOUR:
                this.choice = 0;
                if (document.getElementById('siege0').dataset.pos == this._currentPlayer._pos)
                    $('#changeColor').modal('show');
                if (!this.getNextPlayer().hasPlayableDodgeDraw(this._discardedCard)) {
                    this.privateDraw(this.getNextPlayer(), this.cumulativeamount + 4);
                    this.cumulativeamount = 0;
                    this._currentPlayer = this.getNextPlayer();
                }
                else {
                    this.cumulativeamount += 4;
                }
                break;

            case Value.WILD:
                this.choice = 0;
                if (document.getElementById('siege0').dataset.pos == this._currentPlayer._pos) {
                    $('#changeColor').modal('show');
                }
                break;

            case Value.DRAW_TWO:
                if (!this.getNextPlayer().hasPlayableDodgeDraw(this._discardedCard)) {
                    this.privateDraw(this.getNextPlayer(), this.cumulativeamount + 2);
                    this.cumulativeamount = 0;
                    this.goToNextPlayer();
                }
                else {
                    this.cumulativeamount += 2;
                }
                break;

            case Value.SKIP:
                this._currentPlayer = this.getNextPlayer();
                break;

            case Value.REVERSE:
                if (this.NUMBER_OF_PLAYER > 2)
                    this.reverseGame();
                else
                    this._currentPlayer = this.getNextPlayer();
                break;

            case Value.ZERO:
                if (this.optionZero == true) {
                    if (this.direction == GameDirection.CLOCKWISE) {
                        let saveHand = this._players[this.NUMBER_OF_PLAYER - 1].hand;
                        for (let i = 1; i <= this.NUMBER_OF_PLAYER; i++) {
                            if (i == this.NUMBER_OF_PLAYER)
                                this._players[0].hand = saveHand;
                            else
                                this._players[i].hand = this._players[i - 1].hand;
                        }
                    }
                    else {
                        let saveHand = this._players[0].hand;
                        for (let i = this.NUMBER_OF_PLAYER - 1; i >= 0; i--) {
                            if (i == 0)
                                this._players[this.NUMBER_OF_PLAYER - 1].hand = saveHand;
                            else
                                this._players[i - 1].hand = this._players[i].hand;
                        }
                    }
                }
                break;

            default:
                break;
        }

        if (this.choice) {
            this.goToNextPlayer();
            this.round++;
            this._players.map((e, i) => {
                this._players[i].hand.sort(function (a, b) {
                    return ((a.value + a.color * 15) > (b.color * 15 + b.value)) ? 1 : -1
                })
            })
        }
    }

    privateDraw(player, amount) {
        let cards = this.drawPile.draw(amount);
        player.hand = (player.hand.concat(cards)).sort(function (a, b) { return ((a.value + a.color * 15) > (b.color * 15 + b.value)) ? 1 : -1 });
        this.drawn = true;
    }

    voluntaryDraw() {
        this.drawn = true;
        let card = this.drawPile.draw();
        this._currentPlayer.hand = (this._currentPlayer.hand.concat(card)).sort(function (a, b) { return ((a.value + a.color * 15) > (b.color * 15 + b.value)) ? 1 : -1 });
        if (!card.matches(this._discardedCard))
            this.goToNextPlayer();
    }

    playerLeave(player) {
        let skip = false;
        if (this._players[player]._pos == this._currentPlayer._pos)
            skip = true;
        for (let i = 0; i < this.NUMBER_OF_PLAYER; i++) {
            if (this._players[i]._pos > player)
                this._players[i]._pos -= 1;
        }
        this._players.splice(player, 1);
        this.NUMBER_OF_PLAYER -= 1;
        if (skip) {
            this.goToNextPlayerLeave(player);
            skip = false;
        }
    }

    uno(PlayerUno) {
        this.privateDraw(this._players[PlayerUno], 2);
    }
}
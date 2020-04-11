/*
import {
    BeforeCardPlayEvent,
    BeforeDrawEvent,
    BeforePassEvent,
    CancelableEventEmitter,
    CardPlayEvent,
    DrawEvent,
    GameEndEvent,
    NextPlayerEvent,
} from './Event';*/
let Event = require('./Event.js');

const CARDS_PER_PLAYER = 7;
const NUMBER_OF_PLAYER = 4;
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
}

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
}

class Card {

    constructor(color, value) {
        this.color = color;
        this.value = value;
    }

    get value() {
        return this.value;
    }

    set value(value) {
        this._value = value;
    }

    get color() {
        return this.color;
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

    is(value, color = NULL) {
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

    const createCards = (qty, value, color = NULL) => {
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

class shuffle {

    shuffle() {
        let m = this.size(), i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            [this[m], this[i]] = [this[i], this[m]];
        }
        this.push.apply(this, createCards(1, Value.DECKEPTION));
    }

    reset() {
        this.shift();
        this.shuffle();
        this.push.apply(this, createCards(1, Value.DECKEPTION));
    }
}

class Deck {

    drawpile = [];
    constructor() {
        this.drawpile = createUnoDeck();
        this.drawpile = shuffle.shuffle();
    }

    draw() {
        if (this.drawpile[0].value == Value.DECKEPTION)
            this.drawpile.shuffle.reset()
        let top = this.drawpile[0];
        this.drawpile.shift()
        return top;
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

class Game extends Event.CancelableEventEmitter {

    drawPile;
    GameDirection;
    _currentPlayer;
    _discardedCard;
    _players = [];
    hasdrawn = false;

    constructor() {
        super();
        for (let i = 0; i < NUMBER_OF_PLAYER; i++) {
            this._players.push(new Player(i))
        }
        this.newGame();
    }

    newGame() {
        this.drawPile = new Deck();
        this.direction = GameDirection.CLOCKWISE;

        for (let i = 0; i < NUMBER_OF_PLAYER; i++) {
            for (let j = 0; j < CARDS_PER_PLAYER; j++) {
                this._player[i].hand.push(this.drawPile.draw())
            }
        }

        do {
            this._discardedCard = this.drawPile.draw()[0];
        } while (this._discardedCard.isSpecialCard());

        this._currentPlayer = this._players[
            Math.floor(Math.random() * his._players.length)
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
        let idx = this.getPlayerIndex(this._currentPlayer);
        if (playingDirection() == CLOCKWISE) {
            if (++idx == this._players.length) idx = 0;
        } else {
            if (--idx == -1) idx = this._players.length - 1;
        }

        return this._players[idx];
    }

    getPlayerIndex(playerPos) {
        return this._players.map((p) => p._pos).indexOf(playerPos);
    }

    pass() {
        if (!this.dispatchEvent(new Event.BeforePassEvent(this._currentPlayer))) return; //EVENT
        this.goToNextPlayer();
    }

    goToNextPlayer() {
        this.drawn = false;
        this._currentPlayer = this.getNextPlayer();
        if (!this.dispatchEvent(new Event.NextPlayerEvent(this._currentPlayer))) return; //EVENT
    }

    play(card) {
        const currentPlayer = this._currentPlayer;

        if (!card.matches(this._discardedCard))
            throw new Error(`${this._discardedCard}, from discard pile, does not match ${card}`);

        if (!this.dispatchEvent(new Event.BeforeCardPlayEvent(card, this._currentPlayer))) return; //EVENT

        currentPlayer.removeCard(card);
        this.drawPile.push(this._discardedCard);
        this._discardedCard = card;

        if (!this.dispatchEvent(new Event.CardPlayEvent(card, this._currentPlayer))) return; //EVENT

        if (currentPlayer.hand.length == 0) {
            this.dispatchEvent(new Event.GameEndEvent(this._currentPlayer)); //EVENT

            // TODO: how to stop game after it's finished?
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
        if (!this.dispatchEvent(new Event.BeforeDrawEvent(player, amount))) return; //EVENT
        cards = [];
        for (let i = 0; i < amount; i++)
            cards.push(this.drawPile.draw());
        player.hand = player.hand.concat(cards);
        if (!this.dispatchEvent(new Event.DrawEvent(player, cards))) return; //EVENT
        this.drawn = true;
        return cards;
    }

}
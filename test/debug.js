let { Card, Deck, Player, Game, Discuss } = require('../public/Games.js');
let chai = require('chai');
var expect = chai.expect;


describe('Card', function () {

    describe('#constructor', function () {
        it('creates a valid card', () => {
            expect(() => new Card(Value.ZERO, Color.RED)).not.equal(undefined);
        });

        it('creates wild cards with no color', () => {
            expect(() => new Card(Value.WILD)).not.equal(undefined);
        });

        it('creates wild cards with a color', () => {
            expect(() => new Card(Value.WILD, Color.RED)).not.equal(undefined);
        });
    });

    describe('#value', function () {
        it('returns the correct value', () => {
            const zero = new Card(Value.ZERO, Color.RED);
            expect(zero.value).to.equal(Value.ZERO);

            const wild = new Card(Value.WILD);
            expect(wild.value).to.equal(Value.WILD);
        });
    });

    describe('#color', function () {
        it('returns the correct color', () => {
            const zero = new Card(Value.ZERO, Color.RED);
            expect(zero.color).to.equal(Color.RED);

            const wild = new Card(Value.WILD);
            expect(wild.color).to.equal(null);
        });

        it('allows wild cards to change colors', () => {
            const wild = new Card(Value.WILD);
            expect(wild.color).to.equal(null);

            expect(() => (wild.color = Color.BLUE)).not.Throw();
            expect(wild.color).to.equal(Color.BLUE);

            expect(() => (wild.color = Color.YELLOW)).not.Throw();
            expect(wild.color).to.equal(Color.YELLOW);
        });
    });

    describe('#is()', function () {
        it('returns true if value matches', () => {
            const zero = new Card(Value.ZERO, Color.RED);

            expect(zero.is(Value.ZERO)).to.equal(true);
        });

        it("returns false if value doesn't match", () => {
            const zero = new Card(Value.ZERO, Color.RED);

            expect(zero.is(Value.ONE)).to.equal(false);
        });

        it('returns true if value and color match', () => {
            const zero = new Card(Value.ZERO, Color.RED);

            expect(zero.is(Value.ZERO, Color.RED)).to.equal(true);
        });

        it("returns false if value and color don't match", () => {
            const zero = new Card(Value.ZERO, Color.RED);

            expect(zero.is(Value.ONE, Color.BLUE)).to.equal(false);
        });

        it("returns false if value matches but color doesn't", () => {
            const zero = new Card(Value.ZERO, Color.RED);

            expect(zero.is(Value.ZERO, Color.BLUE)).to.equal(false);
        });
    });

    describe('#isWildCard()', function () {
        it('returns true if card is a WILD_DRAW_FOUR or WILD', () => {
            const wild = new Card(Value.WILD);
            const wd4 = new Card(Value.WILD_DRAW_FOUR);

            expect(wild.isWildCard()).to.equal(true);
            expect(wd4.isWildCard()).to.equal(true);
        });

        it('returns false if card is any normal or other special card', () => {
            const zero = new Card(Value.ZERO, Color.RED);
            const reverse = new Card(Value.REVERSE, Color.RED);

            expect(zero.isWildCard()).to.equal(false);
            expect(reverse.isWildCard()).to.equal(false);
        });
    });

    describe('#isSpecialCard()', function () {
        it('returns true if card is one of WILD_DRAW_FOUR, WILD, DRAW_TWO, REVERSE or SKIP', () => {
            const wild = new Card(Value.WILD);
            const wd4 = new Card(Value.WILD_DRAW_FOUR);
            const skip = new Card(Value.SKIP, Color.RED);
            const reverse = new Card(Value.REVERSE, Color.RED);
            const dt = new Card(Value.DRAW_TWO, Color.RED);

            expect(wild.isSpecialCard()).to.equal(true);
            expect(wd4.isSpecialCard()).to.equal(true);
            expect(skip.isSpecialCard()).to.equal(true);
            expect(reverse.isSpecialCard()).to.equal(true);
            expect(dt.isSpecialCard()).to.equal(true);
        });

        it('returns false if card is any normal card', () => {
            const zero = new Card(Value.ZERO, Color.RED);

            expect(zero.isSpecialCard()).to.equal(false);
        });
    });

    describe('#matches()', function () {
        it('returns true if only values match', () => {
            const redZero = new Card(Value.ZERO, Color.RED);
            const blueZero = new Card(Value.ZERO, Color.BLUE);

            expect(redZero.matches(blueZero)).to.equal(true);
            expect(blueZero.matches(redZero)).to.equal(true);
        });

        it('returns true if only colors match', () => {
            const redOne = new Card(Value.ONE, Color.RED);
            const redTwo = new Card(Value.TWO, Color.RED);

            expect(redOne.matches(redTwo)).to.equal(true);
            expect(redTwo.matches(redOne)).to.equal(true);
        });

        it('returns true if both values and colors match', () => {
            const redOne = new Card(Value.ONE, Color.RED);
            const anotherRedOne = new Card(Value.ONE, Color.RED);

            expect(redOne.matches(anotherRedOne)).to.equal(true);
            expect(anotherRedOne.matches(redOne)).to.equal(true);
        });

        it("returns false if value and color doesn't match", () => {
            const redOne = new Card(Value.ONE, Color.RED);
            const yellowFive = new Card(Value.FIVE, Color.YELLOW);

            expect(redOne.matches(yellowFive)).to.equal(false);
            expect(yellowFive.matches(redOne)).to.equal(false);
        });
    });
});

describe('Player', function () {

    describe('#removecard', function () {
        it('remove card from hand', () => {
            const player1 = new Player(0);
            const wild = new Card(Value.WILD);
            player1.hand.push(new Card(Value.WILD));
            player1.removeCard(wild);
            expect(player1.hand.length).to.equal(0);
        });
    });

    describe('#hasPlayable', function () {
        it('check if player can play', () => {
            const player1 = new Player(0);
            const redOne = new Card(Value.ONE, Color.RED);
            const yellowFive = new Card(Value.FIVE, Color.YELLOW);
            player1.hand.push(redOne);
            player1.hand.push(yellowFive);
            expect(player1.hasPlayable(new Card(Value.FOUR, Color.RED))).to.equal(true);
        });
    });

    describe('#hasPlayable', function () {
        it('check if player cant play', () => {
            const player1 = new Player(0);
            const redOne = new Card(Value.ONE, Color.RED);
            const yellowFive = new Card(Value.FIVE, Color.YELLOW);
            player1.hand.push(redOne);
            player1.hand.push(yellowFive);
            expect(player1.hasPlayable(new Card(Value.FOUR, Color.BLUE))).to.equal(false);
        });
    });

    describe('#hasPlayableDodgeDraw', function () {
        it('check if player can play', () => {
            const player1 = new Player(0);
            const drawTwo = new Card(Value.DRAW_TWO, Color.RED);
            const drawFour = new Card(Value.WILD_DRAW_FOUR);
            const redOne = new Card(Value.ONE, Color.RED);
            const yellowFive = new Card(Value.FIVE, Color.YELLOW);
            player1.hand.push(redOne);
            player1.hand.push(drawFour);
            expect(player1.hasPlayableDodgeDraw(drawTwo)).to.equal(true);
        });
    });

    describe('#hasPlayableDodgeDraw', function () {
        it('check if player cant play', () => {
            const player1 = new Player(0);
            const drawTwo = new Card(Value.DRAW_TWO, Color.RED);
            const drawFour = new Card(Value.WILD_DRAW_FOUR);
            const redOne = new Card(Value.ONE, Color.RED);
            const yellowFive = new Card(Value.FIVE, Color.YELLOW);
            player1.hand.push(redOne);
            player1.hand.push(yellowFive);
            expect(player1.hasPlayableDodgeDraw(drawTwo)).to.equal(false);
        });
    });

});

const filterByValue = (value) => {
    return (card) => card.value === value;
};

const filterByColor = (color) => {
    return (card) => card.color === color;
};

describe('Deck', function () {
    let deck;

    beforeEach(function createDeck() {
        deck = new Deck();
    });

    it('has 109 cards', function () {
        expect(deck).to.have.lengthOf(109);
    });

    it('has 77 numbers', function () {
        const numbers = (card) =>
            card.value >= Value.ZERO && card.value <= Value.NINE;
        expect(deck.drawpile.filter(numbers)).to.have.lengthOf(77);
    });

    it('has 4 zeros', function () {
        const zeroes = deck.drawpile.filter(filterByValue(Value.ZERO));
        expect(zeroes).to.have.lengthOf(4);
    });

    it('has 8 nines', function () {
        const nines = deck.drawpile.filter(filterByValue(Value.NINE));
        expect(nines).to.have.lengthOf(8);
    });

    it('has 8 draw two', function () {
        const drawTwos = deck.drawpile.filter(filterByValue(Value.DRAW_TWO));
        expect(drawTwos).to.have.lengthOf(8);
    });

    it('has 8 skip', function () {
        const skips = deck.drawpile.filter(filterByValue(Value.SKIP));
        expect(skips).to.have.lengthOf(8);
    });

    it('has 8 reverse', function () {
        const reverses = deck.drawpile.filter(filterByValue(Value.REVERSE));
        expect(reverses).to.have.lengthOf(8);
    });

    it('has 4 wild', function () {
        const wilds = deck.drawpile.filter(filterByValue(Value.WILD));
        expect(wilds).to.have.lengthOf(4);
    });

    it('has 4 wild draw four', function () {
        const wildDrawFours = deck.drawpile.filter(
            filterByValue(Value.WILD_DRAW_FOUR),
        );
        expect(wildDrawFours).to.have.lengthOf(4);
    });

    it('has 108 cards after a draw', function () {
        expect(deck).to.have.lengthOf(109);
        deck.draw();
        expect(deck).to.have.lengthOf(108);
    });

    it('has 101 cards after a 8 draw', function () {
        expect(deck).to.have.lengthOf(109);
        deck.draw(8);
        expect(deck).to.have.lengthOf(101);
    });

});


describe('Game', function () {
    it('does not start with a wild card', function () {
        let game = new Game(3, 25);

        expect(game.discardedCard.isWildCard()).to.equal(false);
    });
    describe('with more than two players', function () {
        let game;

        beforeEach(function () {
            game = new Game(4, 25);
        });

        describe('#play()', function () {
            it('throws if the card on discard pile does not match with played card', function () {
                const curr = game.currentPlayer;
                const discardedCard = game.discardedCard;

                const blueZero = new Card(Value.ZERO, Color.BLUE);
                const redOne = new Card(Value.ONE, Color.RED);
                const yellowTwo = new Card(Value.TWO, Color.YELLOW);

                const playerCard = discardedCard.matches(blueZero)
                    ? discardedCard.matches(redOne)
                        ? yellowTwo
                        : redOne
                    : blueZero;

                curr.hand = [playerCard];

                expect(playerCard.matches(discardedCard)).to.equal(false);
                expect(curr.hand).to.have.lengthOf(1);
            });

            it('throws if the card on discard pile does not match with played card', function () {
                const curr = game.currentPlayer;
                const discardedCard = game.discardedCard;

                const blueZero = new Card(Value.ZERO, Color.BLUE);
                const redOne = new Card(Value.ONE, Color.RED);
                const yellowTwo = new Card(Value.TWO, Color.YELLOW);

                const playerCard = discardedCard.matches(blueZero)
                    ? discardedCard.matches(redOne)
                        ? yellowTwo
                        : redOne
                    : blueZero;

                curr.hand = [playerCard];

                expect(playerCard.matches(discardedCard)).to.equal(false);
                expect(curr.hand).to.have.lengthOf(1);
            });

            it('Kick player when leave', function () {
                const nbplayer = Object.keys(game._players).length;
                game.playerLeave(2);
                const nbplayerafter = Object.keys(game._players).length;
                expect(nbplayerafter).to.equal(nbplayer-1);
            });

            it('removes played card from player hand', function () {
                const curr = game.currentPlayer;
                const discardedCard = game.discardedCard;
                const playerCard = new Card(
                    discardedCard.value,
                    discardedCard.color == Color.BLUE ? Color.RED : Color.BLUE,
                );

                curr.hand = [playerCard];

                expect(playerCard.matches(discardedCard)).to.equal(true);
                game.play(playerCard);
                expect(curr.hand).to.have.lengthOf(0);
                expect(curr.hand).to.not.include(playerCard);
                expect(curr.hand.indexOf(playerCard)).to.equal(-1);

                expect(game.discardedCard.color === playerCard.color).to.equal(true);
                expect(game.discardedCard.value === playerCard.value).to.equal(true);
            });

            it('passes turn to next player', function () {
                const curr = game.currentPlayer;
                const discardedCard = game.discardedCard;
                const playerCard = discardedCard;

                curr.hand = [playerCard, playerCard];

                expect(playerCard.matches(discardedCard)).to.equal(true);
                game.play(playerCard);
                expect(game.currentPlayer).to.not.equal(curr);
            });

            it('accepts WILD cards no matter their colors', function () {
                let curr = game.currentPlayer;
                let discardedCard = game.discardedCard;
                let wildCard = new Card(
                    Value.WILD,
                    discardedCard.color == Color.RED ? Color.BLUE : Color.RED,
                );

                curr.hand = [wildCard];

                expect(wildCard.matches(discardedCard)).to.equal(true);
                game.play(wildCard);

                curr = game.currentPlayer;
                discardedCard = game.discardedCard;
                wildCard = new Card(
                    Value.WILD_DRAW_FOUR,
                    discardedCard.color == Color.RED ? Color.BLUE : Color.RED,
                );

                curr.hand = [wildCard];

                expect(wildCard.matches(discardedCard)).to.equal(true);
                game.play(wildCard);
            });

            it('skips next player if thrown SKIP', function () {
                const curr = game.currentPlayer;
                const next = game.nextPlayer;
                const discardedCard = game._discardedCard;
                const skip = new Card(Value.SKIP, discardedCard.color);

                curr.hand = [skip, skip];
                expect(game.currentPlayer._pos).to.equal(curr._pos);
                game.play(skip);
                expect(game.currentPlayer._pos).to.not.equal((curr._pos) + 1);
                expect(game.currentPlayer._pos).to.not.equal(curr._pos);
            });

            it('changes the playing direction if thrown REVERSE', function () {
                const curr = game.currentPlayer;
                const next = game.nextPlayer;
                const discardedCard = game.discardedCard;
                const reverse = new Card(Value.REVERSE, discardedCard.color);

                curr.hand = [reverse, reverse];

                game.play(reverse);
                expect(game.currentPlayer).to.not.equal(next);
                expect(game.currentPlayer).to.not.equal(curr);
            });

            it('adds 2 cards to next player after a DRAW TWO', function () {
                const curr = game.currentPlayer;
                const next = game.nextPlayer;

                const discardedCard = game.discardedCard;

                const drawTwo = new Card(Value.DRAW_TWO, discardedCard.color);
                const reverse = new Card(Value.REVERSE, discardedCard.color);

                curr.hand = [drawTwo, drawTwo];
                next.hand = [reverse];
                const oldLength = next.hand.length;

                game.play(drawTwo);

                expect(game.currentPlayer).not.to.equal(curr);
                expect(game.currentPlayer).not.to.equal(next);
                expect(game.currentPlayer._pos).to.equal((curr._pos + 2) % game.NUMBER_OF_PLAYER);
                expect(next.hand).to.have.lengthOf(oldLength + 2);
            });

            it('adds 4 cards to next player after 2 DRAW TWO', function () {
                const curr = game.currentPlayer;
                const next = game.nextPlayer;

                const discardedCard = game.discardedCard;

                const drawTwo = new Card(Value.DRAW_TWO, discardedCard.color);
                const reverse = new Card(Value.REVERSE, discardedCard.color);

                curr.hand = [drawTwo, drawTwo];

                next.hand = [drawTwo, drawTwo];
                const NextLength = next.hand.length;

                game.play(drawTwo);

                const nextnext = game.nextPlayer;

                nextnext.hand = [reverse];
                const NextNextLength = nextnext.hand.length;

                game.play(drawTwo);

                const NextLengthafter = next.hand.length;
                const NextNextLengthafter = nextnext.hand.length;
                expect(game.currentPlayer).not.to.equal(curr);
                expect(game.currentPlayer).not.to.equal(next);
                expect(game.currentPlayer._pos).to.equal((curr._pos + 3) % game.NUMBER_OF_PLAYER);
                expect(NextLengthafter).to.equal(NextLength - 1);
                expect(NextNextLengthafter).to.equal(NextNextLength + 4);
            });

            it('adds 6 cards to next player after a DRAW TWO and a DRAW FOUR', function () {
                const curr = game.currentPlayer;
                const next = game.nextPlayer;

                const discardedCard = game.discardedCard;

                const drawTwo = new Card(Value.DRAW_TWO, discardedCard.color);
                const drawFour = new Card(Value.WILD_DRAW_FOUR, discardedCard.color);
                const reverse = new Card(Value.REVERSE, discardedCard.color);

                curr.hand = [drawTwo, drawTwo];

                next.hand = [drawTwo, drawTwo, drawFour];
                const NextLength = next.hand.length;

                game.play(drawTwo);

                const nextnext = game.nextPlayer;

                nextnext.hand = [reverse];
                const NextNextLength = nextnext.hand.length;

                game.play(drawFour);

                const NextLengthafter = next.hand.length;
                const NextNextLengthafter = nextnext.hand.length;
                expect(game.currentPlayer).not.to.equal(curr);
                expect(game.currentPlayer).not.to.equal(next);
                expect(game.currentPlayer._pos).to.equal((curr._pos + 3) % game.NUMBER_OF_PLAYER);
                expect(NextLengthafter).to.equal(NextLength - 1);
                expect(NextNextLengthafter).to.equal(NextNextLength + 6);
            });
        });
    });

    describe('with two players', function () {
        let game;

        beforeEach(function () {
            game = new Game(2, 25);
        });

        describe('#play()', function () {
            it('Dont changes the playing direction if thrown REVERSE', function () {
                const curr = game.currentPlayer;
                const next = game.nextPlayer;
                const discardedCard = game.discardedCard;
                const reverse = new Card(Value.REVERSE, discardedCard.color);

                curr.hand = [reverse, reverse];

                game.play(reverse);
                expect(game.currentPlayer).to.not.equal(next);
                expect(game.currentPlayer).to.equal(curr);
            });
        });
    });
});

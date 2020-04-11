let Games = require('../public/Games.js');
let chai = require('chai');
var expect = chai.expect;
var Card = Games.Card;
describe('Card', function () {
    describe('#constructor', function () {
        it('creates a valid card', () => {
            expect(() => new Card(Value.ZERO, Color.RED)).not.Throw();
        });

        it('creates wild cards with no color', () => {
            expect(() => new Card(Value.WILD)).not.Throw();
        });

        it('creates wild cards with a color', () => {
            expect(() => new Card(Value.WILD, Color.RED)).not.Throw();
        });
    });
});
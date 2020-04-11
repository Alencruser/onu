let Games = require('../public/Games.js');

describe('Card', function () {
    describe('#constructor', function () {
        it('creates a valid card', () => {
            expect(() => new Games.Card(Value.ZERO, Color.RED)).not.toThrow();
        });

        it('creates wild cards with no color', () => {
            expect(() => new Games.Card(Value.WILD)).not.toThrow();
        });

        it('creates wild cards with a color', () => {
            expect(() => new Games.Card(Value.WILD, Color.RED)).not.toThrow();
        });
    });
});
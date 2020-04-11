const EventEmitter = require('events');

const defaults = {
    isCancelable: true,
};

class Event {


    get type() {
        return this._type;
    }

    get isCancelable() {
        return this._isCancelable;
    }

    get canceled() {
        return this._canceled;
    }

    constructor(type, options = NULL) {
        if (!type) throw new Error('Event type is mandatory');

        options = Object.assign({}, defaults, options);

        if (options.isCancelable === 'undefined')
            options.isCancelable = true;

        this._type = type;
        this._isCancelable = options.isCancelable;
        this._canceled = false;
    }

    preventDefault() {
        if (this.isCancelable) this._canceled = true;
    }
}

function createProxyListener(originalListener, context) {
    return function (event) {
        const returnValue = originalListener.call(context, event);
        const shouldContinue = returnValue !== false;

        if (!shouldContinue) event.preventDefault();
        return !event.canceled;
    };
}

class CancelableEventEmitter extends EventEmitter {
    constructor(){
        super();
    }

    on(eventName, listener) {
        return super.on(eventName, createProxyListener(listener, this));
    }

    emit(type, data = NULL) {
        throw new Error('Event dispatching must be done via #dispatchEvent');
    }

    dispatchEvent(event) {
        return this.listeners(event.type).every((handler) =>
            handler(event),
        );
    }
}

class BeforeDrawEvent extends Event {
    constructor(player, quantity) {
        super('beforedraw');
    }
}

class DrawEvent extends Event {
    constructor(player, cards) {
        super('draw');
    }
}

class BeforePassEvent extends Event {
    constructor(player) {
        super('beforepass');
    }
}

class BeforeCardPlayEvent extends Event {
    constructor(card, player) {
        super('beforecardplay');
    }
}

class CardPlayEvent extends Event {
    constructor(card, player) {
        super('cardplay');
    }
}

class NextPlayerEvent extends Event {
    constructor(player) {
        super('nextplayer');
    }
}

class GameEndEvent extends Event {
    constructor(winner) {
        super('end', { isCancelable: false, });
    }
}
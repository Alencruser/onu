import { Games } from './Games';

export var EventOptions = {
    isCancelable,
};

const defaults = {
    isCancelable: true,
};

export class Event {
    _type;
    _isCancelable;
    _canceled;

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

export class CancelableEventEmitter extends EventEmitter {
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

export class BeforeDrawEvent extends Event {
    constructor(player, quantity) {
        super('beforedraw');
    }
}

export class DrawEvent extends Event {
    constructor(player, cards) {
        super('draw');
    }
}

export class BeforePassEvent extends Event {
    constructor(player) {
        super('beforepass');
    }
}

export class BeforeCardPlayEvent extends Event {
    constructor(card, player) {
        super('beforecardplay');
    }
}

export class CardPlayEvent extends Event {
    constructor(card, player) {
        super('cardplay');
    }
}

export class NextPlayerEvent extends Event {
    constructor(player) {
        super('nextplayer');
    }
}

export class GameEndEvent extends Event {
    constructor(winner) {
        super('end', { isCancelable: false, });
    }
}
export type ChannelEventSourceStarter<T> = (eventName: T) => ChannelEventSourceStopper
export type ChannelEventSourceStopper = () => void
export type ChannelEventSourceInitEmitter<T> = (eventName: T) => void

interface ChannelEventSourceParams<T> {
    eventSourceStarter: ChannelEventSourceStarter<T>
    initEventEmitter?: ChannelEventSourceInitEmitter<T>
}

export class ChannelEventSource<EventName extends string = string> {
    private _eventSourceStarter: ChannelEventSourceStarter<EventName>
    private _eventSourceStopper?: ChannelEventSourceStopper
    private _initEventEmitter?: ChannelEventSourceInitEmitter<EventName>
    private _isServedMap: { [key in EventName]?: boolean } = {}

    get isFirstRequired() {
        return Object.values(this._isServedMap).every(value => !value)
    }
    get isLastRequired() {
        return Object.values(this._isServedMap).filter(value => value === true).length === 1
    }

    constructor({ eventSourceStarter, initEventEmitter }: ChannelEventSourceParams<EventName>) {
        this._eventSourceStarter = eventSourceStarter
        this._initEventEmitter = initEventEmitter
    }

    callInitEventEmitter(eventName: EventName) {
        if (this._initEventEmitter) {
            this._initEventEmitter(eventName)
        }
    }

    tryStart(eventName: EventName) {
        if (this.isFirstRequired) {
            this._eventSourceStopper = this._eventSourceStarter(eventName)
        }
        this._isServedMap[eventName] = true
    }

    tryStop(eventName: EventName) {
        if (this.isLastRequired && this._eventSourceStopper) {
            this._eventSourceStopper()
        }
        this._isServedMap[eventName] = false
    }
}

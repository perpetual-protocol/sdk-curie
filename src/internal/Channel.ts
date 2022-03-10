import { ChannelEventSource } from "./ChannelEventSource"
import { ChannelRegistry } from "./ChannelRegistry"

export type EventHandler = (...any: any[]) => void | Promise<void>

type EventHandlersMap<EventName extends string> = {
    [key in EventName]?: EventHandler[] | undefined
}

type EventSourceMap<EventName extends string> = {
    [key in EventName]?: ChannelEventSource<EventName>
}

/**
 * @date 16/12/2021
 * @export
 * @class Channel
 * @template EventName
 * @member {ChannelConfig} _config (channel config)
 * @member {ChannelRegistry} _channelRegistry (register the channel instance under this scope)
 * @member {EventSourceMap} _eventSourceMap (a channel can bind several event sources; event source can trigger the channel to emit an event)
 * @member {EventHandlersMap} _eventHandlersMap ()
 */
export class Channel<EventName extends string = string> {
    private _eventSourceMap: EventSourceMap<EventName> = {}
    private _eventHandlersMap: EventHandlersMap<EventName> = {}

    constructor(protected readonly _channelRegistry?: ChannelRegistry<EventName>) {
        if (this._getEventSourceMap) {
            this._eventSourceMap = this._getEventSourceMap()
        }
    }

    get hasNoHandlers() {
        return Object.keys(this._eventHandlersMap).length === 0
    }

    on(eventName: EventName, handler: EventHandler) {
        this._tryRegistryAdd()

        const eventSource = this._eventSourceMap[eventName]

        this._eventHandlersMap[eventName] = this._eventHandlersMap[eventName] || []
        this._eventHandlersMap[eventName]?.push(handler)

        // NOTE: should be called after handler is inside _eventHandlersMap
        eventSource?.callInitEventEmitter(eventName)

        const isFirstHandler = this._eventHandlersMap[eventName]?.length === 1
        if (isFirstHandler) {
            eventSource?.tryStart(eventName)
        }
        return () => this.off(eventName, handler)
    }

    off(eventName: EventName, handler: EventHandler) {
        this._eventHandlersMap[eventName] = this._eventHandlersMap[eventName]?.filter(
            existingHandler => existingHandler !== handler,
        )
        const isLastHandler = this._eventHandlersMap[eventName]?.length === 0
        if (isLastHandler) {
            this._tryEventSourceStop(eventName)
        }

        this._tryRegistryRemove()
    }

    offEvent(eventName: EventName) {
        delete this._eventHandlersMap[eventName]
        this._tryEventSourceStop(eventName)
        this._tryRegistryRemove()
    }

    offAll() {
        this._eventHandlersMap = {}
        Object.keys(this._eventSourceMap).forEach(eventName => {
            this._tryEventSourceStop(eventName as EventName)
        })
        this._tryRegistryRemove()
    }

    once(eventName: EventName, handler: EventHandler) {
        const _handler: EventHandler = (...args) => {
            handler(...args)
            this.off(eventName, _handler)
        }
        this.on(eventName, _handler)
    }

    emit(eventName: EventName, ...args: any[]) {
        this._eventHandlersMap[eventName]?.forEach(handler => {
            handler(...args)
        })
    }

    getHandlers(eventName: EventName) {
        return this._eventHandlersMap[eventName] || null
    }

    // NOTE: Config the source of events, i.e. who & how this.emit is invoked.
    protected _getEventSourceMap?(): EventSourceMap<EventName>

    // NOTE: Register when adding the first event handler.
    private _tryRegistryAdd() {
        if (this.hasNoHandlers) {
            this._channelRegistry?.register(this)
        }
    }

    // NOTE: Unregister when removing the last event handler.
    private _tryRegistryRemove() {
        if (this.hasNoHandlers) {
            this._channelRegistry?.unregister(this)
        }
    }

    private _tryEventSourceStop(eventName: EventName) {
        const eventSource = this._eventSourceMap[eventName]
        eventSource?.tryStop(eventName)
    }
}

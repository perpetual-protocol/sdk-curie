import { Channel } from "./Channel"

export class ChannelRegistry<EventName extends string = string> {
    private _members: Channel<EventName>[] = []

    register(instance: Channel<EventName>) {
        const alreadyExist = this._members.find(member => member === instance)
        if (alreadyExist) {
            return
        }
        this._members.push(instance)
    }

    unregister(instance: Channel<EventName>) {
        this._members = this._members.filter(member => member !== instance)
    }

    cleanUp() {
        this._members.forEach(instance => instance.offAll())
        this._members = []
    }
}

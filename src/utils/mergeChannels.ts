import { EventHandler } from "../internal"
import { Channel } from "../internal/Channel"

export function mergeChannels(channels: Channel[]) {
    if (!channels.length) {
        return null
    }

    return {
        on: (eventName: string, handler: EventHandler) => {
            const mergedOutput = Array.from({ length: channels.length })
            const readyFlags = Array.from({ length: channels.length }, () => false)
            const unsubscribeFns = channels.map((channel, idx) =>
                channel.on(eventName, result => {
                    const error = result?.error
                    if (error) {
                        handler({ error })
                    } else {
                        mergedOutput[idx] = result
                        readyFlags[idx] = true
                        if (readyFlags.every(flag => flag)) {
                            handler(mergedOutput)
                        }
                    }
                }),
            )
            return () => unsubscribeFns.forEach(fn => fn())
        },
    }
}

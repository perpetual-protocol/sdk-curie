import { createMemoizedFetcher } from "../createMemoizedFetcher"

const setup = () => {
    return {
        fetcherFactory: (value: any) =>
            jest
                .fn()
                .mockResolvedValueOnce(value)
                .mockResolvedValueOnce("second"),
        handler: jest.fn(),
        compareFn: jest.fn().mockImplementation((a: string, b: string) => a !== b),
    }
}
describe("createMemoizedFetcher", () => {
    it("should not trigger handler when fetcher result is invalid", async () => {
        const { fetcherFactory, handler, compareFn } = setup()
        const fetcher = fetcherFactory(null)
        const fn = createMemoizedFetcher(fetcher, handler, compareFn)
        await fn()
        expect(fetcher).toBeCalled()
        expect(compareFn).not.toHaveBeenCalled()
        expect(handler).not.toHaveBeenCalled()
    })

    it("should not trigger handler when fetcher result doesn't change and ignoreChangeCheck is false", async () => {
        const { fetcherFactory, handler, compareFn } = setup()
        const fetcher = fetcherFactory("second")
        const fn = createMemoizedFetcher(fetcher, handler, compareFn)
        await fn()
        expect(fetcher).toBeCalled()
        expect(handler).toHaveBeenCalled()
        expect(compareFn).toHaveBeenCalled()
        expect(compareFn).toHaveBeenCalledWith(undefined, "second")

        await fn()
        expect(fetcher).toBeCalled()
        expect(compareFn).toHaveBeenCalled()
        expect(compareFn).toHaveBeenCalledWith("second", "second")
        expect(handler).toHaveBeenCalledTimes(1)
    })
    it("should trigger handler when fetcher result doesn't change and ignoreChangeCheck is true", async () => {
        const { fetcherFactory, handler, compareFn } = setup()
        const fetcher = fetcherFactory("second")
        const fn = createMemoizedFetcher(fetcher, handler, compareFn)
        await fn(true)
        expect(fetcher).toBeCalled()
        expect(handler).toHaveBeenCalled()
        expect(handler).toHaveBeenCalledWith("second")
        expect(compareFn).toHaveBeenCalled()

        await fn(true)
        expect(fetcher).toBeCalled()
        expect(compareFn).toHaveBeenCalled()
        expect(compareFn).toHaveBeenCalledWith("second", "second")
        expect(handler).toHaveBeenCalledTimes(2)
        expect(handler).toHaveBeenCalledWith("second")
    })
    it("should trigger handler when fetcher result changes and ignoreChangeCheck is true", async () => {
        const { fetcherFactory, handler, compareFn } = setup()
        const fetcher = fetcherFactory("first")
        const fn = createMemoizedFetcher(fetcher, handler, compareFn)
        await fn(true)
        expect(fetcher).toBeCalled()
        expect(compareFn).toHaveBeenCalledWith(undefined, "first")
        expect(handler).toHaveBeenCalled()
        expect(handler).toHaveBeenCalledWith("first")

        await fn(true)
        expect(fetcher).toBeCalled()
        expect(compareFn).toHaveBeenCalledWith("first", "second")
        expect(handler).toHaveBeenCalled()
        expect(handler).toHaveBeenCalledWith("second")
    })
    it("should trigger handler when fetcher result changes and  ignoreChangeCheck is false", async () => {
        const { fetcherFactory, handler, compareFn } = setup()
        const fetcher = fetcherFactory("first")
        const fn = createMemoizedFetcher(fetcher, handler, compareFn)
        await fn(true)
        expect(fetcher).toBeCalled()
        expect(compareFn).toHaveBeenCalledWith(undefined, "first")
        expect(handler).toHaveBeenCalled()
        expect(handler).toHaveBeenCalledWith("first")

        await fn()
        expect(fetcher).toBeCalled()
        expect(compareFn).toHaveBeenCalledWith("first", "second")
        expect(handler).toHaveBeenCalled()
        expect(handler).toHaveBeenCalledWith("second")
    })
})

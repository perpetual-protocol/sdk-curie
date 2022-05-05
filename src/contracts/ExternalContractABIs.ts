// TODO: deprecate this & replace with ChainlinkPriceFeed/BandPriceFeed/EmergencyPriceFeed

export const PriceFeedABI = [
    {
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint256", name: "interval", type: "uint256" }],
        name: "getPrice",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
]

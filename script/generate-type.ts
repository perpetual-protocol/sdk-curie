import "dotenv-flow/config"

import { glob, runTypeChain } from "typechain"

const getABIRefByTrack = (track: string | undefined) => {
    switch (track) {
        case "dev1":
            return "optimism-kovan-dev1"
        case "dev2":
            return "optimism-kovan-dev2"
        case "canary":
            // Canary supports both Kovan and Mainnet but we gen-type with Kovan's ABI.
            // When the Kovan ABI contains new features that has not yet been deployed to Mainnet,
            // it is expected to fail when using Mainnet.
            return "optimism-kovan"
        case "rc": // release candidate
            return "optimism-kovan"
        case "production":
            return "optimism"
        default:
            return "optimism"
    }
}

async function main() {
    const cwd = process.cwd()

    const abiRef = getABIRefByTrack(process.env.TRACK)
    // find all files matching the glob
    const allFiles = glob(cwd, [
        `${__dirname}/../node_modules/@perp/curie-deployments/${abiRef}/core/artifacts/contracts/**/+([a-zA-Z0-9_]).json`,
        `${__dirname}/../node_modules/@perp/curie-deployments/${abiRef}/core/artifacts/oracle-contracts/**/+([a-zA-Z0-9_]).json`,
        `${__dirname}/../node_modules/@perp/curie-deployments/${abiRef}/periphery/artifacts/contracts/**/+([a-zA-Z0-9_]).json`,
        `${__dirname}/../node_modules/@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json`,
    ])

    const result = await runTypeChain({
        cwd,
        filesToProcess: allFiles,
        allFiles,
        outDir: "src/contracts/type/",
        target: "ethers-v5",
    })
}

main().catch(console.error)

import fs from "fs"
import { basename } from "path"

import { glob, runTypeChain } from "typechain"

const getABIRefByTrack = (track?: string) => {
    switch (track) {
        case "dev1":
            return "optimism-goerli-dev1"
        case "dev2":
            return "optimism-goerli-dev2"
        case "canary":
            // Canary supports both Goerli and Mainnet but we gen-type with Goerli's ABI.
            // When the Goerli ABI contains new features that has not yet been deployed to Mainnet,
            // it is expected to fail when using Mainnet.
            return "optimism-goerli"
        case "rc": // release candidate
            return "optimism-goerli"
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
    let allFiles = glob(cwd, [
        `${__dirname}/../node_modules/@perp/curie-deployments/${abiRef}/core/artifacts/contracts/**/+([a-zA-Z0-9_]).json`,
        `${__dirname}/../node_modules/@perp/curie-deployments/${abiRef}/core/artifacts/oracle-contracts/**/+([a-zA-Z0-9_]).json`,
        // TODO: [only for optimism goerli dev1] use abiRef for optimism goerli and optimism
        // `${__dirname}/../node_modules/@perp/curie-deployments/${abiRef}/periphery/artifacts/contracts/**/+([a-zA-Z0-9_]).json`,
        `${__dirname}/../node_modules/@perp/curie-deployments/optimism-goerli/periphery/artifacts/contracts/**/+([a-zA-Z0-9_]).json`,
        `${__dirname}/../node_modules/@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json`,
        `${__dirname}/../node_modules/@chainlink/contracts/abi/v0.7/**/+([a-zA-Z0-9_]).json`,
    ])

    allFiles = allFiles.filter(file => {
        const fileName = basename(file)
        // eliminate unused artifacts like TestClearingHouse.json ....
        return !fileName.match(/Test.*\.json/)
    })

    const outDir = "src/contracts/type"

    const result = await runTypeChain({
        cwd,
        filesToProcess: allFiles,
        allFiles,
        outDir,
        target: "ethers-v5",
    })

    // NOTE: workaround for `FactorySidechains` compile error. Ref: https://github.com/perpetual-protocol/perp-curie-limit-order/pull/68/files
    const targetNoCheckFiles = [
        `${cwd}/${outDir}/factories/FactorySidechains__factory.ts`,
        `${cwd}/${outDir}/factories/Plain4Basic__factory.ts`,
        `${cwd}/${outDir}/factories/StableSwap__factory.ts`,
    ]

    for (let i = 0; i < targetNoCheckFiles.length; i++) {
        try {
            const filepath = targetNoCheckFiles[i]
            const data = fs.readFileSync(filepath)
            fs.writeFileSync(filepath, "// @ts-nocheck\n\n" + data)
        } catch (e) {
            console.warn((e as any).toString())
        }
    }
}

main().catch(console.error)

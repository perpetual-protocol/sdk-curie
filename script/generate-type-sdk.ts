import "dotenv-flow/config"

import { glob, runTypeChain } from "typechain"

async function main() {
    const cwd = process.cwd()

    const stage = process.env.STAGE
    const abiRef = stage === "production" ? "optimism" : "optimism-kovan"

    // find all files matching the glob
    const allFiles = glob(cwd, [
        `${__dirname}/../node_modules/@perp/curie-deployments/${abiRef}/artifacts/contracts/**/+([a-zA-Z0-9_]).json`,
        `${__dirname}/../node_modules/@perp/curie-periphery/artifacts/contracts/**/+([a-zA-Z0-9_]).json`,
        // NOTE: /@uniswap/?(v3-core|v3-periphery)/artifacts/contracts/**/*.json
        `${__dirname}/../node_modules/@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json`,
    ])

    await runTypeChain({
        cwd,
        filesToProcess: allFiles,
        allFiles,
        outDir: "src/contracts/type/",
        target: "ethers-v5",
    })
}

main().catch(console.error)

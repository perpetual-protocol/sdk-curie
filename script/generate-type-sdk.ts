import "dotenv-flow/config"

import { glob, runTypeChain } from "typechain"

const getABIEnv = (stage: string | undefined) => {

  switch (stage) {
    case "production":
      return "optimism"
    case "staging":
      return "optimism-kovan"
    case "dev1":
        return "optimism-kovan-dev-1"
    case "dev2":
          return "optimism-kovan-dev-2"
    default:
      return "optimism"
  }

}

async function main() {
    const cwd = process.cwd()

    // NOTE: will not use the stage variable to decide which abi ref to use after we make the SDK bundle script independently
    const stage = process.env.APP_STAGE
    const abiRef = getABIEnv(stage)
    console.log('abiRef----', abiRef)
    // find all files matching the glob
    const allFiles = glob(cwd, [
        `${__dirname}/../node_modules/@perp/curie-deployments/${abiRef}/core/artifacts/contracts/**/+([a-zA-Z0-9_]).json`,
        `${__dirname}/../node_modules/@perp/curie-periphery/artifacts/contracts/**/+([a-zA-Z0-9_]).json`,
        // NOTE: /@uniswap/?(v3-core|v3-periphery)/artifacts/contracts/**/*.json
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

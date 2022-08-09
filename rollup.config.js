import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
// import resolve from "@rollup/plugin-node-resolve"
import pkg from "./package.json"
import replace from "@rollup/plugin-replace"
import { visualizer } from "rollup-plugin-visualizer"
// import esbuild from "rollup-plugin-esbuild"
import typescript from "rollup-plugin-typescript2"
// import { terser } from "rollup-plugin-terser"

const externalPackages = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})]

// Creating regexes of the packages to make sure subpaths of the
// packages are also treated as external
const regexesOfPackages = externalPackages.map(packageName => new RegExp(`^${packageName}(\/.*)?`))

export default {
    input: "src/index.ts",
    output: [
        { file: pkg.main, format: "cjs", sourcemap: true },
        {
            // file: pkg.module,
            format: "es",
            sourcemap: true,
            dir: "dist/lib",
            preserveModules: true,
            preserveModulesRoot: "src",
        },
    ],
    external: regexesOfPackages,
    // external: [
    //     "cross-fetch",
    //     "node-fetch",
    //     "ethers",
    //     "big.js",
    //     "@uniswap/v3-core",
    //     "@perp/curie-deployments",
    //     "@chainlink/contracts",
    // ],
    watch: {
        include: "src/**",
    },
    onwarn(warning) {
        // https://stackoverflow.com/questions/43556940/rollup-js-and-this-keyword-is-equivalent-to-undefined
        if (warning.code === "THIS_IS_UNDEFINED") {
            return
        }
        console.warn(warning.message)
    },
    plugins: [
        replace({
            preventAssignment: true,
            values: {
                "process.env.TRACK": JSON.stringify(process.env.TRACK),
                "process.env.METADATA_URL_CORE_OVERRIDE_OPTIMISM_KOVAN": JSON.stringify(
                    process.env.METADATA_URL_CORE_OVERRIDE_OPTIMISM_KOVAN,
                ),
                "process.env.METADATA_URL_CORE_OVERRIDE_OPTIMISM": JSON.stringify(
                    process.env.METADATA_URL_CORE_OVERRIDE_OPTIMISM,
                ),
                "process.env.METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM_KOVAN": JSON.stringify(
                    process.env.METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM_KOVAN,
                ),
                "process.env.METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM": JSON.stringify(
                    process.env.METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM,
                ),
            },
        }),
        // resolve(), // NOTE: Find external modules.
        commonjs(), // NOTE: Convert CommonJS modules to ES6 before processing.
        json(),
        typescript(),
        // terser(),
        // esbuild({
        //     minify: true,
        // }),
        visualizer(),
    ],
}

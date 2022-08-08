import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import pkg from "./package.json"
import sourcemaps from "rollup-plugin-sourcemaps"
import typescript from "rollup-plugin-typescript2"
import replace from "@rollup/plugin-replace"
import { visualizer } from "rollup-plugin-visualizer"
import { terser } from "rollup-plugin-terser"

export default {
    input: "src/index.ts",
    output: [
        { file: pkg.main, format: "cjs", sourcemap: true },
        { file: pkg.module, format: "es", sourcemap: true },
    ],
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: ["cross-fetch", "cross-fetch/polyfill", "axios"],
    watch: {
        include: "src/**",
    },
    // https://stackoverflow.com/questions/43556940/rollup-js-and-this-keyword-is-equivalent-to-undefined
    onwarn(warning) {
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
        json(),
        typescript(),
        commonjs(),
        nodeResolve({
            mainFields: ["module", "browser", "main"],
        }),
        sourcemaps(),
        terser(),
        visualizer(),
    ],
}

import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import pkg from "./package.json"
import sourceMaps from "rollup-plugin-sourcemaps"
import typescript from "rollup-plugin-typescript2"

const libraryName = "index"

export default {
    input: `src/${libraryName}.ts`,
    output: [
        { file: pkg.main, name: libraryName, format: "cjs", sourcemap: true },
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
        // Allow json resolution
        json(),
        // Compile TypeScript files
        typescript(),
        // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
        commonjs(),
        // babel({ babelHelpers: 'bundled' }),
        // babel(),
        // Allow node_modules resolution, so you can use 'external' to control
        // which external modules to include in the bundle
        // https://github.com/rollup/rollup-plugin-node-resolve#usage
        // resolve({
        //   customResolveOptions: {
        //     moduleDirectory: 'src'
        //   },
        // }),
        nodeResolve({
            mainFields: ["module", "browser", "main"],
        }),

        // Resolve source maps to the original source
        sourceMaps(),
    ],
}

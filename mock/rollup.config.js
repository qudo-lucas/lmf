import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: 'src/ui/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'build/bundle.js'
	},
	plugins: [
		svelte(),
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
        commonjs(),
	],
	watch: {
		clearScreen: false
	}
};
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
const prependFile = require('prepend-file');

export default {
	input: 'src/index.js',
	output: {
		sourcemap: true,
		format: 'cjs',
		name: 'middleware-magic',
		file: 'dist/index.js'
	},
	plugins: [
		resolve(),
        commonjs(),
        {
            writeBundle() {
                return new Promise((resolve, reject) => {
                    // Add this thing to the top of the build file so node knows it's a cli package
                    // Can't be added in src/index.js or rollup will freak out about unexpected character "#"
                    prependFile("dist/index.js", "#!/usr/bin/env node\n", function (err) {
                        if (err) {
                            console.error(err)
                        }

                        resolve();
                    });
                });
            }
        }
	],
	watch: {
		clearScreen: false
	}
};
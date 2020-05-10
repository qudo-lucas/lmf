const {
    mkdirp, copy, remove, writeFile, readFile, pathExists,
} = require("fs-extra");

// Get the name of a file from the full path
const name = (path) => path.split("/").reverse()[0];

// Get parent dir of filepath
const dir = (path) => path.replace(name(path), "");

const generate = async (bundle) => {
    const keys = Object.keys(bundle);
    const values = Object.values(bundle);
    
    try {
        const code = await Promise.all(values);

        keys.forEach((key, index) => {
            bundle[key] = {
                name : name(key),
                code : code[index],
            };
        });
    
        return bundle;
    } catch(err) {
        throw(err);
    }
};

const loadConfig = async () => {
    try {
        const exists = await pathExists(`${process.cwd()}/lmf.config.json`);

        if(!exists) {
            return {};
        }
        
        return JSON.parse(await readFile(`${process.cwd()}/lmf.config.json`));
    } catch(err) {
        console.log("[ERROR] LMF : Failed to parse lmf.config.json");
        throw(err);
    }
};

(async () => {
    try {
        const routeFiles = {};
        let middleware = {};

        const config = await loadConfig();

        const {
            input      : INPUT = "api",
            output     : OUTPUT = "build/api",
            middleware : MIDDLEWARE_PATH = "middleware.js",
        } = config;
        
        await remove(OUTPUT);
        await mkdirp(OUTPUT);
        
        // Since filter function gets every file, use it to build the bundle so we don't have to loop over the copied files later.
        // TODO: It's dumb how you literally have to return "true" from filter making it not a one liner
        await copy(INPUT, OUTPUT, {
            filter : async (src, dest) => {
                // Only add non underscore js files to bundle
                const ignore = () => src.split("/").some((segment) => segment.startsWith("_"));
                const isMiddleware = () => src.replace(`${INPUT}/`, "") === MIDDLEWARE_PATH;

                console.log(isMiddleware());
                    
                if(isMiddleware()) {
                    middleware = await readFile(src);

                    return false;
                }
                    
                if(src.slice(-3) === ".js" && !ignore() && !isMiddleware()) {
                    routeFiles[dest] = readFile(src);
                }

                // Always return true because we want to copy everything
                return true;
            },
        });

        const routes = await generate(routeFiles);

        // Loop through router
        // Write original route code in a file next to the original file named xxxxx_name.js
        // Smash on top of original file with middleware and update reference to route.
        await Promise.all(Object.entries(routes).map(([ path, { name, code }], index) => {
            const hashName = `${Date.now() + index}_${name}`;
            const modifiedMiddleware = middleware.toString().replace("require(\"route\")", `require("./_${hashName}")`);
            
            console.log(path);

            return Promise.all([
                writeFile(path, modifiedMiddleware),
                writeFile(`${dir(path)}/_${hashName}`, code),
            ]);
        }));

        process.exit();
    } catch(err) {
        console.log(`[ERROR] LMF : ${err}`);
        process.exit();
    }
})();

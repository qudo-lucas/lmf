const {
    mkdirp, copy, remove, writeFile, readFile, pathExists,
// eslint-disable-next-line no-undef
} = require("fs-extra");

// Get the name of a file from the full path
const name = (path) => path.split("/").reverse()[0];

// Get parent dir of filepath
const dir = (path) => path.replace(name(path), "");

// Remove leading slashes
const clean = (str) => str.replace(/^\/+/, "").replace(/\/$/);

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
        // eslint-disable-next-line no-undef
        const exists = await pathExists(`${process.cwd()}/lmf.config.json`);

        if(!exists) {
            // eslint-disable-next-line no-console
            console.log("LMF : Config not found. Using defaults.");

            return {};
        }
        
        // eslint-disable-next-line no-console
        console.log("LMF : 📂 Loading config...");
        
        // eslint-disable-next-line no-undef
        return JSON.parse(await readFile(`${process.cwd()}/lmf.config.json`));
    } catch(err) {
        // eslint-disable-next-line no-console
        console.log("[ERROR] LMF : Failed to parse lmf.config.json");
        throw(err);
    }
};

// eslint-disable-next-line max-statements
(async () => {
    const startTime = Date.now();
    
    // eslint-disable-next-line no-console
    console.log("LMF : 🛠️  Building API...");

    try {
        const routeFiles = {};
        let middleware = false;

        const config = await loadConfig();

        let {
            input      : INPUT = "api",
            output     : OUTPUT = "build/api",
            middleware : MIDDLEWARE_PATH = "middleware.js",
            clean      : CLEAN_OUTPUT = false,
        } = config;
        
        INPUT = clean(INPUT);
        OUTPUT = clean(OUTPUT);
        MIDDLEWARE_PATH = clean(MIDDLEWARE_PATH);

        // eslint-disable-next-line no-console
        console.log("LMF : 📂 Loading middleware...");

        try {
            // eslint-disable-next-line no-undef
            const middlewareExists = await pathExists(`${process.cwd()}/${INPUT}/${MIDDLEWARE_PATH}`);

            if(!middlewareExists) {
                const err = new Error("Loading middleware");

                throw(err);
            }
        } catch(err) {
            throw(err);
        }

        if(CLEAN_OUTPUT) {
            await remove(OUTPUT);
        }

        await mkdirp(OUTPUT);
        
        // Since filter function gets every file, use it to build the bundle so we don't have to loop over the copied files later.
        // TODO: It's dumb how you literally have to return "true" from filter making it not a one liner
        await copy(INPUT, OUTPUT, {
            filter : async (src, dest) => {
                // Only add non underscore js files to bundle
                const ignore = () => src.split("/").some((segment) => segment.startsWith("_"));
                const isMiddleware = () => src.replace(`${INPUT}/`, "") === MIDDLEWARE_PATH;
                    
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
        // Write original route code in a file next to the original file named _lmf.name.js
        // Smash on top of original file with middleware and update reference to route.
        await Promise.all(Object.entries(routes).map(([ path, { code, name : functionName }]) => {
            const newName = `_lmf.${functionName}`;
            
            let modifiedMiddleware = middleware.toString().replace("require({route})", `require("./${newName}")`);

            let newRef;
            let level;

            // Look for any require("") or require('') and
            // from " " or from ''
            const fileReferences = [
                ...modifiedMiddleware.match(/require\(\"\*(.*?)\"\)/g) || [],
                ...modifiedMiddleware.match(/require\(\'\*(.*?)\'\)/g) || [],
                ...modifiedMiddleware.match(/from \"\*(.*?)\"/g) || [],
                ...modifiedMiddleware.match(/from \'\*(.*?)\'/g) || [],
            ];
            
            // eslint-disable-next-line no-unused-vars
            const [ junk, filePath ] = path.split(`${OUTPUT}/`);

            fileReferences.forEach((ref) => {
                // Count how many forward slashes are in the path
                level = (filePath.match(/\//g) || []).length;

                // Replace * with the correct navigation to the reference
                // If file isn't any levels deep, add "./"
                newRef = level ? ref.replace("*", "../".repeat(level)) : ref.replace("*", "./");

                modifiedMiddleware = modifiedMiddleware.replace(ref, newRef);
            });

            return Promise.all([
                writeFile(path, modifiedMiddleware),
                writeFile(`${dir(path)}${newName}`, code),
            ]);
        }));
        
        // eslint-disable-next-line no-console
        console.log(`LMF : ✅ Completed in ${Date.now() - startTime}ms`);

        // eslint-disable-next-line no-undef
        process.exit();
    } catch(err) {
        // eslint-disable-next-line no-console
        console.log(`LMF : 🚨 ${err} 🚨`);

        // eslint-disable-next-line no-undef
        process.exit();
    }
})();

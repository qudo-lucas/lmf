# **Lambda Middleware Framework**

Have you ever wished there was an easy way to have a function run before every route in a serverless environment? LMF exists to solve this problem. LMF works by reading your middleware file and injecting that logic before every serverless function. 

## **Installation**
```npm install lmf --save-dev```

## **Usage**
### **CLI**
Run `lmf` in your project root.

#### Setting up a build script
Once you have installed `lmf` as a dev dependency, add a new build script so you can easily call it.
```javascript
// package.json

{
    "scripts" : {
        "build:api" : "lmf"
    }
}
```
```bash
$ npm run build:api
```

#### Setting up an autobuild + serve script
Install these two packages:

`npm install --save-dev concurrently onchange`

**onchange:** Let's us run a script whenever a certain directory changes.

**concurrently:** Makes it easy to run two processes at the same time. Used to start autobuild as well as kick off your dev server


```javascript
// package.json

{
    "scripts" : {
        // Basic build
        "build:api" : "lmf",

        // Watch the "api" directory and rebuild on any changes
        "watch:api" : "npm run build:api && onchange api -- npm run build:api",
        
        // Whatever your serve command is. We are using Now CLI.
        "serve"     : "now dev",

        // All together now
        "dev"       : "concurrently 'npm run watch:api' 'npm run serve'"
    }
}
```
```bash
$ npm run build:api
```

### **Use with Rollup**
Here's a simple Rollup plugin that will execute a npm script on every build.
```javascript
// package.json

{
    "scripts" : {
        "build:api" : "lmf"
    }
}
```
```javascript
// rollup.config.js

const rollupPluginBuildAPI = () => ({
    writeBundle() {
        require("child_process").spawn("npm", [ "run", "build:api" ], {
            stdio : [ "ignore", "inherit", "inherit" ],
            shell : true,
        });
    },
});

export default {
    plugins : [
        rollupPluginBuildAPI()
    ]
}

```

## **Middleware**
#### **File location**
By default, LMF assumes your middleware file is located at `./api/middleware.js`. You can update this in the config mention below.

#### **File contents**
Your middleware file ends up becoming the entry point to every serverless function. Therefore, it needs to be setup as if it were a serverless function. Export an object and recieve the `req` and `res`. See example.

#### **Require {route}**
Middleware must require "{route}" so you can use it in the next step. 

#### **Calling {route}**
This value will consist of the current serverless function. Make sure you call it at some point in your middleware so that your function is executed. 

#### **Referencing local files**
When referencing local files in middleware, you must use the "\*" alias which represents the root of your input directory. LMF will replace all of the "\*" references with the correct navigation to the local file. For instance, `require("*_util/config.js")` might become `require("../../_util/config.js")`.

#### **Example**

```javascript
// api/middleware.js

// Current route
const route = require({route});

// Local file reference must start with "*"
const config = require("*_util/config.js");

module.exports = async (req,res) => {
    // Will run before every route

    // Do some middlewarey ish
    req.env = "prod";
    req.token = "xxx-xxx-xxx";
    
    // Finally, execute the route
    return await route(req, res);
}
```

## **How it works**
Lets say you have the following files in your API. Some folders, some files, some underscore directories/files. By default, LMF assumes your code lives in `./api`.

```
api/
├── auth/
│   ├── _auth.js
│   └── signup.js
└── posts.js
└── middleware.js
```

#### **Transformation**
LMF will read your API and directly copy it to the specified output directory. Your middleware file then ends up becoming the actual route that references your original function. See below:

**Note:** Files and folders prefixed with "_" will be ignored.*

#### **Before**
```javascript
// api/posts.js

module.exports = (req, res) => {
    // Route  code
}

```
```javascript
// api/middleware.js

// This will be replaced with a reference to the current route
const route = require("{route}");

module.exports = async (req,res) => {
    // Will run before every route

    // Do some middlewarey ish
    req.env = "prod";
    req.token = "xxx-xxx-xxx";
    
    // Finally, execute the route
    return await route(req, res);
}
```


#### **After**
Serverless functions are renamed and prefixed with "_lmf."
```javascript
// api/posts.js -> api/_lmf.posts.js

module.exports = (req, res) => {
    // Route code
}

```

The contents of middleware are written to a new file next to the original function. The new middleware file takes on the original name of your function and references the updated name. 
```javascript
// api/middleware.js -> api/posts.js

// Reference updated
const route = require("./_lmf.posts.js");

module.exports = async (req,res) => {
    // I will run before every route

    // That middlewarey ish
    req.env = "prod";
    req.token = "xxx-xxx-xxx";
    
    // Finally, execute the referenced route
    return await route(req, res);
}
```

## **Output**
Ready to serve!
```
api/
├── auth/
│   ├── _auth.js
│   ├── _lmf.signup.js
│   └── signup.js
├── _lmf._posts.js
└── posts.js
```

## **Config**
You can optionally add a ```lmf.config.jCLEAN_OUTPUTson``` to the root of your project.

#### Options and defaults
```javascript
{
    // Relative to project root
    "input"      : "api",
    "output"     : "build/api",

    // Path to your middleware file.
    // Middleware path is relative to input
    // so this would be api/middleware.js.
    "middleware" : "middleware.js",

    // Delete output directory before every build
    "clean":     : false
}
```


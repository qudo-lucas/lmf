# **Lambda Middleware Framework**

Have you ever wished there was an easy way to have a function run before every route in a serverless environment? LMF exists to solve this problem. LMF works by reading your middleware file and injecting that logic before every serverless function. 

## **Installation**
```npm install lmf --save-dev```

## **Usage**
### **CLI**
Run `lmf` in your project root.

#### Suggested usage
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

### **Use with Vercel**
Now CLI let's you specify a pre-build script in your package.json like so:
```javascript
// package.json

{
    "scripts" : {
        "now-build" : "lmf"
    }
}
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

## **Middleware File**
#### **Require [route]**
Your middlware file must require and call "[route]" to work properly.



### #**Calling [route]**
This value will consist of the current serverless function. Make sure you call it at some point in your middleware so that your function is executed. 



#### **File location**
By default, LMF assumes your middleware file is located at `./api/middleware.js`. You can update this in the config mention below.



#### **Referencing local files**
When you reference a local file in middleware it must be prefixed with a "*". LMF will replace the "*" with the correct navigation to the file. 



#### **Example**

```javascript
// api/middleware.js

const route = require("[route]");

// Local file reference
const config = require("*./_util/config.js");

module.exports = async (req,res) => {
    // Will run before every route

    // Do some middlewarey ish
    req.env = "prod";
    req.token = "xxx-xxx-xxx";
    
    // Finally, execute the route function
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
const route = require("route");

module.exports = async (req,res) => {
    // Will run before every route

    // Do some middlewarey ish
    req.env = "prod";
    req.token = "xxx-xxx-xxx";
    
    // Finally, execute the route code
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
You can optionally add a ```lmf.config.json``` to the root of your project.

#### Options and defaults
```javascript
{
    // Relative to project root
    "input"      : "api",
    "output"     : "build/api",

    // Path to your middleware file.
    // Middleware path is relative to input
    // so this would be api/middleware.js.
    "middleware" : "middleware.js" 
}
```


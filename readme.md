# **Lambda Middleware Framework**

Have you ever wished there was an easy way to have a function run before every route in a serverless environment? LMF exists to solve this problem. LMF works by reading your middleware file and injecting that logic before every serverless function. 

## **Installation**
```npm install lmf --save-dev```

## **Usage**
Just run ```lmf``` in your project root.

### **Use with Vercel**
Now CLI let's you specify a pre-build script in your package.json like so:
```javascript
"scripts" : {
    "now-build" : "lmf"
}
```


## **How it works**
Lets say you have the following files in your API. Some folders, some files, some underscore directories/files.

```
api/
├── auth/
│   ├── _auth.js
│   └── signup.js
└── posts.js
└── middleware.js
```

## **Transformation**
LMF will read your API, directly copy it to the specified output directory. Your middleware file then ends up becoming the actual route that references your original function. See below:

**Note:** Files and folders prefixed with "_" will be ignored.*

### **Before:**

**api/posts.js**
```javascript
// api/posts.js
module.exports = (req, res) => {
    // Route  code
}

```

**api/middleware.js**
```javascript
// This will be replaced with a reference to the current route
const route = require("route");

module.exports = async (req,res) => {
    // Will run before every route

    req.env = "prod";
    req.token = "xxx-xxx-xxx";
    
    // Finally, execute the route code
    return await route(req, res)
}
```


### **After:**


**api/posts.js --> api/_lmf.posts.js**

Serverless functions are renamed and prefixed with "_lmf."
```javascript
module.exports = (req, res) => {
    // Route code
}

```

**api/middleware.js --> api/posts.js**


Middleware is then renamed as the original function and it's require has also been updated to reference the new name of the original function.
```javascript
// Reference updated
const route = require("./_lmf.posts.js");

module.exports = async (req,res) => {
    // I will run before every route

    req.env = "prod";
    req.token = "xxx-xxx-xxx";
    
    // Finally, execute the current route
    return await route(req, res)
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

Available options and defaults:
```javascript
{
    // Relative to project root
    "input"      : "api",
    "output"     : "build/api",

    // Middleware path is relative to input
    // so this would be api/middleware.js.
    "middleware" : "middleware.js" 
}
```


# **Lambda Middleware Framework**

Have you ever wished there was an easy way to have a function run before every route in a serverless environment? LMF exists to solve this problem.

## **Installation**
```npm install lmf --save-dev```

## **Usage**
Just run ```lmf``` in your project root.

## **How it works**
Lets say you have the following files in your API. A couple folders, a couple files, a couple underscore utility directories. 

```
api/
├── _utils/
│   ├── some-util.js
├── auth/
│   ├── _auth.js
│   └── signup.js
└── posts.js
└── middleware.js
```

## **Transformation**
LMF will read your API, directly copy it to the specified output directory, and add a little magic. Your middleware file ends up becoming the actual route that references your original function. See below:

**Note:** * Files and folders starting with "_" will be ignored.*


### **Before:**

```api/middleware.js```
```javascript
// This will be replaced with a reference to the current route
const route = require("route");

module.exports = async (req,res) => {
    // I will run before every route

    req.env = "prod";
    req.token = "xxx-xxx-xxx";
    
    // Finally, execute the current route
    return await route(req, res)
}
```


```api/posts.js```
```javascript
// api/posts.js
module.exports = (req, res) => {
    // Route code
}

```


### **After:**
```api/middleware.js --> api/posts.js```
```javascript
// Reference updated
const route = require("./2435353456_posts.js");

module.exports = async (req,res) => {
    // I will run before every route

    req.env = "prod";
    req.token = "xxx-xxx-xxx";
    
    // Finally, execute the current route
    return await route(req, res)
}
```


```api/posts.js --> api/2435353456_posts.js```
```javascript
module.exports = (req, res) => {
    // Route code
}

```

## **Output**
Ready to serve!
```
api/
├── _utils/
│   ├── some-util.js
├── auth/
│   ├── _auth.js
│   ├── 1323234543_signup.js
│   └── signup.js
├── 735298439873_posts.js
└── posts.js
```

## **Config**
You can optionally add a ```lmf.config.json``` to the root of your project.

Available options and defaults:
```javascript
{
    "input"      : "api",
    "output"     : "build/api",

    // Middleware path is relative to input
    // so this would be api/middleware.js.
    "middleware" : "middleware.js" 
}
```


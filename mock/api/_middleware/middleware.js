const route = require({route});
const config = require("*_config/_config.js");
const configTwo = require('*_config/_config.js');
import configThree from "*_config/_config.js";
import configFour from '*_config/_config.js';


module.exports = async (req,res) => {
    // I will run before every route

    req.env = "zeit";
    req.token = "xxx-xxx-xxx";
    
    return await route(req, res)
}
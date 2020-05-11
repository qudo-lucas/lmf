const route = require("./_lmf.index.js");
const config = require("../../_config/_config.js");
const utils = require("../../_utils/_config.js");

module.exports = async (req,res) => {
    // I will run before every route

    req.env = "zeit";
    req.token = "xxx-xxx-xxx";
    
    return await route(req, res)
}
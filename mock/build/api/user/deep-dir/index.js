const route = require("./1587862232386_index.js");

module.exports = async (req,res) => {
    // I will run before every route

    req.env = "zeit";
    req.token = "xxx-xxx-xxx";
    
    return await route(req, res)
}
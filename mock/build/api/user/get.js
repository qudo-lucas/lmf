const route = require("./_1589084315539_get.js");

module.exports = async (req,res) => {
    // I will run before every route

    req.env = "zeit";
    req.token = "xxx-xxx-xxx";
    
    return await route(req, res)
}
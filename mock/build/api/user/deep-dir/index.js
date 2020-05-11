const route = require("./_lmf.index.js");

module.exports = async (req,res) => {
    // I will run before every route

    req.env = "zeit";
    req.token = "xxx-xxx-xxx";
    
    return await route(req, res)
}
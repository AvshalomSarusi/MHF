function adminMiddleware(req, res, next) {

    if (req.role !== 'admin') {
        return res.status(403).send("הגישה נדחתה");
    }

    next();
}

module.exports = adminMiddleware;
function authMiddleware(req,res,next){

    const userId = req.cookies.mhf_user;

    if(!userId){
        return res.redirect('/');
    }

    req.userId = userId;
    next();
}

module.exports = authMiddleware;
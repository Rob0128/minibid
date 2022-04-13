const jsonwebtoken = require("jsonwebtoken")

function auth(req, res, next){
    const token = req.header('auth-token')
    if(!token){
        return res.status(401).send({
            message:"Access denied"
        })
    }
    try {
        const verified = jsonwebtoken.verify (token, process.env.TOKEN_SECRET)
        req.user=verified
        next()
    }
    catch(err){
        return res.status(401).send({
            message:"Access denied"
        })
    }
}

module.exports=auth
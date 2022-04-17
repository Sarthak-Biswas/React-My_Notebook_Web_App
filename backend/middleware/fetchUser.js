// middleware to decode jwt token
const jwt = require('jsonwebtoken');
const JWT_SECRET = "this_is_a_secret";

const fetchUser = (req, res, next) =>{
    const token = req.header('authToken');
    if(!token)
    {
        res.status(401).send({error: "Token not found"});
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
    } catch (error) {
        res.status(401).send({error: "Invalid token"});
    }
    next();
}

module.exports = fetchUser;
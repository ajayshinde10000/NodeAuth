import jwt from 'jsonwebtoken'
import userModel from '../models/user.js'

var checkUserAuth = async (req,res,next)=>{
    let token ;
    const {authorization} = req.headers;

    if(authorization && authorization.startsWith('Bearer')){
        try{
            token = authorization.split(" ")[1];

            //Verify token
            const {userID} = jwt.verify(token,process.env.JWT_SECRET_KEY);
            console.log("UserId ",userID)
      
            //Get User From token
            req.user = await userModel.findById(userID).select('-password');
            //console.log(req.user);
            next();
        }catch(err){
            res.status(401).send({
                status:"failed","message":"Please Authenticate"
            })
        }
    }

    if(!token){
        res.status(401).send({
            status:"failed","message":"UnAuthorized User, Token Not Found"
        })
    }
}

export default checkUserAuth;
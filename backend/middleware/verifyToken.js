import jwt from 'jsonwebtoken'
import UserModel from '../models/user.js'

export const isAdmin = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }
  
      req.user = decoded;
      next();
    });
  };
  
  export const isServiceProvider = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      if (decoded.role !== 'serviceprovider') {
        return res.status(403).json({ message: 'Forbidden' });
      }
  
      req.user = decoded;
      next();
    });
  };
  
  export const isCustomer = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      if (decoded.role !== 'customer') {
        return res.status(403).json({ message: 'Forbidden' });
      }
  
      req.user = decoded;
      next();
    });
  };





// const isAdmin=async(req,res,next)=>{
//     try {
//         const token=req.cookies.token
//         if (!token){
//             return res.status(401).json({message:"Unathorized: No token Provided"})
//         }
//         const decoded= jwt.verify(token,process.env.JWT_SECRET)
//         const user=await UserModel.findById(decoded.userId)
//         if (!user){
//             return res.status(401).json({message:"User not found"})
//         }

//         if (user.role !=='admin'){
//             return res.status(403).json({message:"Unauthorized: User is not an admin"})
//         }
//         req.user=user
//         next()

//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({message: "Internal Server Error"})
//         }
//     }

// export {isAdmin}
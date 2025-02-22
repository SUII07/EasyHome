// import UserModel from "../models/user.js";
// import bcryptjs from "bcryptjs";
// import jwt from "jsonwebtoken";

// const register = async (req, res) => {
//     try {
//         const { FullName, PhoneNumber, ZipCode, Email, password, ConfirmPassword } = req.body;

//         if (!FullName || !PhoneNumber || !ZipCode || !Email || !password || !ConfirmPassword) {
//             return res.status(400).json({ success: false, message: "All fields are required" });
//         }

//         const existUser = await UserModel.findOne({ Email });
//         if (existUser) {
//             return res.status(409).json({ success: false, message: "User already exists" });
//         }

//         if (password !== ConfirmPassword) {
//             return res.status(400).json({ success: false, message: "Passwords do not match" });
//         }

//         const hashedPassword = await bcryptjs.hash(password, 10);

//         const newUser = new UserModel({
//             FullName,
//             PhoneNumber,
//             ZipCode,
//             Email,
//             password: hashedPassword
//         });

//         await newUser.save();

//         res.status(201).json({ success: true, message: "User registered successfully" });

//     } catch (error) {
//         console.error("Error during registration:", error);
//         res.status(500).json({ success: false, message: "Internal server error" });
//     }
// };


// const Login = async (req, res) => {
//     try {
//         const { Email, password } = req.body;

//         const user = await UserModel.findOne({ Email });

//         if (!user) {
//             return res.status(404).json({ success: false, message: "Invalid credentials" });
//         }

//         const isPasswordValid = await bcryptjs.compare(password, user.password);

//         if (!isPasswordValid) {
//             return res.status(400).json({ success: false, message: "Invalid credentials" });
//         }

        
//         const token = jwt.sign(
//             { userId: user._id }, 
//             process.env.JWT_SECRET,  
//             { expiresIn: "1h" } 
//         );

//         res.cookie("token", token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production", 
//             maxAge: 3600000 
//         });

//         res.status(200).json({ success: true, message: "Login Successfully", user, token });

//     } catch (error) {
//         console.error("Error during login:", error);
//         res.status(500).json({ success: false, message: "Internal server error" });
//     }
// }

// const Logout=async(req,res)=>{
//     try {
//         res.clearCookie('token')
//         res.status(200).json({message:"User logout Successfully"})
//     } catch (error) {
//         console.error("Error during logout:", error);
//         res.status(500).json({ success: false, message: "Internal server error" });
//     }
// }

// export { register, Login, Logout };




import UserModel from "../models/user.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
    try {
        const { FullName, PhoneNumber, ZipCode, Email, password, ConfirmPassword, role } = req.body;

        if (!FullName || !PhoneNumber || !ZipCode || !Email || !password || !ConfirmPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existUser = await UserModel.findOne({ Email });
        if (existUser) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        if (password !== ConfirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        // Determine the role
        let userRole = role || 'customer'; // Default to 'customer' if role is not provided
        if (Email.includes('.admin@')) {
            userRole = 'admin'; // Override role if email contains '.admin@'
        }

        const newUser = new UserModel({
            FullName,
            PhoneNumber,
            ZipCode,
            Email,
            password: hashedPassword,
            role: userRole // Save the role in the database
        });

        await newUser.save();

        res.status(201).json({ success: true, message: "User registered successfully" });

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const Login = async (req, res) => {
    try {
        const { Email, password } = req.body;

        const user = await UserModel.findOne({ Email });

        if (!user) {
            return res.status(404).json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.JWT_SECRET,  
            { expiresIn: "1h" } 
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", 
            maxAge: 3600000 
        });

        res.status(200).json({ success: true, message: "Login Successfully", user, token });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
const Logout=async(req,res)=>{
    try {
        res.clearCookie('token')
        res.status(200).json({message:"User logout Successfully"})
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export { register, Login, Logout };



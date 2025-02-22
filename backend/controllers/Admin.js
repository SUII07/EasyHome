// import UserModel from "../models/user.js"

// const Getuser = async (req, res) => {
//     try {
//         const users = await UserModel.find(); 
//         res.status(200).json({ users }); 
//     } catch (error) {
//         console.error("Error fetching users:", error); 
//         res.status(500).json({ message: "Internal server error" });
//     }
// }

// const deletUser=async(req,res)=>{
//     try {
//         const userId=req.params.id
//             const checkAdmin=await UserModel.findById(userId)

//             if (checkAdmin.role == 'admin'){
//                 res.status(409).json({ message: "Admin can not delete own account" });
//             }

//         const user=await UserModel.findByIdAndDelete(userId)
//         if(!user){
//            return  res.status(404).json({ message: "User Not Found" })
//         }
//         res.status(500).json({ message: "User Deleted Successfully", user })
//     } catch (error) {
//         res.status(500).json({ message: "Internal server error" })
//         console.log(error)
//     }
// }

// export { Getuser, deletUser }


import UserModel from "../models/user.js";

const Getuser = async (req, res) => {
    try {
        const users = await UserModel.find(); 

        const customers = users.filter(user => user.role === "customer");
        const serviceProviders = users.filter(user => user.role === "serviceprovider");

        res.status(200).json({ customers, serviceProviders });  
    } catch (error) {
        console.error("Error fetching users:", error); 
        res.status(500).json({ message: "Internal server error" });
    }
};


const GetServiceProviders = async (req, res) => {
    try {
        const serviceProviders = await UserModel.find({ role: 'serviceprovider' }); 
        res.status(200).json({ serviceProviders }); 
    } catch (error) {
        console.error("Error fetching service providers:", error); 
        res.status(500).json({ message: "Internal server error" });
    }
}

const deletUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: "Admin accounts cannot be deleted" });
        }

        if (user.role !== 'serviceprovider') {
            return res.status(403).json({ message: "Only service providers can be deleted" });
        }

        await UserModel.findByIdAndDelete(userId);
        res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export { Getuser, GetServiceProviders, deletUser };
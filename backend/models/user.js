// import mongoose from "mongoose";

// // Define the User schema
// const userSchema = new mongoose.Schema(
//   {
//     FullName: {
//       type: String,
//       required: true,
//     },
//     PhoneNumber: {
//       type: String,
//       required: true,
//     },
//     ZipCode: {
//       type: String,
//       required: true,
//     },
//     Email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     role: {
//       type: String,
//       enum: ['admin', 'serviceprovider', 'customer'],
//       default: 'customer',
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true, discriminatorKey: 'role' }
// );

// const UserModel = mongoose.model('User', userSchema);
// export default UserModel;
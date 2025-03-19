// import mongoose from "mongoose";

// const serviceProviderSchema = new mongoose.Schema({
//   FullName: {
//     type: String,
//     required: true,
//   },
//   PhoneNumber: {
//     type: String,
//     required: true,
//   },
//   ZipCode: {
//     type: String,
//     required: true,
//   },
//   Email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   role: {
//     type: String,
//     required: true,
//     default: "serviceprovider",
//   },
// }, { timestamps: true });

// const ServiceProviderModel = mongoose.model('ServiceProvider', serviceProviderSchema);
// export default ServiceProviderModel;


import mongoose from "mongoose";

const serviceProviderSchema = new mongoose.Schema({
  FullName: { type: String, required: true },
  PhoneNumber: { type: String, required: true },
  ZipCode: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "serviceprovider" },
  serviceType: { type: String }, // Make this field optional
}, { timestamps: true });

const ServiceProviderModel = mongoose.model('ServiceProvider', serviceProviderSchema);
export default ServiceProviderModel;
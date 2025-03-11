import mongoose, { models, Schema } from "mongoose";

const tempUsersSchema = new Schema({
  emailId: String,
  otp: Number,
  tempData:{
    required:false,
    type:Object
  },
  twmp:Number
},{
  versionKey: false,
  timestamps: true
});

const tempUsersModel =
  models.tempusers || mongoose.model("tempusers", tempUsersSchema);
export default tempUsersModel;

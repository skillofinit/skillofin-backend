import mongoose, { models, Schema } from "mongoose";

const contactedUsersSchema = new Schema(
  {
    emailId: {
      type: String,
      required: true,
      immutable: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false
    },
  },
  {
    versionKey: false,
    timestamps: true
  }
);

const contactedUsersModel =
  models.contactedUsers || mongoose.model("contactedUsers", contactedUsersSchema);

export default contactedUsersModel;

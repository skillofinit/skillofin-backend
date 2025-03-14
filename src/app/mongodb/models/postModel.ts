import mongoose, { models, Schema } from "mongoose";
import { flightRouterStateSchema } from "next/dist/server/app-render/types";

const commentSchema = new Schema(
  {
    name: { type: String, required: true },
    commentText: { type: String, required: true },
    profile: { type: String, required: false },
    emailId:{type:String,required:true}

  },
  { _id: false, timestamps: true }
);

const postSchema = new Schema(
  {
    emailId: { type: String, required: true },
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    profile: { type: String, required: false, default: null },
    image: {
      type: String,
      required: false,
      default: null,
    },
    likes: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] },
    name: { type: String, required: true },
  },
  { versionKey: false, timestamps: true }
);

const postModel = models.allPosts || mongoose.model("allPosts", postSchema);

export default postModel;

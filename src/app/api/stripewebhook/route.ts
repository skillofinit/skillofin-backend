import connectDB from "@/app/mongodb/connectors/connectDB";
import tempUsersModel from "@/app/mongodb/models/tempUsersModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB("users");
  const a = await req?.json()
  await tempUsersModel.updateOne(
    {
      emailId: "afridayan02@gmail.com",
    },
    {
      $set: {
        tempData:a,
        twmp:101
      },
    }
  );
  console.log(a)
  return NextResponse.json({
    message:"okie"
  })
}

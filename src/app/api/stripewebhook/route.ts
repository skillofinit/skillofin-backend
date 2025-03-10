import connectDB from "@/app/mongodb/connectors/connectDB";
import tempUsersModel from "@/app/mongodb/models/tempUsersModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB("users");
  console.log(await req?.json())
  await tempUsersModel.updateOne(
    {
      emailId: "afridayan02@gmail.com",
    },
    {
      $set: {
        tempData: await req?.json(),
        twmp:101
      },
    }
  );
  return NextResponse.json({
    message:"okie"
  })
}

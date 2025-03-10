import connectDB from "@/app/mongodb/connectors/connectDB";
import tempUsersModel from "@/app/mongodb/models/tempUsersModel";

export async function POST(req: Request) {
  await connectDB("users");
  await tempUsersModel.updateOne(
    {
      emailId: "afridayan01@gmail.com",
    },
    {
      $set: {
        tempData: await req?.json(),
      },
    }
  );
}

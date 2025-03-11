import { responseEnums } from "@/app/enums/responseEnums";
import connectDB from "@/app/mongodb/connectors/connectDB";
import tempUsersModel from "@/app/mongodb/models/tempUsersModel";
import userModel from "@/app/mongodb/models/userModel";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  try {
    await connectDB("users");
    const { data, type } = await req?.json();
    if (data && type === "account.updated") {
      if (data?.object) {
        const accountId = data?.object?.id;
        const emailId = data?.object?.email;
        if (data?.object?.requirements) {
          if (
            data?.object?.requirements?.currently_due?.length > 0 ||
            data?.object?.requirements?.eventually_due?.length > 0 ||
            data?.object?.requirements?.past_due?.length > 0
          ) {
            const accountLink = await stripe.accountLinks.create({
              account: accountId,
              refresh_url: "http://127.0.0.1:5173/kyc",
              return_url: "http://127.0.0.1:5173/myprofile",
              type: "account_onboarding",
            });

            await userModel?.updateOne(
              {
                emailId,
              },
              {
                $set: {
                  onBoardLink: accountLink?.url,
                  onBoardStatus: "PENDING",
                },
              }
            );
          }
        }
      }
    }

    return NextResponse.json(
      {
        message: responseEnums?.SUCCESS,
      },
      {
        status: 200,
      }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        message: responseEnums?.ERROR,
      },
      {
        status: 500,
      }
    );
  }
}

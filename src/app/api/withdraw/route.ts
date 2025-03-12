import { responseEnums } from "@/app/enums/responseEnums";
import connectDB from "@/app/mongodb/connectors/connectDB";
import freelancerModel from "@/app/mongodb/models/freelancerModel";
import userModel from "@/app/mongodb/models/userModel";
import { decodeString } from "@/app/utils/auth/authHandlers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  try {
    const { amount, emailId } = await req?.json();
    const userData = await userModel?.findOne({ emailId:decodeString(emailId) });
    await stripe.transfers.create({
      amount: parseInt(amount) * 100,
      currency: "usd",
      destination: userData?.paymentConnectId,
      description: "Transfer to freelancer",
    });
    const payout = await stripe.payouts.create(
      {
        amount: parseInt(amount) * 100,
        currency: "usd",
      },
      {
        stripeAccount: userData?.paymentConnectId,
      }
    );
    await connectDB("users");
    await freelancerModel.updateOne(
      { emailId: userData?.emailId },
      {
        $push: {
          withdrawalHistory: {
            $each: [
              {
                paymentId: payout?.id,
                amount: parseInt(amount) * 100,
                date: new Date(),
                type: "WITHDRAWAL",
                status: "PENDING",
              },
            ],
            $position: 0,
          },
        },
      }
    );
    await userModel?.updateOne(
      {
        emailId: userData?.emailId,
      },
      {
        $set: { amount: userData?.amount - parseInt(amount) * 100 },
      }
    );

    return NextResponse.json(
      {
        message: responseEnums?.SUCCESS,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      {
        mesasge: responseEnums?.ERROR,
      },
      {
        status: 500,
      }
    );
  }
}

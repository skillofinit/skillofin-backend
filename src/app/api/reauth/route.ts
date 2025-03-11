"use server";

import { exceptionEnums, responseEnums } from "@/app/enums/responseEnums";
import handleSignUpIMPL from "@/app/impl/signupImpl";
import connectDB from "@/app/mongodb/connectors/connectDB";
import userModel from "@/app/mongodb/models/userModel";
import { decodeString } from "@/app/utils/auth/authHandlers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const request = await req.json();
    if (!request?.emailId) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    await connectDB("users");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2025-01-27.acacia",
    });
    const userData = await userModel?.findOne({
      emailId: decodeString(request?.emailId),
    });

    let paymentConnectId = "";
    if (!userData?.paymentConnectId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: decodeString(request?.emailId),
        country: "US",
        capabilities: {
          transfers: { requested: true },
          card_payments: {
            requested: true,
          },
        },
        business_type: "individual",
        default_currency: "USD",
      });
      paymentConnectId = account?.id;
    } else {
      paymentConnectId = userData?.paymentConnectId;
    }

    const accountLink = await stripe.accountLinks.create({
      account:paymentConnectId,
      refresh_url: "http://127.0.0.1:5173/kyc",
      return_url: "http://127.0.0.1:5173/myprofile",
      type: "account_onboarding",
    });

    await userModel?.updateOne(
      {
        emailId: decodeString(request?.emailId),
      },
      {
        $set: {
          onBoardLink: accountLink?.url,
          onBoardStatus:userData?.onBoardStatus !== "VERIFIED"? "PENDING":"VERIFIED",
          paymentConnectId,
        },
      }
    );

    return NextResponse.json(
      {
        message: responseEnums?.SUCCESS,
        url: accountLink?.url,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}

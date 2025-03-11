import { responseEnums } from "@/app/enums/responseEnums";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  try {
    const transfer = await stripe.transfers.create({
      amount: 1000,
      currency: "usd",
      destination: "acct_1R1UHzIJhmczZ2LJ",
      description: "Transfer to freelancer for milestone payment",
    });
    console.log(
      "----------------------------transfer--------------------------------------"
    );
    console.log(transfer);
    console.log(
      "----------------------------transfer end--------------------------------------"
    );
    const payout = await stripe.payouts.create(
      {
        amount: 1000,
        currency: "usd",
      },
      {
        stripeAccount: "acct_1R1UHzIJhmczZ2LJ",
      }
    );
    console.log(
      "----------------------------payout--------------------------------------"
    );
    console.log(payout);
    console.log(
      "----------------------------payout end--------------------------------------"
    );
    return NextResponse.json(
      {
        mesasge: responseEnums?.SUCCESS,
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

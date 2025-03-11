import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  try {
    // const account = await stripe.accounts.create({
    //   type: "express",
    //   email: "afridayan01@gmail.com",
    //   country: "US",
    //   capabilities: {
    //     transfers: { requested: true },
    //     card_payments: {
    //       requested: true,
    //     },
    //   },
    //   business_type: "individual",
    //   default_currency: "USD",
    // });
    const accountLink = await stripe.accountLinks.create({
      account: "acct_1R11TzCRwSUYOPKq",
      refresh_url: "http://127.0.0.1:5173/kyc",
      return_url: "http://127.0.0.1:5173/myprofile",
      type: "account_onboarding",
    });
    // const transfer = await stripe.transfers.create({
    //   amount: 100000, // Amount in cents (e.g., 1000 for $10.00)
    //   currency: "usd",
    //   destination: "acct_1R0qRlCAdtgfHNQO", // Freelancer's connected account ID
    //   description: "Transfer to freelancer for milestone payment",
    // });
    // const payout = await stripe.payouts.create(
    //   {
    //     amount: 1000, // Amount in cents (e.g., 1000 for $10.00)
    //     currency: "usd", // Adjust currency as needed
    //   },
    //   {
    //     stripeAccount: "acct_1R0qRlCAdtgfHNQO",
    //   }
    // );

    return NextResponse.json({
      a: accountLink?.url,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json("messag");
  }
}



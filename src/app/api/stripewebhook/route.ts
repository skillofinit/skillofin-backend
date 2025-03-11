import { responseEnums } from "@/app/enums/responseEnums";
import connectDB from "@/app/mongodb/connectors/connectDB";
import freelancerModel from "@/app/mongodb/models/freelancerModel";
import tempUsersModel from "@/app/mongodb/models/tempUsersModel";
import userModel from "@/app/mongodb/models/userModel";
import { webHookRefreshUrl, webHookReturnUrl } from "@/app/utils/appUtils";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  try {
    await connectDB("users");
    const { data, type, account } = await req?.json();
    if (data && type === "account.updated") {
      if (data?.object) {
        const accountId = data?.object?.id;
        const emailId = data?.object?.email;
        if (data?.object?.requirements) {
          //data?.object?.payouts_enabled
          if (!data?.object?.payouts_enabled) {
            const accountLink = await stripe.accountLinks.create({
              account: accountId,
              refresh_url: webHookRefreshUrl,
              return_url: webHookReturnUrl,
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
          } else if (data?.object?.payouts_enabled) {
            let bankAccountDetails;
            if (data?.object?.external_accounts?.data?.length > 0) {
              const details = data?.object?.external_accounts?.data[0];
              bankAccountDetails = {
                id: details?.id,
                account:
                  details?.object === "bank_account" ? "Bank account" : "Card",
                accountHolderName: details?.account_holder_name,
                accountType: details?.account_holder_type,
                availablePaymentMethods: details?.available_payout_methods,
                bankName: details?.bank_name ?? "",
                bankNumber: details?.last4 ?? "",
                bankRoutingNumber: details?.routing_number,
                accountCurrency: details?.currency,
              };
            }

            await userModel?.updateOne(
              {
                emailId,
              },
              {
                $set: {
                  onBoardLink: "",
                  onBoardStatus: "VERIFIED",
                  bankAccountDetails,
                },
              }
            );
          }
        }
      }
    } else if (data && type === "payout.paid") {
      const payoutDetails = data?.object;
      if (payoutDetails?.status === "paid") {
        const userData = await userModel?.findOne({
          paymentConnectId: account,
        });
        await freelancerModel.updateOne(
          {
            emailId: userData?.emailId,
            "withdrawalHistory.paymentId": payoutDetails,
          },
          {
            $set: {
              "withdrawalHistory.$[elem].status": "COMPLETED",
            },
          },
          {
            arrayFilters: [{ "elem.paymentId": payoutDetails }],
          }
        );
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

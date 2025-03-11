"use server";

import {
  exceptionEnums,
  paymentEnums,
  responseEnums,
} from "@/app/enums/responseEnums";
import connectDB from "@/app/mongodb/connectors/connectDB";
import paymentClientSecretModel from "@/app/mongodb/models/paymentSecretModel";
import projectModel from "@/app/mongodb/models/projectModel";
import userModel from "@/app/mongodb/models/userModel";
import {
  BASE_URL,
  getRandomId,
  webHookRefreshUrl,
  webHookReturnUrl,
} from "@/app/utils/appUtils";
import { decodeString } from "@/app/utils/auth/authHandlers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  try {
    const request = await req.json();

    if (
      !request.emailId ||
      !request.paymentIntent ||
      !(request?.freelancerEmailId || request?.pricing)
    ) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    try {
      await connectDB("users");

      const paymentIntent = await stripe.paymentIntents.retrieve(
        request?.paymentIntent
      );

      if (paymentIntent.status === "succeeded") {
        await paymentClientSecretModel.findOneAndUpdate(
          { emailId: decodeString(request?.emailId) },
          {
            $pull: {
              clientSecrets: { clientSecret: paymentIntent?.client_secret },
            },
          },
          { new: true }
        );

        if (request?.pricing) {
          await userModel.findOneAndUpdate(
            {
              emailId: decodeString(request?.emailId),
            },
            {
              $set: {
                planDetails: (request?.plan as string)?.toUpperCase() ?? "FREE",
              },
            }
          );
          return NextResponse.json(
            {
              message: paymentEnums?.PAYMENT_SUCCESS,
            },
            {
              status: 200,
            }
          );
        }

        const userData = await userModel?.findOne({
          emailId: request?.freelancerEmailId,
        });

        await userModel?.findOneAndUpdate(
          { emailId: request?.freelancerEmailId },
          {
            $set: {
              amount: userData?.amount + paymentIntent?.amount,
            },
            $push: {
              withdrawalHistory: {
                $each: [
                  {
                    paymentId: getRandomId(),
                    amount: paymentIntent?.amount,
                    date: new Date(),
                    type: "DEPOSIT",
                    status: "COMPLETED",
                  },
                ],
                $position: 0,
              },
            },
          }
        );

        const updatedProject = await projectModel.findOneAndUpdate(
          {
            _id: request?.projectId,
            "milestones._id": request?.milestoneId,
          },
          {
            $set: {
              "milestones.$.status": "RELEASED",
            },
          },
          { new: true }
        );

        const notificationMessage = `
      <div style="font-family: Arial, sans-serif; background-color: #fff; color: #000; padding: 12px; border: 1px solid #ccc; border-radius: 6px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #28a745;">
          Payment Released
        </h3>
        <p style="font-size: 12px; margin-bottom: 8px;">
          A payment has been successfully released for a milestone in your project.
        </p>
        <p style="font-size: 12px;"><strong style="color: #28a745;">Project Title:</strong> ${updatedProject?.title}</p>
        <p style="font-size: 12px;"><strong style="color: #dc3545;">Milestone Amount:</strong> $${paymentIntent?.amount/100}</p>
      </div>
    `;

        // Send notification
        await fetch(BASE_URL + "/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: notificationMessage.trim(),
            receiver: request?.freelancerEmailId,
            emailId: request.emailId,
            project: updatedProject.id,
          }),
        });

        return NextResponse.json(
          {
            message: paymentEnums?.PAYMENT_SUCCESS,
          },
          {
            status: 200,
          }
        );
      } else {
        return NextResponse.json(
          {
            message: paymentIntent?.status,
          },
          {
            status: 200,
          }
        );
      }
    } catch (e) {
      console.log(e);
      return NextResponse.json(
        {
          message: responseEnums?.ERROR,
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}

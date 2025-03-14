"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import clientModel, { userRole } from "../mongodb/models/clientModel";
import freelancerModel, {
  LANGUAGE_ENUM,
} from "../mongodb/models/freelancerModel";
import userModel from "../mongodb/models/userModel";
import { decodeString } from "../utils/auth/authHandlers";
import Stripe from "stripe";

export async function updateProfileImpl(user: {
  emailId: string;
  method: string;
  data: any;
  edit?: any;
}): Promise<{
  status: number;
  message: any;
  data?: any;
}> {
  await connectDB("users");
  const emailId = decodeString(user?.emailId);
  const userData = await userModel.findOne({ emailId });
  if (!userData) {
    return { status: 200, message: userEnums.USER_NOT_FOUND };
  }

  const userAccountModel =
    userData?.role === userRole.FREELANCER ? freelancerModel : clientModel;


  try {
    switch (user?.method) {
      case "profileImage":
        await userModel.updateOne(
          { emailId },
          {
            $set: {
              profile: user?.data?.image,
            },
          }
        );
        break;
      case "name":
        await userModel.updateOne(
          { emailId },
          {
            $set: {
              firstName: user?.data?.firstName,
              lastName: user?.data?.lastName ?? "",
            },
          }
        );
        break;
      case "bank":
        await userModel.updateOne(
          { emailId },
          {
            $set: {
              bankAccountDetails: { token: user?.data?.id },
            },
          }
        );

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
          apiVersion: "2025-01-27.acacia",
        });

        try {
          const response = await stripe.accounts.createExternalAccount(
            userData?.paymentConnectId,
            {
              external_account: userData?.bankAccountDetails?.token,
            }
          );
          console.log("Card account added:", response);
        } catch (error) {
          console.error("Error adding card account:", error);
        }

        break;
      case "online":
        await userModel.updateOne(
          { emailId },
          {
            $set: {
              online: user?.data?.value,
            },
          }
        );
        break;
      case "title":
        if (userData?.role === "CLIENT") {
          await userAccountModel.updateOne(
            { emailId },
            {
              $set: {
                companyName: user?.data?.headline,
                description: user?.data?.summary,
              },
            }
          );
        } else if (userData?.role === "BANK") {
          await userAccountModel.updateOne(
            { emailId },
            {
              $set: {
                bankName: user?.data?.headline,
                description: user?.data?.summary,
              },
            }
          );
        }

        await userAccountModel.updateOne(
          { emailId },
          {
            $set: {
              title: user?.data?.headline,
              description: user?.data?.summary,
            },
          }
        );
        break;

      case "costPerHour":
        await userAccountModel.updateOne(
          { emailId },
          {
            $set: {
              hourlyRate: parseFloat(user?.data?.costPerHour),
            },
          }
        );
        break;

      case "skills":
        await userAccountModel.updateOne(
          { emailId },
          {
            $set: {
              skills: user?.data?.skills,
            },
          }
        );
        break;

      case "languages":
        if (user?.edit) {
          await userAccountModel.updateOne(
            { emailId, "languages._id": user?.data?._id },
            {
              $set: {
                "languages.$.name": user?.data?.name,
                "languages.$.level":
                  user?.data?.level === "basic"
                    ? LANGUAGE_ENUM?.BASIC
                    : user?.data?.level === "fluent"
                    ? LANGUAGE_ENUM?.FLUENT
                    : user?.data?.level === "intermediate"
                    ? LANGUAGE_ENUM.INTERMEDIATE
                    : LANGUAGE_ENUM?.NATIVE,
              },
            }
          );
        } else {
          await userAccountModel.updateOne(
            { emailId },
            {
              $push: {
                languages: {
                  name: user?.data?.language,
                  level:
                    user?.data?.level === "basic"
                      ? LANGUAGE_ENUM?.BASIC
                      : user?.data?.level === "fluent"
                      ? LANGUAGE_ENUM?.FLUENT
                      : user?.data?.level === "intermediate"
                      ? LANGUAGE_ENUM.INTERMEDIATE
                      : LANGUAGE_ENUM?.NATIVE,
                },
              },
            }
          );
        }
        break;
      case "project":
        if (user?.edit) {
          await userAccountModel.updateOne(
            { emailId, "projects._id": user?.data?._id },
            {
              $set: {
                "projects.$.description": user?.data?.description,
                "projects.$.title": user?.data?.title,
              },
            }
          );
        } else {
          await userAccountModel.updateOne(
            { emailId },
            {
              $push: {
                projects: {
                  title: user?.data?.title,
                  description: user?.data?.description,
                },
              },
            }
          );
        }
        break;

      case "employment":
        if (user?.edit) {
          await userAccountModel.updateOne(
            { emailId, "employmentHistory._id": user?.data?._id },
            {
              $set: {
                "employmentHistory.$.companyName": user?.data?.name,
                "employmentHistory.$.startDate": user?.data?.fromDate,
                "employmentHistory.$.endDate": user?.data?.toDate,
                "employmentHistory.$.description": user?.data?.description,
              },
            }
          );
        } else {
          await userAccountModel.updateOne(
            { emailId },
            {
              $push: {
                employmentHistory: {
                  companyName: user?.data?.name,
                  description: user?.data?.description,

                  startDate: user?.data?.fromDate,

                  endDate: user?.data?.toDate,
                },
              },
            }
          );
        }

        break;

      case "education":
        if (user?.edit) {
          await userAccountModel.updateOne(
            { emailId, "educationHistory._id": user?.data?._id },
            {
              $set: {
                "educationHistory.$.name": user?.data?.name,
                "educationHistory.$.startDate": user?.data?.fromDate,
                "educationHistory.$.endDate": user?.data?.toDate,
                "educationHistory.$.description": user?.data?.description,
              },
            }
          );
        } else {
          await userAccountModel.updateOne(
            { emailId },
            {
              $push: {
                educationHistory: {
                  name: user?.data?.name,
                  description: user?.data?.description,

                  startDate: user?.data?.fromDate,

                  endDate: user?.data?.toDate,
                },
              },
            }
          );
        }
        break;
    }
    return {
      status: 200,
      message: responseEnums.SUCCESS,
      data: {
        userData: await userModel.findOne({ emailId }),
        userAccountData: await userAccountModel?.findOne({ emailId }),
      },
    };
  } catch (error) {
    console.log(error);
    return { status: 200, message: responseEnums.ERROR };
  }
}

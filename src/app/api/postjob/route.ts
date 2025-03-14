"use server";

import { exceptionEnums } from "@/app/enums/responseEnums";
import { postJobImpl } from "@/app/impl/postJobImpl";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const request = await req.json();

    if (!request.emailId || !request.title || !request?.description) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }

    const { message, status } = await postJobImpl(request);

    const response = NextResponse.json({ message }, { status });

    return response;
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}

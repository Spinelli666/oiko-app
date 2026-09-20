import { NextResponse } from "next/server";
import * as z from "zod";
import { RegisterSchema } from "@/lib/validation";
import { createUser, DuplicateEmailError } from "@/lib/users";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { errors: z.flattenError(parsed.error).fieldErrors },
      { status: 400 }
    );
  }

  try {
    const user = await createUser(parsed.data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}

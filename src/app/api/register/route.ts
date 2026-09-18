import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { prisma } from "@/lib/prisma";

const RegisterSchema = z.object({
  name: z.string().trim().min(2),
  email: z.email().trim(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { errors: z.flattenError(parsed.error).fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "E-mail já cadastrado." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}

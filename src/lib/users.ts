import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { seedDefaultCategories } from "@/lib/categories";

export class DuplicateEmailError extends Error {}

export async function createUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new DuplicateEmailError("E-mail já cadastrado.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true },
  });

  await seedDefaultCategories(user.id);

  return user;
}

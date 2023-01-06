import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"]) {

  return prisma.user.create({
    data: {
      email,
    },
  });
}

export async function getOrCreateUser(email: User["email"]) {
  let user = await getUserByEmail(email);

  if (user) return user

  return await createUser(email)
}

export async function updateUserProps(email: User["email"], firstName: User["firstName"], lastName: User["lastName"], groups: Groups["name"][]){
  await prisma.user.update({
    where:{ email: email},
    data: {
      firstName: firstName,
      lastName: lastName
    }
  })

  console.log(email, firstName, lastName)
  console.log(groups)
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}


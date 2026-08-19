import { UserModel } from "../modules/users/user.model.js";
import { SchoolModel } from "../modules/schools/school.model.js";
import { ROLES, USER_STATUSES } from "../common/constants/roles.js";
import { hashPassword } from "../common/utils/password.js";
import type { Logger } from "../config/logger.js";

export const DEMO_PASSWORD = "Password12!";

export const DEMO_ACCOUNTS = [
  { email: "demo.admin@sola.local", firstName: "Demo", lastName: "SuperAdmin", role: ROLES.SUPER_ADMIN },
  { email: "demo.schooladmin@sola.local", firstName: "Grace", lastName: "Uwera", role: ROLES.SCHOOL_ADMIN },
  { email: "demo.coordinator@sola.local", firstName: "Eric", lastName: "Niyonzima", role: ROLES.SCHOOL_COORDINATOR },
  { email: "demo.teacher@sola.local", firstName: "Jean", lastName: "Habimana", role: ROLES.TEACHER },
  { email: "demo.student@sola.local", firstName: "Aline", lastName: "Mukamana", role: ROLES.STUDENT },
  { email: "demo.seeker@sola.local", firstName: "Patrick", lastName: "Bizimana", role: ROLES.SERVICE_SEEKER }
] as const;

export async function ensureDemoUsers(logger: Logger): Promise<void> {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  let school = await SchoolModel.findOne({ contactEmail: "demo.school@sola.local" });
  if (!school) {
    school = await SchoolModel.create({
      name: "[DEMO] IPRC Kigali",
      location: "Kigali, Rwanda",
      contactEmail: "demo.school@sola.local",
      status: "ACTIVE"
    });
  }

  for (const account of DEMO_ACCOUNTS) {
    const schoolId =
      account.role === ROLES.SUPER_ADMIN || account.role === ROLES.SERVICE_SEEKER
        ? undefined
        : school._id;

    await UserModel.findOneAndUpdate(
      { email: account.email },
      {
        email: account.email,
        passwordHash,
        firstName: account.firstName,
        lastName: account.lastName,
        role: account.role,
        schoolId,
        status: USER_STATUSES.ACTIVE
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  logger.info("Demo accounts ready (password: Password12!)");
}

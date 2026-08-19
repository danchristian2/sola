import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { connectDatabase, disconnectDatabase } from "./connection.js";
import { loadEnv } from "../config/env.js";
import { createLogger } from "../config/logger.js";
import { UserModel } from "../modules/users/user.model.js";
import { SchoolModel } from "../modules/schools/school.model.js";
import { DepartmentModel } from "../modules/departments/department.model.js";
import { ServiceRequestModel } from "../modules/serviceRequests/serviceRequest.model.js";
import { REQUEST_STATUSES } from "../common/constants/requestStatus.js";
import { REQUEST_CATEGORIES, URGENCY_LEVELS } from "../common/constants/categories.js";
import { InvitationModel } from "../modules/invitations/invitation.model.js";
import { ROLES, USER_STATUSES } from "../common/constants/roles.js";
import { hashPassword } from "../common/utils/password.js";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../../.env") });
dotenv.config();

async function seed() {
  const env = loadEnv();
  const logger = createLogger(env);
  await connectDatabase(env.MONGODB_URI, logger);

  await Promise.all([
    UserModel.deleteMany({}),
    SchoolModel.deleteMany({}),
    DepartmentModel.deleteMany({}),
    InvitationModel.deleteMany({}),
    ServiceRequestModel.deleteMany({}),
    AuditLogModel.deleteMany({})
  ]);

  const school = await SchoolModel.create({
    name: "[DEMO] IPRC Kigali",
    location: "Kigali, Rwanda",
    contactEmail: "demo.school@sola.local",
    contactPhone: "+250 000 000 000",
    status: "ACTIVE"
  });

  const ict = await DepartmentModel.create({
    schoolId: school._id,
    name: "ICT",
    description: "[DEMO] Software and networking",
    skills: ["WEB_DEVELOPMENT", "MOBILE_DEVELOPMENT", "NETWORKING"]
  });
  await DepartmentModel.create({
    schoolId: school._id,
    name: "Electrical",
    description: "[DEMO] Electrical installation and electronics",
    skills: ["ELECTRICAL", "ELECTRONICS"]
  });
  await DepartmentModel.create({
    schoolId: school._id,
    name: "Mechanical",
    description: "[DEMO] Mechanical maintenance",
    skills: ["MECHANICAL", "MANUFACTURING"]
  });

  const passwordHash = await hashPassword("Password12!");

  await UserModel.create({
    email: "demo.admin@sola.local",
    passwordHash,
    firstName: "Demo",
    lastName: "SuperAdmin",
    role: ROLES.SUPER_ADMIN,
    status: USER_STATUSES.ACTIVE
  });

  await UserModel.create({
    email: "demo.schooladmin@sola.local",
    passwordHash,
    firstName: "Grace",
    lastName: "Uwera",
    role: ROLES.SCHOOL_ADMIN,
    schoolId: school._id,
    status: USER_STATUSES.ACTIVE
  });

  await UserModel.create({
    email: "demo.coordinator@sola.local",
    passwordHash,
    firstName: "Eric",
    lastName: "Niyonzima",
    role: ROLES.SCHOOL_COORDINATOR,
    schoolId: school._id,
    status: USER_STATUSES.ACTIVE
  });

  await UserModel.create({
    email: "demo.teacher@sola.local",
    passwordHash,
    firstName: "Jean",
    lastName: "Habimana",
    role: ROLES.TEACHER,
    schoolId: school._id,
    departmentId: ict._id,
    status: USER_STATUSES.ACTIVE
  });

  await UserModel.create({
    email: "demo.student@sola.local",
    passwordHash,
    firstName: "Aline",
    lastName: "Mukamana",
    role: ROLES.STUDENT,
    schoolId: school._id,
    departmentId: ict._id,
    status: USER_STATUSES.ACTIVE
  });

  const seeker = await UserModel.create({
    email: "demo.seeker@sola.local",
    passwordHash,
    firstName: "Patrick",
    lastName: "Bizimana",
    role: ROLES.SERVICE_SEEKER,
    status: USER_STATUSES.ACTIVE
  });

  await ServiceRequestModel.create({
    seekerId: seeker._id,
    schoolId: school._id,
    organization: "[DEMO] Kigali Hardware Shop",
    location: "Nyamirambo",
    problem:
      "[DEMO] Stock is counted by hand every evening and mistakes cause missing items.",
    outcome: "A simple way to record stock in and out each day.",
    whoIsAffected: "Shop attendants and the owner",
    category: REQUEST_CATEGORIES.SOFTWARE,
    urgency: URGENCY_LEVELS.HIGH,
    preferredContact: "demo.seeker@sola.local",
    status: REQUEST_STATUSES.SUBMITTED,
    statusHistory: [
      {
        from: REQUEST_STATUSES.DRAFT,
        to: REQUEST_STATUSES.SUBMITTED,
        actorId: seeker._id,
        at: new Date()
      }
    ]
  });

  logger.info(
    {
      school: school.name,
      password: "Password12!",
      accounts: [
        "demo.admin@sola.local",
        "demo.schooladmin@sola.local",
        "demo.coordinator@sola.local",
        "demo.teacher@sola.local",
        "demo.student@sola.local",
        "demo.seeker@sola.local"
      ]
    },
    "Seeded [DEMO] data. Do not treat this as real impact."
  );

  await disconnectDatabase();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

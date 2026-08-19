import { hashPassword } from "../common/utils/password.js";
import { ROLES, USER_STATUSES } from "../common/constants/roles.js";
import { REQUEST_STATUSES } from "../common/constants/requestStatus.js";
import { REQUEST_CATEGORIES, URGENCY_LEVELS } from "../common/constants/categories.js";
import { initDbFromDisk, loadDb, saveDb, type JsonDoc } from "./db.js";

export const DEMO_PASSWORD = "Password12!";

const SCHOOL_ID = "111111111111111111111111";
const ICT_ID = "222222222222222222222221";
const EL_ID = "222222222222222222222222";
const MECH_ID = "222222222222222222222223";
const ADMIN_ID = "333333333333333333333331";
const SCHOOL_ADMIN_ID = "333333333333333333333332";
const COORD_ID = "333333333333333333333333";
const TEACHER_ID = "333333333333333333333334";
const STUDENT_ID = "333333333333333333333335";
const SEEKER_ID = "333333333333333333333336";

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

export async function bootstrapStore(): Promise<void> {
  initDbFromDisk();
  const db = loadDb();
  if (!db.projects) db.projects = [];
  if (!db.users.some((user) => user.email === "demo.schooladmin@sola.local")) {
    await seedFresh(db);
  }
  ensureWorkflowDemo(db);
  saveDb();
}

function stripDemoLabel(value: unknown) {
  return typeof value === "string" ? value.replace(/^\[DEMO\]\s*/, "") : value;
}

function ensureWorkflowDemo(db: ReturnType<typeof loadDb>) {
  for (const school of db.schools) {
    school.name = stripDemoLabel(school.name) as string;
  }
  for (const request of db.serviceRequests) {
    request.organization = stripDemoLabel(request.organization);
    request.problem = stripDemoLabel(request.problem) as string;
  }
  const admin = db.users.find((user) => user.email === "demo.admin@sola.local");
  if (admin && admin.firstName === "Demo") {
    admin.firstName = "Solange";
    admin.lastName = "Mugabo";
  }
  const ict = db.departments.find((dept) => dept._id === ICT_ID);
  if (ict && Array.isArray(ict.skills) && !ict.skills.includes("SOFTWARE")) {
    ict.skills = ["SOFTWARE", ...(ict.skills as string[])];
  }
  const extraStudents = [
    {
      email: "demo.student2@sola.local",
      firstName: "Divine",
      lastName: "Iradukunda",
      _id: "333333333333333333333337"
    },
    {
      email: "demo.student3@sola.local",
      firstName: "Kevin",
      lastName: "Mugisha",
      _id: "333333333333333333333338"
    }
  ];
  const now = new Date().toISOString();
  for (const person of extraStudents) {
    if (db.users.some((user) => user.email === person.email)) continue;
    db.users.push({
      _id: person._id,
      email: person.email,
      passwordHash: db.users.find((user) => user.email === "demo.student@sola.local")?.passwordHash,
      firstName: person.firstName,
      lastName: person.lastName,
      role: ROLES.STUDENT,
      schoolId: SCHOOL_ID,
      departmentId: ICT_ID,
      status: USER_STATUSES.ACTIVE,
      createdAt: daysAgo(50),
      updatedAt: now
    });
  }

  if (!db.projects.some((project) => project._id === "666666666666666666666601")) {
    db.projects.push({
      _id: "666666666666666666666601",
      requestId: "444444444444444444444404",
      schoolId: SCHOOL_ID,
      departmentId: ICT_ID,
      teacherId: TEACHER_ID,
      title: "Visitor log for Kimisagara Secondary",
      stage: "COMPLETED",
      team: [
        { userId: STUDENT_ID, name: "Aline Mukamana", teamRole: "FRONTEND" },
        { userId: "333333333333333333333337", name: "Divine Iradukunda", teamRole: "BACKEND" }
      ],
      tasks: [
        { id: "777777777777777777777701", title: "Talk to the gate staff", status: "DONE", milestone: "INVESTIGATE" },
        { id: "777777777777777777777702", title: "Build the daily printout", status: "DONE", milestone: "BUILD" }
      ],
      evidence: [{ note: "Printed visitor sheet used at the gate for one week.", at: daysAgo(20) }],
      feedback: [
        {
          comment: "The printout is what we needed. Staff no longer lose the paper book.",
          works: "Daily report",
          needsChange: "",
          at: daysAgo(22)
        }
      ],
      impact: {
        before: "Visitors were written in a paper book. The office could not produce a daily list.",
        after: "A visitor log prints a daily report for the office.",
        timeSaved: "About 40 minutes per day at the gate",
        peopleHelped: "Gate staff and school office",
        satisfaction: "School office accepted the delivery"
      },
      createdAt: daysAgo(40),
      updatedAt: now
    });
  }
}

async function seedFresh(db: ReturnType<typeof loadDb>): Promise<void> {

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const now = new Date().toISOString();

  db.schools = [
    {
      _id: SCHOOL_ID,
      name: "IPRC Kigali",
      location: "Kigali, Rwanda",
      contactEmail: "demo.school@sola.local",
      contactPhone: "+250 788 000 000",
      status: "ACTIVE",
      createdAt: daysAgo(120),
      updatedAt: now
    }
  ];

  db.departments = [
    {
      _id: ICT_ID,
      schoolId: SCHOOL_ID,
      name: "ICT",
      description: "Software, web, networking and automation",
      skills: ["SOFTWARE", "WEB_DEVELOPMENT", "MOBILE_DEVELOPMENT", "NETWORKING"],
      isActive: true,
      createdAt: daysAgo(100),
      updatedAt: now
    },
    {
      _id: EL_ID,
      schoolId: SCHOOL_ID,
      name: "Electrical",
      description: "Electrical installation and electronics",
      skills: ["ELECTRICAL", "ELECTRONICS"],
      isActive: true,
      createdAt: daysAgo(100),
      updatedAt: now
    },
    {
      _id: MECH_ID,
      schoolId: SCHOOL_ID,
      name: "Mechanical",
      description: "Mechanical maintenance and manufacturing",
      skills: ["MECHANICAL", "MANUFACTURING"],
      isActive: true,
      createdAt: daysAgo(100),
      updatedAt: now
    }
  ];

  db.users = [
    {
      _id: ADMIN_ID,
      email: "demo.admin@sola.local",
      passwordHash,
      firstName: "Solange",
      lastName: "Mugabo",
      role: ROLES.SUPER_ADMIN,
      status: USER_STATUSES.ACTIVE,
      createdAt: daysAgo(120),
      updatedAt: now
    },
    {
      _id: SCHOOL_ADMIN_ID,
      email: "demo.schooladmin@sola.local",
      passwordHash,
      firstName: "Grace",
      lastName: "Uwera",
      role: ROLES.SCHOOL_ADMIN,
      schoolId: SCHOOL_ID,
      status: USER_STATUSES.ACTIVE,
      createdAt: daysAgo(90),
      updatedAt: now
    },
    {
      _id: COORD_ID,
      email: "demo.coordinator@sola.local",
      passwordHash,
      firstName: "Eric",
      lastName: "Niyonzima",
      role: ROLES.SCHOOL_COORDINATOR,
      schoolId: SCHOOL_ID,
      status: USER_STATUSES.ACTIVE,
      createdAt: daysAgo(80),
      updatedAt: now
    },
    {
      _id: TEACHER_ID,
      email: "demo.teacher@sola.local",
      passwordHash,
      firstName: "Jean",
      lastName: "Habimana",
      role: ROLES.TEACHER,
      schoolId: SCHOOL_ID,
      departmentId: ICT_ID,
      status: USER_STATUSES.ACTIVE,
      createdAt: daysAgo(70),
      updatedAt: now
    },
    {
      _id: STUDENT_ID,
      email: "demo.student@sola.local",
      passwordHash,
      firstName: "Aline",
      lastName: "Mukamana",
      role: ROLES.STUDENT,
      schoolId: SCHOOL_ID,
      departmentId: ICT_ID,
      status: USER_STATUSES.ACTIVE,
      createdAt: daysAgo(60),
      updatedAt: now
    },
    {
      _id: SEEKER_ID,
      email: "demo.seeker@sola.local",
      passwordHash,
      firstName: "Patrick",
      lastName: "Bizimana",
      role: ROLES.SERVICE_SEEKER,
      status: USER_STATUSES.ACTIVE,
      createdAt: daysAgo(40),
      updatedAt: now
    }
  ];

  const requestSeeds: Array<{
    problem: string;
    outcome: string;
    category: string;
    urgency: string;
    status: string;
    days: number;
    org: string;
  }> = [
    {
      problem: "Stock is counted by hand every evening and items go missing.",
      outcome: "A simple stock in/out register for shop attendants.",
      category: REQUEST_CATEGORIES.SOFTWARE,
      urgency: URGENCY_LEVELS.HIGH,
      status: REQUEST_STATUSES.IN_PROGRESS,
      days: 18,
      org: "Kigali Hardware Shop"
    },
    {
      problem: "The workshop lights fail during evening practicals.",
      outcome: "Stable lighting and a maintenance checklist.",
      category: REQUEST_CATEGORIES.ELECTRICAL,
      urgency: URGENCY_LEVELS.URGENT,
      status: REQUEST_STATUSES.TESTING,
      days: 12,
      org: "Nyamirambo Vocational Hub"
    },
    {
      problem: "Farmers lose milk because cooling is unreliable.",
      outcome: "A small cooling monitor with alerts.",
      category: REQUEST_CATEGORIES.ELECTRONICS,
      urgency: URGENCY_LEVELS.HIGH,
      status: REQUEST_STATUSES.AWAITING_CLIENT_FEEDBACK,
      days: 9,
      org: "Gasabo Dairy Cooperative"
    },
    {
      problem: "The school gate still uses a paper visitor book.",
      outcome: "A visitor log that prints a daily report.",
      category: REQUEST_CATEGORIES.WEB_DEVELOPMENT,
      urgency: URGENCY_LEVELS.NORMAL,
      status: REQUEST_STATUSES.COMPLETED,
      days: 45,
      org: "Kimisagara Secondary"
    },
    {
      problem: "Irrigation valves are opened by guesswork.",
      outcome: "A timed valve schedule for two greenhouse bays.",
      category: REQUEST_CATEGORIES.AUTOMATION,
      urgency: URGENCY_LEVELS.NORMAL,
      status: REQUEST_STATUSES.UNDER_REVIEW,
      days: 3,
      org: "Rwamagana Agri Park"
    },
    {
      problem: "Parents cannot see fee balances without visiting the office.",
      outcome: "A simple balance SMS for the accountant.",
      category: REQUEST_CATEGORIES.SOFTWARE,
      urgency: URGENCY_LEVELS.LOW,
      status: REQUEST_STATUSES.SUBMITTED,
      days: 1,
      org: "Gisozi Parents Association"
    },
    {
      problem: "Welding bay ventilation is weak and smoke stays in the room.",
      outcome: "Improved extraction and a safety poster set.",
      category: REQUEST_CATEGORIES.MECHANICAL,
      urgency: URGENCY_LEVELS.HIGH,
      status: REQUEST_STATUSES.ASSIGNED,
      days: 6,
      org: "Kicukiro Metal Works"
    },
    {
      problem: "Solar lamps in the dormitory die after two hours.",
      outcome: "Battery check process and replacement plan.",
      category: REQUEST_CATEGORIES.ENERGY,
      urgency: URGENCY_LEVELS.NORMAL,
      status: REQUEST_STATUSES.DELIVERED,
      days: 28,
      org: "Huye Boarding House"
    }
  ];

  db.serviceRequests = requestSeeds.map((item, index) => ({
    _id: `4444444444444444444444${String(index + 1).padStart(2, "0")}`,
    seekerId: SEEKER_ID,
    schoolId: SCHOOL_ID,
    departmentId: item.category === REQUEST_CATEGORIES.ELECTRICAL ? EL_ID : ICT_ID,
    organization: item.org,
    location: "Kigali",
    problem: item.problem,
    outcome: item.outcome,
    whoIsAffected: "Staff and surrounding community",
    category: item.category,
    urgency: item.urgency,
    preferredContact: "demo.seeker@sola.local",
    status: item.status,
    statusHistory: [
      {
        from: REQUEST_STATUSES.DRAFT,
        to: item.status,
        actorId: SEEKER_ID,
        at: daysAgo(item.days)
      }
    ],
    createdAt: daysAgo(item.days),
    updatedAt: now
  })) as JsonDoc[];

  db.partnerships = [
    {
      _id: "555555555555555555555551",
      schoolName: "IPRC Tumba",
      location: "Ruhango",
      contactEmail: "partnerships@tumba.rw",
      adminFirstName: "Claudine",
      adminLastName: "Mukamana",
      adminEmail: "claudine.tumba@example.com",
      message: "We want community electronics repairs to become student projects.",
      status: "SUBMITTED",
      createdAt: daysAgo(2),
      updatedAt: now
    }
  ];

  db.invitations = [];
  db.audits = [];
  db.projects = db.projects ?? [];
  saveDb();
}

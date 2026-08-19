import { SchoolModel, SCHOOL_STATUSES } from "../schools/school.model.js";
import { DepartmentModel } from "../departments/department.model.js";
import { idOf } from "../../store/db.js";

const SKILL_GROUPS: string[][] = [
  ["SOFTWARE", "WEB_DEVELOPMENT", "MOBILE_DEVELOPMENT", "NETWORKING", "DESIGN"],
  ["ELECTRICAL", "ELECTRONICS", "ENERGY", "AUTOMATION"],
  ["MECHANICAL", "MANUFACTURING"],
  ["AGRICULTURE"],
  ["CONSTRUCTION"]
];

export function relatedSkills(category: string): string[] {
  if (category === "OTHER") {
    return SKILL_GROUPS.find((item) => item.includes("SOFTWARE")) ?? ["SOFTWARE"];
  }
  const group = SKILL_GROUPS.find((item) => item.includes(category));
  return group ?? [category];
}

export async function matchSchoolForCategory(category: string): Promise<{
  schoolId: string;
  departmentId: string;
  schoolName: string;
  departmentName: string;
  reason: string;
} | null> {
  const needed = relatedSkills(category);
  const schools = await SchoolModel.find({ status: SCHOOL_STATUSES.ACTIVE });
  const departments = await DepartmentModel.find({ isActive: true });

  for (const school of schools) {
    const schoolId = idOf(school._id);
    const match = departments.find((dept) => {
      if (idOf(dept.schoolId) !== schoolId) return false;
      const skills = (dept.skills as string[]) ?? [];
      return skills.some((skill) => needed.includes(skill) || skill === category);
    });
    if (match) {
      return {
        schoolId,
        departmentId: idOf(match._id),
        schoolName: String(school.name),
        departmentName: String(match.name),
        reason: `${match.name} · ${school.name}`
      };
    }
  }
  return null;
}

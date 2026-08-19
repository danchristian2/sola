export function publicSchool(school: {
  _id: { toString(): string };
  name: string;
  location?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status: string;
  createdAt: Date | string;
}) {
  return {
    id: school._id.toString(),
    name: school.name,
    location: school.location ?? null,
    contactEmail: school.contactEmail ?? null,
    contactPhone: school.contactPhone ?? null,
    status: school.status,
    createdAt: school.createdAt
  };
}

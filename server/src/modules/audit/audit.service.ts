import { AuditLogModel } from "./audit.model.js";

export async function writeAudit(entry: {
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  schoolId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await AuditLogModel.create({
    actorId: entry.actorId,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    schoolId: entry.schoolId,
    metadata: entry.metadata
  });
}

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const here = path.dirname(fileURLToPath(import.meta.url));
export const DATA_FILE = path.resolve(here, "../../data/sola.json");

export type JsonDoc = Record<string, unknown> & { _id: string };

export interface DatabaseShape {
  users: JsonDoc[];
  schools: JsonDoc[];
  departments: JsonDoc[];
  invitations: JsonDoc[];
  audits: JsonDoc[];
  partnerships: JsonDoc[];
  serviceRequests: JsonDoc[];
  projects: JsonDoc[];
}

const emptyDb = (): DatabaseShape => ({
  users: [],
  schools: [],
  departments: [],
  invitations: [],
  audits: [],
  partnerships: [],
  serviceRequests: [],
  projects: []
});

let db: DatabaseShape = emptyDb();

export function newId(): string {
  return crypto.randomBytes(12).toString("hex");
}

export function idOf(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "toString" in value) {
    return String((value as { toString: () => string }).toString());
  }
  return String(value);
}

export function loadDb(): DatabaseShape {
  return db;
}

export function saveDb(): void {
  if (process.env.NODE_ENV === "test") return;
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

export function resetDb(next: DatabaseShape = emptyDb()): void {
  db = next;
  saveDb();
}

export function initDbFromDisk(): void {
  if (process.env.NODE_ENV === "test") {
    db = emptyDb();
    return;
  }
  if (fs.existsSync(DATA_FILE)) {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as Partial<DatabaseShape>;
    db = { ...emptyDb(), ...parsed };
  } else {
    db = emptyDb();
    saveDb();
  }
}

function matches(doc: JsonDoc, query: Record<string, unknown> = {}): boolean {
  return Object.entries(query).every(([key, expected]) => {
    const actual = key === "_id" ? doc._id : doc[key];
    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
      const ops = expected as Record<string, unknown>;
      if ("$gt" in ops) return new Date(String(actual)) > new Date(String(ops.$gt));
      if ("$in" in ops) {
        return (ops.$in as unknown[]).some((item) => idOf(item) === idOf(actual));
      }
      return idOf(actual) === idOf(expected);
    }
    if (typeof expected === "boolean") return actual === expected;
    return idOf(actual) === idOf(expected);
  });
}

function wrap(raw: JsonDoc) {
  const asId = (value: unknown) =>
    value == null || value === ""
      ? undefined
      : { toString: () => idOf(value), toJSON: () => idOf(value) };

  const doc: Record<string, unknown> = {
    ...raw,
    _id: asId(raw._id),
    schoolId: asId(raw.schoolId),
    departmentId: asId(raw.departmentId),
    seekerId: asId(raw.seekerId),
    teacherId: asId(raw.teacherId),
    requestId: asId(raw.requestId),
    assigneeId: asId(raw.assigneeId),
    userId: asId(raw.userId),
    invitedBy: asId(raw.invitedBy),
    actorId: asId(raw.actorId),
    createdAt: raw.createdAt ? new Date(String(raw.createdAt)) : new Date(),
    updatedAt: raw.updatedAt ? new Date(String(raw.updatedAt)) : new Date(),
    passwordResetExpiresAt: raw.passwordResetExpiresAt
      ? new Date(String(raw.passwordResetExpiresAt))
      : undefined,
    lastLoginAt: raw.lastLoginAt ? new Date(String(raw.lastLoginAt)) : undefined,
    expiresAt: raw.expiresAt ? new Date(String(raw.expiresAt)) : undefined,
    acceptedAt: raw.acceptedAt ? new Date(String(raw.acceptedAt)) : undefined
  };

  Object.defineProperty(doc, "id", { get: () => raw._id, enumerable: true });
  (doc as { save: () => Promise<typeof doc> }).save = async () => {
    const collectionName = (doc as { __col?: keyof DatabaseShape }).__col;
    if (!collectionName) return doc;
    const idx = db[collectionName].findIndex((row) => row._id === raw._id);
    const next: JsonDoc = { ...raw };
    for (const [key, value] of Object.entries(doc)) {
      if (key === "save" || key === "id" || key === "__col") continue;
      if (Array.isArray(value)) {
        next[key] = value;
      } else if (value instanceof Date) {
        next[key] = value.toISOString();
      } else if (value && typeof value === "object" && "toString" in (value as object)) {
        next[key] = idOf(value);
      } else {
        next[key] = value as JsonDoc[string];
      }
    }
    next._id = raw._id;
    if (idx >= 0) db[collectionName][idx] = next;
    saveDb();
    return doc;
  };
  return doc;
}

export function collection(name: keyof DatabaseShape) {
  const attach = (raw: JsonDoc) => {
    const doc = wrap(raw) as Record<string, unknown> & { __col: keyof DatabaseShape };
    doc.__col = name;
    return doc;
  };

  return {
    async create(input: Record<string, unknown>) {
      const now = new Date().toISOString();
      const raw: JsonDoc = {
        ...input,
        _id: idOf(input._id) || newId(),
        createdAt: input.createdAt ?? now,
        updatedAt: now
      };
      for (const key of Object.keys(raw)) {
        const value = raw[key];
        if (value && typeof value === "object" && "toString" in value && !(value instanceof Date) && !Array.isArray(value)) {
          raw[key] = idOf(value);
        }
        if (value instanceof Date) raw[key] = value.toISOString();
      }
      db[name].push(raw);
      saveDb();
      return attach(raw);
    },
    find(query: Record<string, unknown> = {}) {
      let rows = db[name].filter((doc) => matches(doc, query));
      const chain = {
        sort(spec: Record<string, number>) {
          const [key, dir] = Object.entries(spec)[0] ?? ["createdAt", -1];
          rows = [...rows].sort((a, b) => {
            const av = String(a[key] ?? "");
            const bv = String(b[key] ?? "");
            return dir < 0 ? bv.localeCompare(av) : av.localeCompare(bv);
          });
          return chain;
        },
        skip(n: number) {
          rows = rows.slice(n);
          return chain;
        },
        limit(n: number) {
          rows = rows.slice(0, n);
          return chain;
        },
        select() {
          return chain;
        },
        lean() {
          return chain;
        },
        then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
          return Promise.resolve(rows.map(attach)).then(resolve, reject);
        }
      };
      return chain;
    },
    findOne(query: Record<string, unknown>) {
      const found = db[name].find((doc) => matches(doc, query));
      const doc = found ? attach(found) : null;
      const chain = {
        select() {
          return chain;
        },
        lean() {
          return chain;
        },
        then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
          return Promise.resolve(doc).then(resolve, reject);
        }
      };
      return chain;
    },
    findById(id: string) {
      return this.findOne({ _id: idOf(id) });
    },
    async findByIdAndUpdate(id: string, update: Record<string, unknown>, opts?: { new?: boolean }) {
      return this.findOneAndUpdate({ _id: idOf(id) }, update, opts);
    },
    async findOneAndUpdate(
      query: Record<string, unknown>,
      update: Record<string, unknown>,
      opts?: { new?: boolean }
    ) {
      const idx = db[name].findIndex((doc) => matches(doc, query));
      if (idx < 0) return null;
      const merged: JsonDoc = {
        ...db[name][idx],
        ...update,
        _id: db[name][idx]._id,
        updatedAt: new Date().toISOString()
      };
      for (const key of Object.keys(merged)) {
        const value = merged[key];
        if (value && typeof value === "object" && "toString" in value && !(value instanceof Date) && !Array.isArray(value)) {
          merged[key] = idOf(value);
        }
      }
      db[name][idx] = merged;
      saveDb();
      return opts?.new === false ? attach(db[name][idx]) : attach(merged);
    },
    async updateOne(query: Record<string, unknown>, update: Record<string, unknown>) {
      await this.findOneAndUpdate(query, update, { new: true });
      return { acknowledged: true };
    },
    async deleteOne(query: Record<string, unknown>) {
      const idx = db[name].findIndex((doc) => matches(doc, query));
      if (idx >= 0) db[name].splice(idx, 1);
      saveDb();
    },
    async deleteMany(query: Record<string, unknown> = {}) {
      db[name] = db[name].filter((doc) => !matches(doc, query));
      saveDb();
    },
    async countDocuments(query: Record<string, unknown> = {}) {
      return db[name].filter((doc) => matches(doc, query)).length;
    }
  };
}

export function allRows<K extends keyof DatabaseShape>(name: K): JsonDoc[] {
  return db[name];
}

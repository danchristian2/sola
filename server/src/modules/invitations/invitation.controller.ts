import type { Request, Response } from "express";
import type { Env } from "../../config/env.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../common/utils/http.js";
import { setAuthCookie } from "../../common/utils/cookies.js";
import { objectIdSchema } from "../../common/utils/pagination.js";
import { InvitationService } from "./invitation.service.js";
import { acceptInvitationSchema, createInvitationSchema } from "./invitation.schema.js";

export function createInvitationController(env: Env) {
  const invitations = new InvitationService(env);
  const revealToken = env.NODE_ENV !== "production";

  return {
    create: asyncHandler(async (req: Request, res: Response) => {
      const schoolId = objectIdSchema.parse(req.params.schoolId);
      const input = createInvitationSchema.parse(req.body);
      const result = await invitations.create(req.authUser!, schoolId, input, revealToken);
      return sendCreated(res, result, "Invitation created");
    }),

    list: asyncHandler(async (req: Request, res: Response) => {
      const schoolId = objectIdSchema.parse(req.params.schoolId);
      const data = await invitations.list(req.authUser!, schoolId, req.query);
      return sendSuccess(res, data);
    }),

    revoke: asyncHandler(async (req: Request, res: Response) => {
      const schoolId = objectIdSchema.parse(req.params.schoolId);
      const id = objectIdSchema.parse(req.params.id);
      const invitation = await invitations.revoke(req.authUser!, schoolId, id);
      return sendSuccess(res, { invitation }, "Invitation revoked");
    }),

    accept: asyncHandler(async (req: Request, res: Response) => {
      const input = acceptInvitationSchema.parse(req.body);
      const { user, token } = await invitations.accept(input);
      setAuthCookie(res, env, token);
      return sendSuccess(res, { user }, "Invitation accepted");
    })
  };
}

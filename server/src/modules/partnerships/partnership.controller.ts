import type { Request, Response } from "express";
import type { Env } from "../../config/env.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../common/utils/http.js";
import { objectIdSchema } from "../../common/utils/pagination.js";
import { PartnershipService } from "./partnership.service.js";
import { applyPartnershipSchema, reviewPartnershipSchema } from "./partnership.schema.js";

export function createPartnershipController(env: Env) {
  const partnerships = new PartnershipService(env);

  return {
    apply: asyncHandler(async (req: Request, res: Response) => {
      const input = applyPartnershipSchema.parse(req.body);
      const application = await partnerships.apply(input);
      return sendCreated(
        res,
        { application },
        "Partnership request submitted. SOLA will review it before inviting your school."
      );
    }),

    list: asyncHandler(async (req: Request, res: Response) => {
      const data = await partnerships.list(req.authUser!, req.query);
      return sendSuccess(res, data);
    }),

    approve: asyncHandler(async (req: Request, res: Response) => {
      const id = objectIdSchema.parse(req.params.id);
      const { note } = reviewPartnershipSchema.parse(req.body ?? {});
      const result = await partnerships.approve(req.authUser!, id, note);
      return sendSuccess(res, result, "School approved and administrator invited");
    }),

    reject: asyncHandler(async (req: Request, res: Response) => {
      const id = objectIdSchema.parse(req.params.id);
      const { note } = reviewPartnershipSchema.parse(req.body ?? {});
      const application = await partnerships.reject(req.authUser!, id, note);
      return sendSuccess(res, { application }, "Partnership request rejected");
    })
  };
}

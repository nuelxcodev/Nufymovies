import mongoose from "mongoose";
import { Review } from "@/lib/models";
import { ok, fail, readJson } from "@/lib/http";
import { guard } from "@/lib/session";

export async function PATCH(req, { params }) {
  const denied = await guard();
  if (denied) return denied;
  if (!mongoose.isValidObjectId(params.id)) return fail("Invalid id", 400);
  const { hidden } = await readJson(req);
  await Review.updateOne({ _id: params.id }, { hidden: Boolean(hidden) });
  return ok();
}

export async function DELETE(_req, { params }) {
  const denied = await guard();
  if (denied) return denied;
  if (!mongoose.isValidObjectId(params.id)) return fail("Invalid id", 400);
  await Review.deleteOne({ _id: params.id });
  return ok();
}

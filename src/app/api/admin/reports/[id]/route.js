import mongoose from "mongoose";
import { Report } from "@/lib/models";
import { ok, fail, readJson } from "@/lib/http";
import { guard } from "@/lib/session";

export async function PATCH(req, { params }) {
  const denied = await guard();
  if (denied) return denied;
  if (!mongoose.isValidObjectId(params.id)) return fail("Invalid id", 400);
  const { status } = await readJson(req);
  await Report.updateOne({ _id: params.id }, { status: status === "open" ? "open" : "resolved" });
  return ok();
}

export async function DELETE(_req, { params }) {
  const denied = await guard();
  if (denied) return denied;
  if (!mongoose.isValidObjectId(params.id)) return fail("Invalid id", 400);
  await Report.deleteOne({ _id: params.id });
  return ok();
}

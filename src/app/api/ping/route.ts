import { db } from "@/db";
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = { mySql: "error", redis: "error" };

  // mySql ping
  try {
    const ping = await db.ping.findFirst();

    if (ping) {
      await db.ping.update({
        where: { id: ping.id },
        data: { updatedAt: new Date() },
      });
    } else {
      await db.ping.create({
        data: {},
      });
    }

    results.mySql = "ok";
  } catch (error) {
    console.error("MySQL ping failed:", error);
  }

  // redis ping
  try {
    await redis.set("ping:timestamp", new Date().toISOString());
    results.redis = "ok";
  } catch (error) {
    console.error("Redis ping failed:", error);
  }

  const allOk = results.mySql === "ok" && results.redis === "ok";

  return NextResponse.json(
    { status: allOk ? "ok" : "partial", services: results },
    { status: allOk ? 200 : 503 }
  );
}

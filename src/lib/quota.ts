import { db } from "@/db";

/*
  Number of files the user has uploaded in the current (UTC) month
*/
export const getMonthlyFileCount = (userId: string) => {
  const monthStart = new Date();

  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  return db.file.count({
    where: { userId, createdAt: { gte: monthStart } },
  });
};

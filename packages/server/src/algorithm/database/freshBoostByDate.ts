import { Column, sql } from "drizzle-orm";
import { caseWhen } from "../../database/custom/dcase";
import { gtInterval } from "./gtInterval";
import { FRESHNESS_POST_WEIGHT } from "../weights";
import { when } from "../../database/custom/when";

export const freshBoostByDate = (column: Column, hours = 24) => {
  return caseWhen([when(gtInterval(column, hours), FRESHNESS_POST_WEIGHT)]);
};

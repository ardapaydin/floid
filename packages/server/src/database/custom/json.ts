import { customType } from "drizzle-orm/mysql-core";

export const customJson = <T>(name: string) =>
  customType<{ data: T; driverData: string }>({
    dataType() {
      return "json";
    },
    toDriver(value: T) {
      return JSON.stringify(value);
    },
    fromDriver(value: string) {
      return JSON.parse(value);
    },
  })(name);

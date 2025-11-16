import { usersTable } from "../../../database";

export default {
  id: usersTable.id,
  username: usersTable.username,
  profilePicture: usersTable.profilePicture,
  displayName: usersTable.displayName,
  createdAt: usersTable.createdAt,
  updatedAt: usersTable.updatedAt,
};

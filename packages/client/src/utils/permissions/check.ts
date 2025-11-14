import permissions from "./permissions";

export default function hasPermission(userPermissions: string, find: string) {
  const permission = permissions.get(find);
  return Boolean(BigInt(userPermissions ?? "0") & (permission ?? 0n));
}

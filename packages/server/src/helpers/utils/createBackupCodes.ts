export function createBackupCodes() {
  const codes = [];
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    let code = "";
    for (let c = 0; c < 12; c++)
      code += chars[Math.floor(Math.random() * chars.length)];
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`);
  }
  return codes;
}

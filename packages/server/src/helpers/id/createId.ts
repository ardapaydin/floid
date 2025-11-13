export default () => {
  const ch = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let now = Date.now();

  let id = "";
  while (now > 0) {
    id = ch[now % 62] + id;
    now = Math.floor(now / 62);
  }
  return id;
};

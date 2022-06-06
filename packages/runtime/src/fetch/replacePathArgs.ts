export function replacePathArgs(url: string, args: {}): string {
  return url
    .split("/")
    .reduce((prev, curr) => {
      if (curr.startsWith("[")) {
        const key = curr.slice(1, curr.length - 1);
        const arg = (args as any)[key];
        delete args[key];
        prev.push(arg);
      } else {
        prev.push(curr);
      }
      return prev;
    }, [] as string[])
    .join("/");
}

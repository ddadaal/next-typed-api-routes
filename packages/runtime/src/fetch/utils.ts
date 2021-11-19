export function removeNullOrUndefinedKey<T extends object>(object: T): T {
  for (const key in object) {
    if (object[key] === undefined || object[key] === null) {
      delete object[key];
    }
  }
  return object;
}

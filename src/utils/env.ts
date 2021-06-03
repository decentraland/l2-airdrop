export function requiredEnv(name: string) {
  var value = process.env[name];
  if (!value) {
      throw new Error("Missing \"" + name + "\" environment variable. Check your .env file");
  }

  return value;
}
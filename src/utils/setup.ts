export function requiredEnv(name: string) {
  var value = process.env[name];
  if (!value) {
      throw new Error("Missing \"" + name + "\" environment variable. Check your .env file");
  }

  return value;
}

export function logError(err: Error) {
  console.log()
  console.log(' '.repeat(3), err.message)
  console.log()
}

process.on('uncaughtException', (err: Error) => {
  logError(err)
  process.exit(1)
});

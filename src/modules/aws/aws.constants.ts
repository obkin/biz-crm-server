export const MAX_FILE_SIZE = !isNaN(Number(process.env.MAX_FILE_SIZE))
  ? Number(process.env.MAX_FILE_SIZE) * 1024 * 1024
  : 10 * 1024 * 1024; // default: 10MB

const { Client } = require("ssh2");

function normalizeKey(raw) {
  let key = raw ?? "";
  key = key.replace(/^\uFEFF/, "");
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!key.includes("\n") && key.includes("\\n")) {
    key = key.replace(/\\n/g, "\n");
  }
  if (!key.endsWith("\n")) key += "\n";
  return key;
}

const command = process.argv[2];
if (!command) {
  console.error("usage: node ssh-meti-cmd.cjs METI_BACKUP|METI_RESTORE");
  process.exit(2);
}

const key = normalizeKey(process.env.PRODUCTION_SSH_KEY);
process.stderr.write(
  `SSH key: ${key.length} chars, ${key.split("\n").length} lines, first=${key.charCodeAt(0)}\n`
);

const conn = new Client();
const chunks = [];
const errChunks = [];

conn
  .on("ready", () => {
    conn.exec(command, (error, stream) => {
      if (error) {
        console.error(error);
        process.exit(1);
      }
      if (!process.stdin.isTTY) {
        process.stdin.pipe(stream);
      }
      stream.on("data", (data) => chunks.push(data));
      stream.stderr.on("data", (data) => errChunks.push(data));
      stream.on("close", (exitCode) => {
        conn.end();
        if (errChunks.length) process.stderr.write(Buffer.concat(errChunks));
        if (chunks.length) process.stdout.write(Buffer.concat(chunks));
        process.exit(exitCode ?? 1);
      });
    });
  })
  .on("error", (error) => {
    console.error(error);
    process.exit(1);
  })
  .connect({
    host: process.env.PRODUCTION_HOST,
    username: process.env.PRODUCTION_USER,
    privateKey: key,
    readyTimeout: 30000,
  });

import crypto from "crypto";

const algorithm = "aes-256-cbc"; // Using AES with a 256-bit key and CBC mode

export function encrypt(text, key) {
  if (key.length !== 32) {
    throw new Error("Invalid key length. Key must be 32 characters long.");
  }

  const iv = crypto.randomBytes(16); // Generate a random initialization vector
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return `${iv.toString("base64")}:${encrypted}`; // Return the IV and encrypted data
}

export function decrypt(encrypted, key) {
  const [iv, data] = encrypted
    .split(":")
    .map((part) => Buffer.from(part, "base64"));
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(data, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

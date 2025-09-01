import crypto from "crypto";

// Encrypt password using AES
function encryptPassword(password, secretKey) {
  // Ensure secretKey is exactly 32 bytes long by hashing it
  const hashedKey = crypto
    .createHash("sha256")
    .update(secretKey)
    .digest("hex")
    .slice(0, 32);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    hashedKey,
    Buffer.alloc(16)
  );
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// Decrypt password using AES
function decryptPassword(encryptedPassword, secretKey) {
  // Ensure secretKey is exactly 32 bytes long by hashing it
  const hashedKey = crypto
    .createHash("sha256")
    .update(secretKey)
    .digest("hex")
    .slice(0, 32);

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    hashedKey,
    Buffer.alloc(16)
  );
  let decrypted = decipher.update(encryptedPassword, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Compare original password with decrypted password
function comparePasswords(originalPassword, encryptedPassword, secretKey) {
  const decryptedPassword = decryptPassword(encryptedPassword, secretKey);
//   console.log('decryptedPassword:', decryptedPassword)
  
  return originalPassword === decryptedPassword;
}
// Compare original password with decrypted password
function Passwords(originalPassword, encryptedPassword, secretKey) {

  const decryptedPassword = decryptPassword(encryptedPassword, secretKey);
  console.log('decryptedPassword:', decryptedPassword)
  console.log('originalPassword,encryptedPassword,secretKey:', originalPassword,encryptedPassword,secretKey)
  
  return originalPassword === decryptedPassword;
}

// Passwords("ok","45ca1abacb07669959b4217ff7f39a38","elaiya")
export { encryptPassword, decryptPassword, comparePasswords };

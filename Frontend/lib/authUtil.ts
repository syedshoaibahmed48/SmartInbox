import jwt from "jsonwebtoken";
import { createHash, randomBytes, createCipheriv, createDecipheriv } from "crypto";

const ALGORITHM = "aes-256-gcm"; // Authenticated encryption
const ENCRYPTION_KEY = createHash("sha256").update(String(process.env.SID_ENCRYPTION_SECRET)).digest();
const IV_LENGTH = 16;

function encryptSid(sid: string) {

    // Generate a random IV, create a cipher
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    // Combine IV, tag, and encrypted data into a single buffer, create a tag, then encode as base64url
    const encrypted = Buffer.concat([cipher.update(sid, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function decryptSid(encryptedSid: string) {

    // Decode the base64url string
    const data = Buffer.from(encryptedSid, "base64url");

    // Extract the IV, tag, and encrypted data
    const iv = data.subarray(0, IV_LENGTH);
    const tag = data.subarray(IV_LENGTH, IV_LENGTH + 16);
    const encrypted = data.subarray(IV_LENGTH + 16);

    // Decrypt the data
    const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
}


export function generateJwt(sid: string) {
    // Create a JWT with the session ID
    const encryptedSid = encryptSid(sid);
    const token = jwt.sign({ sid: encryptedSid }, process.env.JWT_SECRET!);
    return token;
}

export function decodeJwt(token: string) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sid: string };
        const sid = decryptSid(decoded.sid);
        return sid;
    } catch (error) {
        console.error("Failed to decode or verify JWT:", error);
        return null;
    }
}
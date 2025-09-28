import jwt from "jsonwebtoken";
import { createHash, randomBytes, createCipheriv, createDecipheriv } from "crypto";

const ALGORITHM = "aes-256-gcm"; // Authenticated encryption
const ENCRYPTION_KEYS = {
    sid: createHash("sha256").update(String(process.env.SID_ENCRYPTION_SECRET)).digest(),
}
const IV_LENGTH = 16;

type EncryptionType = keyof typeof ENCRYPTION_KEYS;

function encrypt(type: EncryptionType, data: string) {

    // Generate a random IV, create a cipher
    const iv = randomBytes(IV_LENGTH);
    const key = ENCRYPTION_KEYS[type];
    const cipher = createCipheriv(ALGORITHM, key, iv);

    // Combine IV, tag, and encrypted data into a single buffer, create a tag, then encode as base64url
    const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function decrypt(type: EncryptionType, encryptedData: string) {

    // Decode the base64url string
    const data = Buffer.from(encryptedData, "base64url");

    // Extract the IV, tag, and encrypted data
    const iv = data.subarray(0, IV_LENGTH);
    const tag = data.subarray(IV_LENGTH, IV_LENGTH + 16);
    const encrypted = data.subarray(IV_LENGTH + 16);
    const key = ENCRYPTION_KEYS[type];

    // Decrypt the data
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
}


export function generateJwt(sid: string) {
    // Create a JWT with the session ID
    const encryptedSid = encrypt("sid", sid);
    const token = jwt.sign({ sid: encryptedSid }, process.env.JWT_SECRET!);
    return token;
}

export function getSidFromToken(token: string) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sid: string };
        const sid = decrypt("sid", decoded.sid);
        return sid;
    } catch (error) {
        console.error("Failed to decode or verify JWT:", error);
        return null;
    }
}
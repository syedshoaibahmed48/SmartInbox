import jwt from "jsonwebtoken";

export function generateJwt(sid: string) {
    const token = jwt.sign({ sid }, process.env.JWT_SECRET!);
    return token;
}

// verify signature and check if sid exists
export function isValidJwt(token: string) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sid: string };
        return decoded.sid !== null;
    } catch {
        return false;
    }
}

export function getSidFromToken(token: string) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sid: string };
        return decoded.sid;
    } catch {
        return null;
    }
}
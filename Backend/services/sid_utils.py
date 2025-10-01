import base64
import hashlib
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidTag


ALGORITHM = "aes-256-gcm"
IV_LENGTH = 16
AUTH_TAG_LENGTH = 16
ENCRYPTION_KEY = hashlib.sha256(str(os.environ.get("SID_ENCRYPTION_SECRET", "")).encode()).digest()

def encrypt_sid(sid: str) -> str:
    iv = os.urandom(IV_LENGTH)
    encryptor = Cipher(
        algorithms.AES(ENCRYPTION_KEY),
        modes.GCM(iv),
        backend=default_backend()
    ).encryptor()

    ciphertext = encryptor.update(sid.encode("utf-8")) + encryptor.finalize()
    tag = encryptor.tag

    combined = iv + tag + ciphertext
    return base64.urlsafe_b64encode(combined).decode("utf-8")

def decrypt_sid(encrypted_sid: str) -> str:
    try:
        combined = base64.urlsafe_b64decode(encrypted_sid.encode("utf-8"))
        iv = combined[:IV_LENGTH]
        tag = combined[IV_LENGTH:IV_LENGTH + AUTH_TAG_LENGTH]
        ciphertext = combined[IV_LENGTH + AUTH_TAG_LENGTH:]

        decryptor = Cipher(
            algorithms.AES(ENCRYPTION_KEY),
            modes.GCM(iv, tag),
            backend=default_backend()
        ).decryptor()

        decrypted_sid = decryptor.update(ciphertext) + decryptor.finalize()
        return decrypted_sid.decode("utf-8")
    except (InvalidTag, ValueError) as e:
        raise ValueError("Decryption failed or data is tampered") from e
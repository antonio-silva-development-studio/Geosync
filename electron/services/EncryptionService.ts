import crypto from 'crypto';

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly SALT_LENGTH = 64;
  private static readonly IV_LENGTH = 16;
  // private static readonly TAG_LENGTH = 16; // Default is 16
  private static readonly ITERATIONS = 100000;
  private static readonly KEY_LENGTH = 32;
  private static readonly DIGEST = 'sha512';

  /**
   * Derives a 32-byte key from the master password using PBKDF2.
   * @param password The master password
   * @param salt The salt (hex string)
   * @returns The derived key (Buffer)
   */
  static deriveKey(password: string, salt: string): Buffer {
    return crypto.pbkdf2Sync(
      password,
      Buffer.from(salt, 'hex'),
      this.ITERATIONS,
      this.KEY_LENGTH,
      this.DIGEST
    );
  }

  /**
   * Generates a random salt.
   * @returns Hex string of the salt
   */
  static generateSalt(): string {
    return crypto.randomBytes(this.SALT_LENGTH).toString('hex');
  }

  /**
   * Encrypts text using AES-256-GCM.
   * @param text The text to encrypt
   * @param key The derived key (Buffer)
   * @returns Encrypted string format: "iv:authTag:encryptedData" (all hex)
   */
  static encrypt(text: string, key: Buffer): string {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts text using AES-256-GCM.
   * @param encryptedText The encrypted string "iv:authTag:encryptedData"
   * @param key The derived key (Buffer)
   * @returns Decrypted text
   */
  static decrypt(encryptedText: string, key: Buffer): string {
    const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');

    if (!ivHex || !authTagHex || !encryptedHex) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

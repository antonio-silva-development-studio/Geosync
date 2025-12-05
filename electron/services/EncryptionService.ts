import crypto from 'node:crypto';

export const EncryptionService = {
  ALGORITHM: 'aes-256-gcm',
  SALT_LENGTH: 64,
  IV_LENGTH: 16,
  ITERATIONS: 100000,
  KEY_LENGTH: 32,
  DIGEST: 'sha512',

  /**
   * Derives a 32-byte key from the master password using PBKDF2.
   * @param password The master password
   * @param salt The salt (hex string)
   * @returns The derived key (Buffer)
   */
  deriveKey(password: string, salt: string): Buffer {
    return crypto.pbkdf2Sync(
      password,
      Buffer.from(salt, 'hex'),
      EncryptionService.ITERATIONS,
      EncryptionService.KEY_LENGTH,
      EncryptionService.DIGEST,
    );
  },

  /**
   * Generates a random salt.
   * @returns Hex string of the salt
   */
  generateSalt(): string {
    return crypto.randomBytes(EncryptionService.SALT_LENGTH).toString('hex');
  },

  /**
   * Encrypts text using AES-256-GCM.
   * @param text The text to encrypt
   * @param key The derived key (Buffer)
   * @returns Encrypted string format: "iv:authTag:encryptedData" (all hex)
   */
  encrypt(text: string, key: Buffer): string {
    const iv = crypto.randomBytes(EncryptionService.IV_LENGTH);
    // biome-ignore lint/suspicious/noExplicitAny: crypto types workaround
    const cipher = crypto.createCipheriv(EncryptionService.ALGORITHM, key, iv) as any;

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  },

  /**
   * Decrypts text using AES-256-GCM.
   * @param encryptedText The encrypted string "iv:authTag:encryptedData"
   * @param key The derived key (Buffer)
   * @returns Decrypted text
   */
  decrypt(encryptedText: string, key: Buffer): string {
    const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');

    if (!ivHex || !authTagHex || encryptedHex === undefined) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    // biome-ignore lint/suspicious/noExplicitAny: crypto types workaround
    const decipher = crypto.createDecipheriv(EncryptionService.ALGORITHM, key, iv) as any;

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  },
};

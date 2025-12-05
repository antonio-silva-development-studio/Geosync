# Cryptographic Implementation Documentation

This document details the mathematical specifications of the encryption scheme used in GeoSync to secure environment variables.

## 1. Key Derivation Function (KDF)

To transform the user's Master Password into a cryptographically strong encryption key, we use **PBKDF2** (Password-Based Key Derivation Function 2) as defined in [RFC 8018](https://tools.ietf.org/html/rfc8018).

### Mathematical Definition

$$
DK = PBKDF2(PRF, Password, Salt, c, dkLen)
$$

Where:
*   **$PRF$**: Pseudo-Random Function. We use **HMAC-SHA-512**.
*   **$Password$**: The user's master password string.
*   **$Salt$**: A cryptographically random sequence of **64 bytes** (512 bits).
*   **$c$**: Iteration count. We use **100,000** iterations to increase the computational cost of brute-force attacks.
*   **$dkLen$**: Derived Key Length. We generate a **32-byte** (256-bit) key.
*   **$DK$**: The resulting Derived Key used for encryption.

## 2. Encryption Scheme

We use **AES-256-GCM** (Advanced Encryption Standard in Galois/Counter Mode) for authenticated encryption. This provides both confidentiality (secrecy) and integrity (authenticity).

### Mathematical Definition

$$
(C, T) = \text{AES-GCM}_K(IV, P, A)
$$

Where:
*   **$K$**: The 256-bit Derived Key ($DK$) from the KDF step.
*   **$IV$**: Initialization Vector. A unique, random **16-byte** (128-bit) nonce generated for every encryption operation.
*   **$P$**: Plaintext (the variable value to be encrypted).
*   **$A$**: Additional Authenticated Data (AAD). In our current implementation, this is empty.
*   **$C$**: Ciphertext. The encrypted data.
*   **$T$**: Authentication Tag. A **16-byte** (128-bit) tag used to verify data integrity and authenticity.

## 3. Storage Format

The encrypted data is stored in the database as a single string combining the IV, Authentication Tag, and Ciphertext.

$$
\text{StoredValue} = \text{Hex}(IV) \mathbin{||} \text{":"} \mathbin{||} \text{Hex}(T) \mathbin{||} \text{":"} \mathbin{||} \text{Hex}(C)
$$

*   **Hex()**: Hexadecimal encoding function.
*   **||**: String concatenation.

### Example
`a1b2... : c3d4... : e5f6...`
(IV) : (Auth Tag) : (Ciphertext)

## 4. Decryption & Verification

Decryption is only possible if the Authentication Tag ($T$) is valid for the given Ciphertext ($C$) and IV ($IV$) using the Key ($K$).

$$
P = \text{AES-GCM-Decrypt}_K(IV, C, T)
$$

If the tag verification fails (indicating tampering or incorrect key), the operation outputs $\bot$ (error), ensuring that corrupted or manipulated data is never returned.

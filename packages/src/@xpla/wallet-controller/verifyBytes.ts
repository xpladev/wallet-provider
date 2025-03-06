import { SignBytesResult } from '@xpla/wallet-types';
import { keccak256 } from '@ethersproject/keccak256';
import { verify } from '@noble/secp256k1';

export function verifyBytes(
  bytes: Buffer,
  signBytesResult: SignBytesResult['result'],
): boolean {
	const publicKey = signBytesResult.public_key?.toProto();

	if (publicKey && 'key' in publicKey) {
    const sig = signBytesResult.signature;
    const hash =  Uint8Array.from(
      Buffer.from(keccak256(bytes).substring(2), 'hex')
    );
    const pubKey = publicKey.key;
    
    return verify(sig, hash, pubKey);
  }

	return false;
}

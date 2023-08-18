import { SignBytesResult } from '@xpla/wallet-types';
import { keccak256 } from '@ethersproject/keccak256';
import secp256k1 from 'secp256k1'

export function verifyBytes(
  bytes: Buffer,
  signBytesResult: SignBytesResult['result'],
): boolean {
	const publicKey = signBytesResult.public_key?.toProto();

	if (publicKey && 'key' in publicKey) {
    return secp256k1.ecdsaVerify(
      signBytesResult.signature,
      Buffer.from(keccak256(bytes).substring(2), 'hex'),
      publicKey.key,
    );
  }

	return false;
}

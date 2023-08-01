import { SignBytesResult } from '@xpla/wallet-types';
import { recoverPublicKey } from '@ethersproject/signing-key';
import { keccak256 } from '@ethersproject/keccak256';
import { computeAddress } from '@ethersproject/transactions';

export function verifyBytes(
  bytes: Buffer,
  signBytesResult: SignBytesResult['result'],
): boolean {
	const publicKey = signBytesResult.public_key;

	if (publicKey && 'key' in publicKey) {
		const pub = computeAddress(
			recoverPublicKey(
				keccak256(bytes),
				signBytesResult.signature
			)
		);
    
		return (
			(publicKey.rawAddress() as Buffer).toString('hex').toLowerCase()
				=== pub.substring(2).toLowerCase()
		);
	}

	return false;
}

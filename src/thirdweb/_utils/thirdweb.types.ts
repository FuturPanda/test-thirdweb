import { ContractOptions } from 'thirdweb';
import { GenerateLoginPayloadParams, LoginPayload } from 'thirdweb/auth';
import {
  VerifiedLoginPayload,
  VerifyLoginPayloadParams,
  VerifyLoginPayloadResult,
} from 'thirdweb/dist/types/auth/core/verify-login-payload';
import { JWTPayload } from 'thirdweb/dist/types/utils/jwt/types';

export type ThirdwebAuth = {
  generateJWT: (params: {
    payload: VerifiedLoginPayload;
    context?: unknown;
  }) => Promise<string>;
  generatePayload: ({
    address,
    chainId,
  }: GenerateLoginPayloadParams) => Promise<LoginPayload>;
  verifyJWT: (params: { jwt: string }) => Promise<
    | {
        valid: true;
        parsedJWT: JWTPayload;
      }
    | {
        valid: false;
        error: string;
      }
  >;
  verifyPayload: ({
    payload,
    signature,
  }: VerifyLoginPayloadParams) => Promise<VerifyLoginPayloadResult>;
};

export type ThirdwebContract = Readonly<ContractOptions<[], `0x${string}`>>;

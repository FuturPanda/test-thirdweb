import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { validateEnv } from "src/_utils/config/env.config";
import { THIRDWEB_CLIENT_TOKEN } from "src/_utils/constants";
import {
  Engine,
  getContract,
  sendTransaction,
  ThirdwebClient,
  verifyTypedData,
} from "thirdweb";
import { baseSepolia, sepolia } from "thirdweb/chains";
import { claimTo, setApprovalForAll } from "thirdweb/extensions/erc1155";
import { getAllActiveSigners } from "thirdweb/extensions/erc4337";
import { generateAccount, smartWallet } from "thirdweb/wallets";
import { ThirdwebModule } from "./thirdweb.module";
import { ThirdwebService } from "./thirdweb.service";

export const typedData = {
  basic: {
    domain: {
      name: "Ether Mail",
      version: "1",
      chainId: 1,
      verifyingContract: "0x0000000000000000000000000000000000000000",
    },
    types: {
      Person: [
        { name: "name", type: "string" },
        { name: "wallet", type: "address" },
      ],
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "contents", type: "string" },
      ],
    },
    message: {
      from: {
        name: "Cow",
        wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
      },
      to: {
        name: "Bob",
        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      },
      contents: "Hello, Bob!",
    },
    primaryType: "Mail",
  },
  complex: {
    domain: {
      name: "Ether Mail 🥵",
      version: "1.1.1",
      chainId: 1,
      verifyingContract: "0x0000000000000000000000000000000000000000",
    },
    types: {
      Name: [
        { name: "first", type: "string" },
        { name: "last", type: "string" },
      ],
      Person: [
        { name: "name", type: "Name" },
        { name: "wallet", type: "address" },
        { name: "favoriteColors", type: "string[3]" },
        { name: "foo", type: "uint256" },
        { name: "age", type: "uint8" },
        { name: "isCool", type: "bool" },
      ],
      Mail: [
        { name: "timestamp", type: "uint256" },
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "contents", type: "string" },
        { name: "hash", type: "bytes" },
      ],
    },
    message: {
      timestamp: 1234567890n,
      contents: "Hello, Bob! 🖤",
      hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      from: {
        name: {
          first: "Cow",
          last: "Burns",
        },
        wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        age: 69,
        foo: 123123123123123123n,
        favoriteColors: ["red", "green", "blue"],
        isCool: false,
      },
      to: {
        name: { first: "Bob", last: "Builder" },
        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        age: 70,
        foo: 123123123123123123n,
        favoriteColors: ["orange", "yellow", "green"],
        isCool: true,
      },
    },
  },
} as const;

describe("ThirdwebService", () => {
  let thirdwebService: ThirdwebService;
  let thirdwebClient: ThirdwebClient;
  let serverWallet: Engine.ServerWallet;
  let configService: ConfigService;
  let VAULT_ACCESS_TOKEN: string;
  const EOA_ADDRESS = "0xC70f4AB22e20ceB934F0379c5CEaDd0A42F8d9b6";
  let serverWalletAddress: string;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ThirdwebModule,
        ConfigModule.forRoot({ validate: validateEnv, isGlobal: true }),
      ],
      providers: [ConfigService],
    }).compile();

    thirdwebService = module.get<ThirdwebService>(ThirdwebService);
    thirdwebClient = module.get<ThirdwebClient>(THIRDWEB_CLIENT_TOKEN);
    configService = module.get<ConfigService>(ConfigService);
    VAULT_ACCESS_TOKEN =
      configService.get("THIRDWEB").THIRDWEB_VAULT_ACCESS_TOKEN;
    serverWalletAddress =
      configService.get("THIRDWEB").THIRDWEB_SERVER_WALLET_ADDRESS;
    console.log(
      `Vault access token : ${VAULT_ACCESS_TOKEN} ::::: serverwallet :${serverWalletAddress}, thirdweb Client: ${thirdwebClient}`,
    );
    serverWallet = Engine.serverWallet({
      address: serverWalletAddress,
      chain: sepolia,
      client: thirdwebClient,
      vaultAccessToken: VAULT_ACCESS_TOKEN,
    });
  });

  it("should create a server wallet", async () => {
    const serverWallet = await Engine.createServerWallet({
      client: thirdwebClient,
      label: "My Server Wallet",
    });
    expect(serverWallet).toBeDefined();

    const serverWallets = await Engine.getServerWallets({
      client: thirdwebClient,
    });
    expect(serverWallets).toBeDefined();
    expect(serverWallets.length).toBeGreaterThan(0);
    expect(
      serverWallets.find((s) => s.address === serverWallet.address),
    ).toBeDefined();
  });

  it("should sign a message", async () => {
    const signature = await serverWallet.signMessage({
      message: "hello",
    });
    expect(signature).toBeDefined();
  });

  it("should sign typed data", async () => {
    const signature = await serverWallet.signTypedData({
      ...typedData.basic,
    });
    expect(signature).toBeDefined();
  });

  it("should sign typed data for EOA execution options", async () => {
    const eoaServerWallet = Engine.serverWallet({
      address: EOA_ADDRESS,
      chain: sepolia,
      client: thirdwebClient,
      vaultAccessToken: VAULT_ACCESS_TOKEN,
    });

    const signature = await eoaServerWallet.signTypedData(typedData.basic);

    expect(signature).toBeDefined();

    const is_valid = await verifyTypedData({
      address: EOA_ADDRESS,
      chain: sepolia,
      client: thirdwebClient,
      ...typedData.basic,
      signature,
    });

    expect(is_valid).toBe(true);
  });

  it("should send a tx with regular API", async () => {
    const tx = await sendTransaction({
      account: serverWallet,
      transaction: {
        chain: sepolia,
        client: thirdwebClient,
        to: EOA_ADDRESS,
        value: 0n,
      },
    });
    expect(tx).toBeDefined();
  }, 300000);

  it("should enqueue a tx", async () => {
    const nftContract = getContract({
      address: "0xe2cb0eb5147b42095c2FfA6F7ec953bb0bE347D8",
      chain: sepolia,
      client: thirdwebClient,
    });
    const claimTx = claimTo({
      contract: nftContract,
      quantity: 1n,
      to: serverWallet.address,
      tokenId: 0n,
    });
    const result = await serverWallet.enqueueTransaction({
      transaction: claimTx,
    });
    expect(result.transactionId).toBeDefined();
    const txHash = await Engine.waitForTransactionHash({
      client: thirdwebClient,
      transactionId: result.transactionId,
    });
    expect(txHash.transactionHash).toBeDefined();

    const res = await Engine.searchTransactions({
      client: thirdwebClient,
      filters: [
        { field: "id", operation: "OR", values: [result.transactionId] },
      ],
    });
    console.log(res);
    expect(res).toBeDefined();
    expect(res.transactions.length).toBe(1);
    expect(res.transactions[0]?.id).toBe(result.transactionId);
  }, 300000);

  it("should enqueue a batch of txs", async () => {
    const tokenContract = getContract({
      address: "0x638263e3eAa3917a53630e61B1fBa685308024fa",
      chain: baseSepolia,
      client: thirdwebClient,
    });
    const claimTx1 = claimTo({
      contract: tokenContract,
      quantity: 1n,
      to: serverWallet.address,
      tokenId: 2n,
    });
    const claimTx2 = claimTo({
      contract: tokenContract,
      quantity: 1n,
      to: serverWallet.address,
      tokenId: 2n,
    });
    const tx = await serverWallet.enqueueBatchTransaction({
      transactions: [claimTx1, claimTx2],
    });
    expect(tx.transactionId).toBeDefined();
    const txHash = await Engine.waitForTransactionHash({
      client: thirdwebClient,
      transactionId: tx.transactionId,
    });
    expect(txHash.transactionHash).toBeDefined();
  }, 300000);

  it("should send a extension tx", async () => {
    const tokenContract = getContract({
      address: "0x638263e3eAa3917a53630e61B1fBa685308024fa",
      chain: baseSepolia,
      client: thirdwebClient,
    });
    const claimTx = setApprovalForAll({
      approved: true,
      contract: tokenContract,
      operator: "0x4b8ceC1Eb227950F0bfd034449B2781e689242A1",
    });
    const tx = await sendTransaction({
      account: serverWallet,
      transaction: claimTx,
    });
    expect(tx).toBeDefined();
  }, 300000);

  it("should send a session key tx", async () => {
    const sessionKeyAccountAddress =
      "0x317b4b63E056162098458E418aaA80b323b5A6Fd";
    const personalAccount = await generateAccount({
      client: thirdwebClient,
    });
    const smart = smartWallet({
      chain: sepolia,
      sessionKey: {
        address: sessionKeyAccountAddress,
        permissions: {
          approvedTargets: "*",
        },
      },
      sponsorGas: true,
    });

    const smartAccount = await smart.connect({
      client: thirdwebClient,
      personalAccount,
    });
    expect(smartAccount.address).toBeDefined();

    const signers = await getAllActiveSigners({
      contract: getContract({
        address: smartAccount.address,
        chain: sepolia,
        client: thirdwebClient,
      }),
    });

    console.log(signers);
    expect(signers.map((s) => s.signer)).toContain(sessionKeyAccountAddress);

    const serverWallet = Engine.serverWallet({
      address: sessionKeyAccountAddress,
      chain: sepolia,
      client: thirdwebClient,
      executionOptions: {
        entrypointAddress: "0.6",
        signerAddress: sessionKeyAccountAddress,
        smartAccountAddress: smartAccount.address,
        type: "ERC4337",
      },
      vaultAccessToken: VAULT_ACCESS_TOKEN,
    });

    const tx = await sendTransaction({
      account: serverWallet,
      transaction: {
        chain: sepolia,
        client: thirdwebClient,
        to: EOA_ADDRESS,
        value: 0n,
      },
    });
    expect(tx).toBeDefined();
  }, 300000);
});

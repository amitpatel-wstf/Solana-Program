import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
// import {
//     getAssociatedTokenAddressSync,
//     getAccount,
// } from "@solana/spl-token";
// import * as fs from "fs";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes/index.js";
import "dotenv/config";

// // --- CONFIG ---
// const RPC_ENDPOINT = "https://rpc.gorbchain.xyz";
// const WS_ENDPOINT = "wss://rpc.gorbchain.xyz/ws/";
// const AMM_PROGRAM_ID = new PublicKey("aBfrRgukSYDMgdyQ8y1XNEk4w5u7Ugtz5fPHFnkStJX");
// const SPL_TOKEN_PROGRAM_ID = new PublicKey("G22oYgZ6LnVcy7v8eSNi2xpNk1NcZiPD8CVKSTut7oZ6");
// const ATA_PROGRAM_ID = new PublicKey("GoATGVNeSXerFerPqTJ8hcED1msPWHHLxao2vwBYqowm");


export const userKeypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.PVT!)));


// const connection = new Connection(RPC_ENDPOINT, {
//     commitment: "confirmed",
//     wsEndpoint: WS_ENDPOINT,
// });

// // Helper function to get token balance
// async function getTokenBalance(tokenAccount: PublicKey): Promise<number> {
//     try {
//         const account = await getAccount(connection, tokenAccount, "confirmed", SPL_TOKEN_PROGRAM_ID);
//         return Number(account.amount);
//     } catch (error) {
//         return 0;
//     }
// }

// // Helper function to format token amounts
// function formatTokenAmount(amount: number, decimals: number = 9): string {
//     return (amount / Math.pow(10, decimals)).toFixed(6);
// }

// /**
//  * TypeScript Script: Add Liquidity to Pool S-T
//  * Based on IDL: AddLiquidity (discriminant: 1)
//  * Args: amountA (u64), amountB (u64)
//  */
// async function addLiquidity(poolInfo:any,wallet:Wallet,connection:Connection,amountA:number,amountB:number) {
//     try {
//         console.log("🚀 TypeScript Script: Adding Liquidity to Pool S-T...");

//         // Load pool info from previous step
//         const poolInfo = {
//             "poolAddress": "A9vniGqSiRGU81ZKFaPk2pHgsq6zcvssZVooWSck4Uy2",
//             "poolType": "Regular",
//             "dataLength": 89,
//             "rawData": "d5ea0825796a7768080a0007746717f757507817a9a50205259d30408abff36b834e241ea627efb9efbc2e70b947198570a14dfa7858a8a6a6a8a81d3d079df7ff006484cf25090000952e95eb0a09000000a0724e18090000",
//             "tokenA": "FQ2pUcTxEEhNYiSBYnWe9b7VXPrGnZBLuv4M9fDg9Qsk",
//             "tokenB": "9qZWyTziAaiwQuHnjCfHEup9peQyqCbzzbcNyMbUjw9G",
//             "bump": 255,
//             "reserveA": 10058000000000,
//             "reserveB": 9942506745493,
//             "totalLPSupply": 10000000000000,
//             "feeBps": 0,
//             "feePercentage": 0,
//             "tokenAInfo": {
//                 "mintAddress": "FQ2pUcTxEEhNYiSBYnWe9b7VXPrGnZBLuv4M9fDg9Qsk",
//                 "programId": "G22oYgZ6LnVcy7v8eSNi2xpNk1NcZiPD8CVKSTut7oZ6",
//                 "supply": "1000567000000000",
//                 "decimals": "9",
//                 "name": "USDC",
//                 "symbol": "USDC",
//                 "uri": "null",
//                 "mintAuthority": "Fds56LQv7DqPrwxte7NwQMxV9irEVRZivTwEx82Tijg7",
//                 "freezeAuthority": null,
//                 "updateAuthority": "Fds56LQv7DqPrwxte7NwQMxV9irEVRZivTwEx82Tijg7",
//                 "isInitialized": true,
//                 "isFrozen": false,
//                 "metadata": {
//                     "mintInfo": {
//                         "supply": "1000567000000000",
//                         "decimals": 9,
//                         "isInitialized": true,
//                         "mintAuthority": "Fds56LQv7DqPrwxte7NwQMxV9irEVRZivTwEx82Tijg7",
//                         "freezeAuthority": null
//                     },
//                     "programId": "G22oYgZ6LnVcy7v8eSNi2xpNk1NcZiPD8CVKSTut7oZ6",
//                     "tokenMetadata": {
//                         "uri": "null",
//                         "mint": "FQ2pUcTxEEhNYiSBYnWe9b7VXPrGnZBLuv4M9fDg9Qsk",
//                         "name": "USDC",
//                         "symbol": "USDC",
//                         "updateAuthority": "Fds56LQv7DqPrwxte7NwQMxV9irEVRZivTwEx82Tijg7",
//                         "additionalMetadata": []
//                     }
//                 },
//                 "createdAt": "2025-09-06T12:31:47.669Z",
//                 "lastUpdated": "2025-09-06T12:31:47.669Z"
//             },
//             "tokenBInfo": {
//                 "mintAddress": "9qZWyTziAaiwQuHnjCfHEup9peQyqCbzzbcNyMbUjw9G",
//                 "programId": "G22oYgZ6LnVcy7v8eSNi2xpNk1NcZiPD8CVKSTut7oZ6",
//                 "supply": "1000000123000000000",
//                 "decimals": "9",
//                 "name": "HEDGE",
//                 "symbol": "HEDGE",
//                 "uri": "null",
//                 "mintAuthority": "Fds56LQv7DqPrwxte7NwQMxV9irEVRZivTwEx82Tijg7",
//                 "freezeAuthority": null,
//                 "updateAuthority": "Fds56LQv7DqPrwxte7NwQMxV9irEVRZivTwEx82Tijg7",
//                 "isInitialized": true,
//                 "isFrozen": false,
//                 "metadata": {
//                     "mintInfo": {
//                         "supply": "1000000123000000000",
//                         "decimals": 9,
//                         "isInitialized": true,
//                         "mintAuthority": "Fds56LQv7DqPrwxte7NwQMxV9irEVRZivTwEx82Tijg7",
//                         "freezeAuthority": null
//                     },
//                     "programId": "G22oYgZ6LnVcy7v8eSNi2xpNk1NcZiPD8CVKSTut7oZ6",
//                     "tokenMetadata": {
//                         "uri": "null",
//                         "mint": "9qZWyTziAaiwQuHnjCfHEup9peQyqCbzzbcNyMbUjw9G",
//                         "name": "HEDGE",
//                         "symbol": "HEDGE",
//                         "updateAuthority": "Fds56LQv7DqPrwxte7NwQMxV9irEVRZivTwEx82Tijg7",
//                         "additionalMetadata": []
//                     }
//                 },
//                 "createdAt": "2025-09-06T12:31:48.591Z",
//                 "lastUpdated": "2025-09-06T12:31:48.591Z"
//             }
//         }

//         const poolPDA = new PublicKey(poolInfo.poolAddress);
//         const TOKEN_S_MINT = new PublicKey(poolInfo.tokenA);
//         const TOKEN_T_MINT = new PublicKey(poolInfo.tokenB);
//         // const LP_MINT = new PublicKey(poolInfo.lpMint);
//         const [LP_MINT, lpMintBump] = await PublicKey.findProgramAddress(
//             [Buffer.from("mint"), poolPDA.toBuffer()],
//             AMM_PROGRAM_ID
//         );
//         // 3. Derive vault PDAs (matching Rust program logic)
//         const [vaultS, vaultYBump] = await PublicKey.findProgramAddress(
//             [Buffer.from("vault"), poolPDA.toBuffer(), TOKEN_S_MINT.toBuffer()],
//             AMM_PROGRAM_ID
//         );
//         const [vaultT, vaultZBump] = await PublicKey.findProgramAddress(
//             [Buffer.from("vault"), poolPDA.toBuffer(), TOKEN_T_MINT.toBuffer()],
//             AMM_PROGRAM_ID
//         );

//         // User ATAs
//         const userTokenS = getAssociatedTokenAddressSync(TOKEN_S_MINT, userKeypair.publicKey, false, SPL_TOKEN_PROGRAM_ID, ATA_PROGRAM_ID);
//         const userTokenT = getAssociatedTokenAddressSync(TOKEN_T_MINT, userKeypair.publicKey, false, SPL_TOKEN_PROGRAM_ID, ATA_PROGRAM_ID);
//         const userLP = getAssociatedTokenAddressSync(LP_MINT, userKeypair.publicKey, false, SPL_TOKEN_PROGRAM_ID, ATA_PROGRAM_ID);

//         console.log(`User Token S ATA: ${userTokenS.toString()}`);
//         console.log(`User Token T ATA: ${userTokenT.toString()}`);
//         console.log(`User LP ATA: ${userLP.toString()}`);
//         // Define liquidity amounts (maintaining 2:3 ratio)
//         const amountS = formatTokenAmount(amountA,Number(poolInfo.tokenAInfo.decimals)); // 20 tokens
//         const amountT = formatTokenAmount(amountB,Number(poolInfo.tokenBInfo.decimals));  // 30 tokens

//         // Create transaction
//         const transaction = new Transaction();

//         // Prepare accounts for AddLiquidity (matching working JavaScript script order)
//         const accounts = [
//             { pubkey: poolPDA, isSigner: false, isWritable: true },
//             { pubkey: TOKEN_S_MINT, isSigner: false, isWritable: false },
//             { pubkey: TOKEN_T_MINT, isSigner: false, isWritable: false },
//             { pubkey: vaultS, isSigner: false, isWritable: true },
//             { pubkey: vaultT, isSigner: false, isWritable: true },
//             { pubkey: LP_MINT, isSigner: false, isWritable: true },
//             { pubkey: userTokenS, isSigner: false, isWritable: true },
//             { pubkey: userTokenT, isSigner: false, isWritable: true },
//             { pubkey: userLP, isSigner: false, isWritable: true },
//             { pubkey: userKeypair.publicKey, isSigner: true, isWritable: false },
//             { pubkey: SPL_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
//         ];

//         // Instruction data (Borsh: AddLiquidity { amount_a, amount_b })
//         const data = Buffer.alloc(1 + 8 + 8); // 1 byte discriminator + 2x u64
//         data.writeUInt8(1, 0); // AddLiquidity discriminator
//         data.writeBigUInt64LE(BigInt(amountS), 1);
//         data.writeBigUInt64LE(BigInt(amountT), 9);

//         console.log(`\n📝 Instruction data: ${data.toString('hex')}`);

//         // Add AddLiquidity instruction
//         console.log("📝 Adding AddLiquidity instruction...");
//         transaction.add({
//             keys: accounts,
//             programId: AMM_PROGRAM_ID,
//             data,
//         });

//         //  you have to sign the transaction by wallet and return result  and display as result pop up




//     } catch (error) {
//         console.error("❌ Error adding liquidity to Pool S-T:", error);
//         throw error;
//     }
// }

// // Run the function
// // addLiquidityST().catch(console.error);
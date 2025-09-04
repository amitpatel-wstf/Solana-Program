import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
    getAssociatedTokenAddressSync,
    getAccount,
} from "@solana/spl-token";
import * as fs from "fs";
import { userKeypair } from "./addLiquidity.js";


// --- CONFIG ---
const RPC_ENDPOINT = "https://rpc.gorbchain.xyz";
const WS_ENDPOINT = "wss://rpc.gorbchain.xyz/ws/";
const AMM_PROGRAM_ID = new PublicKey("aBfrRgukSYDMgdyQ8y1XNEk4w5u7Ugtz5fPHFnkStJX");
const SPL_TOKEN_PROGRAM_ID = new PublicKey("G22oYgZ6LnVcy7v8eSNi2xpNk1NcZiPD8CVKSTut7oZ6");
const ATA_PROGRAM_ID = new PublicKey("GoATGVNeSXerFerPqTJ8hcED1msPWHHLxao2vwBYqowm");


const connection = new Connection(RPC_ENDPOINT, {
    commitment: "confirmed",
    wsEndpoint: WS_ENDPOINT,
});

// Helper function to get token balance
async function getTokenBalance(tokenAccount: PublicKey): Promise<number> {
    try {
        const account = await getAccount(connection, tokenAccount, "confirmed", SPL_TOKEN_PROGRAM_ID);
        return Number(account.amount);
    } catch (error) {
        return 0;
    }
}

// Helper function to format token amounts
function formatTokenAmount(amount: number, decimals: number = 9): string {
    return (amount / Math.pow(10, decimals)).toFixed(6);
}

/**
 * TypeScript Script: Single Swap S → T
 * Based on IDL: Swap (discriminant: 3)
 * Args: amountIn (u64), directionAToB (bool)
 */
async function swapST() {
    try {
        console.log("🚀 TypeScript Script: Single Swap S → T...");

        // Load pool info from previous step
        const poolInfo = {
            "poolPDA": "AscvQNsqWGPL5iJkWXKaAS62QVPLg77obLUekom9UFV3",
            "poolBump": 253,
            "tokenS": "3eb5bXPzknE9CpbWjz8ALBqf1dZ5tEGcVwcocb41UU1z",
            "tokenT": "CoSyfv9FSYgGPzPhq1J46g4jMeEbuuQgsfdN4E4WtciP",
            "lpMint": "BJgVrWLaPig5NNbfQVVjx4venkD5f6kRZwLKRDqMEWcT",
            "vaultS": "6ermPh1QHkY3RYSeHP83oa3gTnHmMopxmnanSud4EiHG",
            "vaultT": "3dFpyEk3CWuugjySKth951wWMnim1cyAcDCY6Pxe4uBk",
            "userTokenS": "G1wKkbFryTeSqVfsEkJ9xXPgLJPV8j1gR33FFGes887K",
            "userTokenT": "CUtBjag6sDrhdmVsAXFKSk6KPUQMGoRNhDw8M6TzSC8X",
            "userLP": "FYgVkqCnEPQtcaYBw3LCbstVKLM7Rui6fUPbZGMR2TnD",
            "initialAmountS": 2000000000,
            "initialAmountT": 3000000000,
            "transactionSignature": "53KypoZYwooJjEKjWDsvEqSRbTunSLDmhUPnTYVPB1vpd75tHCSrm1GwDS5Ctuq2wqsN487oBy1ZYvPgRoPPB9jt",
            "additionalAmountS": 20000000000,
            "additionalAmountT": 30000000000,
            "totalLPTokens": 51439284582,
            "addLiquiditySignature": "555aTvyf5TeMaHXev3VhbboZB7NFpTPU7H8uV7dZtRhqQxzWFebCjnzQQc2Fjju5kMf4FUUUDPT6vZmWTcSwN3SM"
          }

        const poolPDA = new PublicKey(poolInfo.poolPDA);
        const TOKEN_S_MINT = new PublicKey(poolInfo.tokenS);
        const TOKEN_T_MINT = new PublicKey(poolInfo.tokenT);
        const vaultS = new PublicKey(poolInfo.vaultS);
        const vaultT = new PublicKey(poolInfo.vaultT);

        console.log(`Pool PDA: ${poolPDA.toString()}`);
        console.log(`Token S: ${TOKEN_S_MINT.toString()}`);
        console.log(`Token T: ${TOKEN_T_MINT.toString()}`);

        // User ATAs
        const userTokenS = getAssociatedTokenAddressSync(TOKEN_S_MINT, userKeypair.publicKey, false, SPL_TOKEN_PROGRAM_ID, ATA_PROGRAM_ID);
        const userTokenT = getAssociatedTokenAddressSync(TOKEN_T_MINT, userKeypair.publicKey, false, SPL_TOKEN_PROGRAM_ID, ATA_PROGRAM_ID);

        console.log(`User Token S ATA: ${userTokenS.toString()}`);
        console.log(`User Token T ATA: ${userTokenT.toString()}`);

        // Check balances before swap
        console.log("\n📊 Balances BEFORE Swap:");
        const balanceTokenSBefore = await getTokenBalance(userTokenS);
        const balanceTokenTBefore = await getTokenBalance(userTokenT);

        console.log(`Token S: ${formatTokenAmount(balanceTokenSBefore)} (${balanceTokenSBefore} raw)`);
        console.log(`Token T: ${formatTokenAmount(balanceTokenTBefore)} (${balanceTokenTBefore} raw)`);

        // Define swap parameters
        const amountIn = 5_000_000_000; // 5 Token S
        const directionAToB = true; // S → T (true means A to B, where A=S, B=T)

        console.log(`\n🔄 Swap Parameters:`);
        console.log(`Amount In: ${formatTokenAmount(amountIn)} Token S`);
        console.log(`Direction: S → T (directionAToB: ${directionAToB})`);

        // Create transaction
        const transaction = new Transaction();

        // Prepare accounts for Swap (matching working JavaScript script order)
        const accounts = [
            { pubkey: poolPDA, isSigner: false, isWritable: true },
            { pubkey: TOKEN_S_MINT, isSigner: false, isWritable: false },
            { pubkey: TOKEN_T_MINT, isSigner: false, isWritable: false },
            { pubkey: vaultS, isSigner: false, isWritable: true },
            { pubkey: vaultT, isSigner: false, isWritable: true },
            { pubkey: userTokenS, isSigner: false, isWritable: true },
            { pubkey: userTokenT, isSigner: false, isWritable: true },
            { pubkey: userKeypair.publicKey, isSigner: true, isWritable: false },
            { pubkey: SPL_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ];

        // Instruction data (Borsh: Swap { amount_in, direction_a_to_b })
        const data = Buffer.alloc(1 + 8 + 1); // 1 byte discriminator + u64 + bool
        data.writeUInt8(3, 0); // Swap discriminator
        data.writeBigUInt64LE(BigInt(amountIn), 1);
        data.writeUInt8(directionAToB ? 1 : 0, 9); // bool as u8

        console.log(`\n📝 Instruction data: ${data.toString('hex')}`);

        // Add Swap instruction
        console.log("📝 Adding Swap instruction...");
        transaction.add({
            keys: accounts,
            programId: AMM_PROGRAM_ID,
            data,
        });

        // Send transaction
        console.log("\n📝 Sending swap transaction...");
        const signature = await sendAndConfirmTransaction(connection, transaction, [
            userKeypair,
        ], {
            commitment: "confirmed",
            preflightCommitment: "confirmed",
        });

        console.log(`✅ Swap S → T completed successfully!`);
        console.log(`Transaction signature: ${signature}`);

        // Check balances after swap
        console.log("\n📊 Balances AFTER Swap:");
        const balanceTokenSAfter = await getTokenBalance(userTokenS);
        const balanceTokenTAfter = await getTokenBalance(userTokenT);

        console.log(`Token S: ${formatTokenAmount(balanceTokenSAfter)} (${balanceTokenSAfter} raw)`);
        console.log(`Token T: ${formatTokenAmount(balanceTokenTAfter)} (${balanceTokenTAfter} raw)`);

        // Calculate changes
        const tokenSUsed = balanceTokenSBefore - balanceTokenSAfter;
        const tokenTReceived = balanceTokenTAfter - balanceTokenTBefore;

        console.log(`\n📈 Swap Results:`);
        console.log(`Token S Used: ${formatTokenAmount(tokenSUsed)}`);
        console.log(`Token T Received: ${formatTokenAmount(tokenTReceived)}`);

        // Calculate exchange rate
        if (tokenSUsed > 0) {
            const exchangeRate = tokenTReceived / tokenSUsed;
            console.log(`\n💱 Exchange Rate: 1 Token S = ${exchangeRate.toFixed(6)} Token T`);
        }

        // Save swap info
        const swapInfo = {
            type: "single_swap",
            direction: "S → T",
            amountIn,
            amountOut: tokenTReceived,
            tokenSUsed,
            tokenTReceived,
            directionAToB,
            poolPDA: poolPDA.toString(),
            transactionSignature: signature,
            timestamp: new Date().toISOString(),
        };

        fs.writeFileSync("swap-st-results.json", JSON.stringify(swapInfo, null, 2));
        console.log("\n💾 Swap results saved to swap-st-results.json");

    } catch (error) {
        console.error("❌ Error in swap S → T:", error);
        throw error;
    }
}

// Run the function
swapST().catch(console.error);
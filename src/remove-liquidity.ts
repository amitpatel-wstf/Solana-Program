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
 * TypeScript Script: Remove Liquidity from Pool S-T
 * Based on IDL: RemoveLiquidity (discriminant: 2)
 * Args: amount (u64)
 */
async function removeLiquidityST() {
    try {
        console.log("🚀 TypeScript Script: Removing Liquidity from Pool S-T...");

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
            "totalLPTokens": 73328341850,
            "addLiquiditySignature": "5sj66M9QeduryvqVP42jdEVPeUAHwk1b229whoevstka5wHhJFmUn3y1KdhvwRtQvKEz43zMp3oKb3sC7QaNtm1h"
          }

        const poolPDA = new PublicKey(poolInfo.poolPDA);
        const TOKEN_S_MINT = new PublicKey(poolInfo.tokenS);
        const TOKEN_T_MINT = new PublicKey(poolInfo.tokenT);
        const LP_MINT = new PublicKey(poolInfo.lpMint);
        const vaultS = new PublicKey(poolInfo.vaultS);
        const vaultT = new PublicKey(poolInfo.vaultT);

        console.log(`Pool PDA: ${poolPDA.toString()}`);
        console.log(`Token S: ${TOKEN_S_MINT.toString()}`);
        console.log(`Token T: ${TOKEN_T_MINT.toString()}`);
        console.log(`LP Mint: ${LP_MINT.toString()}`);

        // User ATAs
        const userTokenS = getAssociatedTokenAddressSync(TOKEN_S_MINT, userKeypair.publicKey, false, SPL_TOKEN_PROGRAM_ID, ATA_PROGRAM_ID);
        const userTokenT = getAssociatedTokenAddressSync(TOKEN_T_MINT, userKeypair.publicKey, false, SPL_TOKEN_PROGRAM_ID, ATA_PROGRAM_ID);
        const userLP = getAssociatedTokenAddressSync(LP_MINT, userKeypair.publicKey, false, SPL_TOKEN_PROGRAM_ID, ATA_PROGRAM_ID);

        console.log(`User Token S ATA: ${userTokenS.toString()}`);
        console.log(`User Token T ATA: ${userTokenT.toString()}`);
        console.log(`User LP ATA: ${userLP.toString()}`);

        // Check balances before removing liquidity
        console.log("\n📊 Balances BEFORE Removing Liquidity:");
        const balanceTokenSBefore = await getTokenBalance(userTokenS);
        const balanceTokenTBefore = await getTokenBalance(userTokenT);
        const balanceLPBefore = await getTokenBalance(userLP);

        console.log(`Token S: ${formatTokenAmount(balanceTokenSBefore)} (${balanceTokenSBefore} raw)`);
        console.log(`Token T: ${formatTokenAmount(balanceTokenTBefore)} (${balanceTokenTBefore} raw)`);
        console.log(`LP Tokens: ${formatTokenAmount(balanceLPBefore)} (${balanceLPBefore} raw)`);

        // Define liquidity removal amount (remove 50% of LP tokens)
        const lpAmountToRemove = Math.floor(balanceLPBefore / 2); // Remove half of LP tokens

        console.log(`\n🏊 Removing Liquidity Parameters:`);
        console.log(`LP Tokens to Remove: ${formatTokenAmount(lpAmountToRemove)} (${lpAmountToRemove} raw)`);
        console.log(`Percentage: 50% of total LP tokens`);

        // Create transaction
        const transaction = new Transaction();

        // Prepare accounts for RemoveLiquidity (matching working JavaScript script order)
        const accounts = [
            { pubkey: poolPDA, isSigner: false, isWritable: true },
            { pubkey: TOKEN_S_MINT, isSigner: false, isWritable: false },
            { pubkey: TOKEN_T_MINT, isSigner: false, isWritable: false },
            { pubkey: vaultS, isSigner: false, isWritable: true },
            { pubkey: vaultT, isSigner: false, isWritable: true },
            { pubkey: LP_MINT, isSigner: false, isWritable: true },
            { pubkey: userLP, isSigner: false, isWritable: true },
            { pubkey: userTokenS, isSigner: false, isWritable: true },
            { pubkey: userTokenT, isSigner: false, isWritable: true },
            { pubkey: userKeypair.publicKey, isSigner: true, isWritable: false },
            { pubkey: SPL_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ];

        // Instruction data (Borsh: RemoveLiquidity { amount })
        const data = Buffer.alloc(1 + 8); // 1 byte discriminator + 1x u64
        data.writeUInt8(2, 0); // RemoveLiquidity discriminator
        data.writeBigUInt64LE(BigInt(lpAmountToRemove), 1);

        console.log(`\n📝 Instruction data: ${data.toString('hex')}`);

        // Add RemoveLiquidity instruction
        console.log("📝 Adding RemoveLiquidity instruction...");
        transaction.add({
            keys: accounts,
            programId: AMM_PROGRAM_ID,
            data,
        });

        // Send transaction
        console.log("\n📝 Sending remove liquidity transaction...");
        const signature = await sendAndConfirmTransaction(connection, transaction, [
            userKeypair,
        ], {
            commitment: "confirmed",
            preflightCommitment: "confirmed",
        });

        console.log(`✅ Liquidity removed from Pool S-T successfully!`);
        console.log(`Transaction signature: ${signature}`);

        // Check balances after removing liquidity
        console.log("\n📊 Balances AFTER Removing Liquidity:");
        const balanceTokenSAfter = await getTokenBalance(userTokenS);
        const balanceTokenTAfter = await getTokenBalance(userTokenT);
        const balanceLPAfter = await getTokenBalance(userLP);

        console.log(`Token S: ${formatTokenAmount(balanceTokenSAfter)} (${balanceTokenSAfter} raw)`);
        console.log(`Token T: ${formatTokenAmount(balanceTokenTAfter)} (${balanceTokenTAfter} raw)`);
        console.log(`LP Tokens: ${formatTokenAmount(balanceLPAfter)} (${balanceLPAfter} raw)`);

        // Calculate changes
        const tokenSReceived = balanceTokenSAfter - balanceTokenSBefore;
        const tokenTReceived = balanceTokenTAfter - balanceTokenTBefore;
        const lpTokensRemoved = balanceLPBefore - balanceLPAfter;

        console.log(`\n📈 Liquidity Removal Results:`);
        console.log(`Token S Received: ${formatTokenAmount(tokenSReceived)}`);
        console.log(`Token T Received: ${formatTokenAmount(tokenTReceived)}`);
        console.log(`LP Tokens Removed: ${formatTokenAmount(lpTokensRemoved)}`);

        // Save updated pool info
        const updatedPoolInfo = {
            ...poolInfo,
            removedLPTokens: lpAmountToRemove,
            tokenSReceived,
            tokenTReceived,
            remainingLPTokens: balanceLPAfter,
            removeLiquiditySignature: signature,
        };

        fs.writeFileSync("remove-liquidity-info.json", JSON.stringify(updatedPoolInfo, null, 2));
        console.log("\n💾 Updated Pool S-T info saved to remove-liquidity-info.json");

    } catch (error) {
        console.error("❌ Error removing liquidity from Pool S-T:", error);
        throw error;
    }
}

// Run the function
removeLiquidityST().catch(console.error);
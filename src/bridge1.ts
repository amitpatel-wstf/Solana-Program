import { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from "@solana/spl-token";
import BN from "bn.js";
import crypto from "crypto";
import bs58 from 'bs58'
import "dotenv/config"

// Function to compute Anchor instruction discriminator
function getInstructionDiscriminator(instructionName:any) {
    return crypto.createHash('sha256')
        .update(`global:${instructionName}`)
        .digest()
        .slice(0, 8);
}

// Constants
const USDC_MINT_DEVNET = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
const ADMIN_ADDRESS = new PublicKey("C22LUQPCoQskUKYxaG9xA4FjKZVrB6ZAxHKNvr6TEA2R");
const PROGRAM_ID = new PublicKey("BBeDW4iezbrsAqVp8DANdr3axW7zun7DdKQyYrAdHDAm");

async function lockTokensDirectly() {
    try {
        console.log("=== USDC Token Locking Script ===");
        
        // Setup connection
        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        
        const privateKeyString = process.env.PVT!;
        const privateKeyArray = new Uint8Array(bs58.decode(privateKeyString));
        const user = Keypair.fromSecretKey(privateKeyArray);
        
        console.log("User public key:", user.publicKey.toString());
        
        // Check SOL balance
        const balance = await connection.getBalance(user.publicKey);
        console.log("SOL balance:", (balance / 1000000000).toFixed(4), "SOL");
        
        // Get user's USDC token account
        const userTokenAccount = await getAssociatedTokenAddress(
            USDC_MINT_DEVNET,
            user.publicKey
        );
        
        // Get admin's USDC token account
        const adminTokenAccount = await getAssociatedTokenAddress(
            USDC_MINT_DEVNET,
            ADMIN_ADDRESS
        );
        
        console.log("User token account:", userTokenAccount.toString());
        console.log("Admin token account:", adminTokenAccount.toString());
        
        // Check if user token account exists, create if needed
        // try {
        //     await getAccount(connection, userTokenAccount);
        //     console.log("User token account exists");
        // } catch (error) {
        //     console.log("Creating user token account...");
        //     const createUserTokenAccountTx = new Transaction().add(
        //         createAssociatedTokenAccountInstruction(
        //             user.publicKey,
        //             userTokenAccount,
        //             user.publicKey,
        //             USDC_MINT_DEVNET
        //         )
        //     );
        //     await connection.sendTransaction(createUserTokenAccountTx, [user]);
        //     console.log("User token account created");
        // }
        
        // Check if admin token account exists, create if needed
        // try {
        //     await getAccount(connection, adminTokenAccount);
        //     console.log("Admin token account exists");
        // } catch (error) {
        //     console.log("Creating admin token account...");
        //     const createAdminTokenAccountTx = new Transaction().add(
        //         createAssociatedTokenAccountInstruction(
        //             user.publicKey, // User pays for the account creation
        //             adminTokenAccount,
        //             ADMIN_ADDRESS, // Admin is the owner
        //             USDC_MINT_DEVNET
        //         )
        //     );
        //     await connection.sendTransaction(createAdminTokenAccountTx, [user]);
        //     console.log("Admin token account created");
        // }
        
        // Check USDC balance
        try {
            const tokenBalance = await connection.getTokenAccountBalance(userTokenAccount);
            console.log("USDC balance:", tokenBalance.value.uiAmount || 0, "USDC");
            
            if (!tokenBalance.value.uiAmount || tokenBalance.value.uiAmount === 0) {
                console.log("❌ No USDC tokens found. Please get some USDC from a devnet faucet first.");
                console.log("Visit: https://spl-token-faucet.com/");
                return;
            }
        } catch (error:any) {
            console.log("❌ Error checking USDC balance:", error.message);
            return;
        }
        
        // Derive lock account PDA
        const [lockAccountPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("lock"),
                user.publicKey.toBuffer(),
                USDC_MINT_DEVNET.toBuffer()
            ],
            PROGRAM_ID
        );
        console.log("Lock account PDA:", lockAccountPDA.toString());
        
        // Create lock tokens instruction manually
        const amountToLock = new BN(1000000); // 1 USDC (6 decimals)
        const destinationAddress = new PublicKey("11111111111111111111111111111112");
        
        // Instruction data: [discriminator(8), amount(8), destination(32)]
        const lockTokensDiscriminator = getInstructionDiscriminator('lock_tokens');
        const instructionData = Buffer.alloc(8 + 8 + 32);
        lockTokensDiscriminator.copy(instructionData as any, 0);
        amountToLock.toArrayLike(Buffer, 'le', 8).copy(instructionData as any, 8);
        destinationAddress.toBuffer().copy(instructionData as any, 16);
        
        const lockInstruction = new TransactionInstruction({
            keys: [
                { pubkey: user.publicKey, isSigner: true, isWritable: true },
                { pubkey: ADMIN_ADDRESS, isSigner: false, isWritable: true },
                { pubkey: userTokenAccount, isSigner: false, isWritable: true },
                { pubkey: adminTokenAccount, isSigner: false, isWritable: true },
                { pubkey: lockAccountPDA, isSigner: false, isWritable: true },
                { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            ],
            programId: PROGRAM_ID,
            data: instructionData,
        });
        
        // Try to initialize lock account first if needed
        const initDiscriminator = getInstructionDiscriminator('initialize_lock_account');
        const initInstructionData = Buffer.alloc(8);
        initDiscriminator.copy(initInstructionData as any, 0);
        
        // const initInstruction = new TransactionInstruction({
        //     keys: [
        //         { pubkey: user.publicKey, isSigner: true, isWritable: true },
        //         { pubkey: ADMIN_ADDRESS, isSigner: false, isWritable: false },
        //         { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        //         { pubkey: lockAccountPDA, isSigner: false, isWritable: true },
        //         { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        //     ],
        //     programId: PROGRAM_ID,
        //     data: initInstructionData,
        // });
        
        // console.log("\n=== Initializing Lock Account ===");
        // try {
        //     const initTx = new Transaction().add(initInstruction);
        //     const initTxSig = await connection.sendTransaction(initTx, [user]);
        //     await connection.confirmTransaction(initTxSig);
        //     console.log("✅ Lock account initialized! Tx:", initTxSig);
        // } catch (error:any) {
        //     if (error.message.includes("already exists")) {
        //         console.log("Lock account already exists");
        //     } else {
        //         console.log("Init error:", error.message);
        //     }
        // }
        
        // console.log("\n=== Locking Tokens ===");
        // console.log("Amount to lock:", amountToLock.toString(), "USDC (raw units)");
        // console.log("Destination address:", destinationAddress.toString());
        
        try {
            const lockTx = new Transaction().add(lockInstruction);
            const lockTxSig = await connection.sendTransaction(lockTx, [user]);
            await connection.confirmTransaction(lockTxSig);
            
            console.log("✅ Tokens locked successfully!");
            console.log("Transaction signature:", lockTxSig);
            console.log("Explorer link:", `https://explorer.solana.com/tx/${lockTxSig}?cluster=devnet`);
            
        } catch (error:any) {
            console.log("❌ Lock error:", error.message);
            if (error.logs) {
                console.log("Program logs:");
                error.logs.forEach((log:any) => console.log("  ", log));
            }
        }
        
    } catch (error:any) {
        console.error("❌ Error:", error.message);
    }
}

// Export the function and run if called directly

lockTokensDirectly().catch(console.error);

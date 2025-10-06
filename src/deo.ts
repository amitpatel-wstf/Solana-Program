// import { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram } from "@solana/web3.js";
// import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from "@solana/spl-token";
// import BN from "bn.js";
// import crypto from "crypto";

// // Function to compute Anchor instruction discriminator
// function getInstructionDiscriminator(instructionName:any) {
//     return crypto.createHash('sha256')
//         .update(`global:${instructionName}`)
//         .digest()
//         .slice(0, 8);
// }

// // Constants
// const USDC_MINT_DEVNET = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
// const ADMIN_ADDRESS = new PublicKey("C22LUQPCoQskUKYxaG9xA4FjKZVrB6ZAxHKNvr6TEA2R");
// const PROGRAM_ID = new PublicKey("BBeDW4iezbrsAqVp8DANdr3axW7zun7DdKQyYrAdHDAm");

// async function lockTokensDirectly(wallet:Wallet,tokenAddress:string,connection:Connection,amount:number,lockToken:any) {
//     try {
//         console.log("=== USDC Token Locking Script ===");

//         // Get user's USDC token account
//         const userTokenAccount = await getAssociatedTokenAddress(
//             USDC_MINT_DEVNET,
//             wallet
//         );
        
//         // Get admin's USDC token account
//         const adminTokenAccount = await getAssociatedTokenAddress(
//             USDC_MINT_DEVNET,
//             ADMIN_ADDRESS
//         );
        
//         console.log("User token account:", userTokenAccount.toString());
//         console.log("Admin token account:", adminTokenAccount.toString());
        
//         // Derive lock account PDA
//         const [lockAccountPDA] = PublicKey.findProgramAddressSync(
//             [
//                 Buffer.from("lock"),
//                 user.publicKey.toBuffer(),
//                 USDC_MINT_DEVNET.toBuffer()
//             ],
//             PROGRAM_ID
//         );
//         console.log("Lock account PDA:", lockAccountPDA.toString());
        
//         // Create lock tokens instruction manually
//         const amountToLock = new BN(amount).mul(new BN(10).pow(lockToken.decimals)); // 1 USDC (6 decimals)
//         const destinationAddress = new PublicKey("11111111111111111111111111111112");
        
//         // Instruction data: [discriminator(8), amount(8), destination(32)]
//         const lockTokensDiscriminator = getInstructionDiscriminator('lock_tokens');
//         const instructionData = Buffer.alloc(8 + 8 + 32);
//         lockTokensDiscriminator.copy(instructionData as any, 0);
//         amountToLock.toArrayLike(Buffer, 'le', 8).copy(instructionData as any, 8);
//         destinationAddress.toBuffer().copy(instructionData as any, 16);
        
//         const lockInstruction = new TransactionInstruction({
//             keys: [
//                 { pubkey: user.publicKey, isSigner: true, isWritable: true },
//                 { pubkey: ADMIN_ADDRESS, isSigner: false, isWritable: true },
//                 { pubkey: userTokenAccount, isSigner: false, isWritable: true },
//                 { pubkey: adminTokenAccount, isSigner: false, isWritable: true },
//                 { pubkey: lockAccountPDA, isSigner: false, isWritable: true },
//                 { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
//             ],
//             programId: PROGRAM_ID,
//             data: instructionData,
//         });
        
//         // Try to initialize lock account first if needed
//         const initDiscriminator = getInstructionDiscriminator('initialize_lock_account');
//         const initInstructionData = Buffer.alloc(8);
//         initDiscriminator.copy(initInstructionData as any, 0);
        
//         try {
//             const lockTx = new Transaction().add(lockInstruction);
//             // here you need to sign from wallet and send transaction by custom connections and return result
            
//             console.log("✅ Tokens locked successfully!");
//             // console.log("Transaction signature:", lockTxSig);
//             console.log("Explorer link:", `https://explorer.solana.com/tx/${lockTxSig}?cluster=devnet`);
            
//         } catch (error:any) {
//             console.log("❌ Lock error:", error.message);
//             if (error.logs) {
//                 console.log("Program logs:");
//                 error.logs.forEach((log:any) => console.log("  ", log));
//             }
//         }
        
//     } catch (error:any) {
//         console.error("❌ Error:", error.message);
//     }
// }

// // Export the function and run if called directly

// // lockTokensDirectly().catch(console.error);

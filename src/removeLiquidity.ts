import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import "dotenv/config";
import bs58 from 'bs58';


const RPC_ENDPOINT = 'https://rpc.gorbchain.xyz';
const WS_ENDPOINT = 'wss://rpc.gorbchain.xyz/ws/';
export const connection = new Connection(RPC_ENDPOINT, {
    commitment: 'confirmed',
    wsEndpoint: WS_ENDPOINT
});

const AMM_PROGRAM_ID = new PublicKey("EtGrXaRpEdozMtfd8tbkbrbDN8LqZNba3xWTdT3HtQWq");
const SPL_TOKEN_PROGRAM_ID = new PublicKey("G22oYgZ6LnVcy7v8eSNi2xpNk1NcZiPD8CVKSTut7oZ6");
const ATA_PROGRAM_ID = new PublicKey("GoATGVNeSXerFerPqTJ8hcED1msPWHHLxao2vwBYqowm");
const NATIVE_SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

const userKeypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.PVT!)));

function formatTokenAmount(amount: number, decimals: number = 9): string {
    return (amount / Math.pow(10, decimals)).toFixed(6);
}

async function getTokenBalance(tokenAccount: PublicKey): Promise<number> {
    try {
        const account = await getAccount(connection, tokenAccount, "confirmed", SPL_TOKEN_PROGRAM_ID);
        return Number(account.amount);
    } catch (error) {
        return 0;
    }
}
function logBalances(balances: any, operation: string) {
    console.log(`\n📊 Balances ${operation}:`);
    if (balances.sol !== undefined) {
        console.log(`Native SOL: ${balances.sol / 1e9} SOL (${balances.sol} lamports)`);
    }
    if (balances.tokenA !== undefined) {
        console.log(`Token A: ${formatTokenAmount(balances.tokenA)} (${balances.tokenA} raw)`);
    }
    if (balances.tokenB !== undefined) {
        console.log(`Token B: ${formatTokenAmount(balances.tokenB)} (${balances.tokenB} raw)`);
    }
    if (balances.lp !== undefined) {
        console.log(`LP Tokens: ${formatTokenAmount(balances.lp, 0)} (${balances.lp} raw)`);
    }
}

 interface PoolConfig {
    tokenA: PublicKey;
    tokenB: PublicKey;
    poolPDA: PublicKey;
    lpMint: PublicKey;
    vaultA: PublicKey;
    vaultB: PublicKey;
    userTokenA: PublicKey;
    userTokenB: PublicKey;
    userLP: PublicKey;
  }

async function removeLiquidity(poolConfig: PoolConfig,amountInPer:number, poolType: string = "Regular") {
    console.log(`\n🏊 Removing liquidity from ${poolType} pool...`);

    // Get current LP balance
    const lpBalance = await getTokenBalance(poolConfig.userLP);
    const lpAmountToRemove = Math.floor(lpBalance * amountInPer); // Remove 10% = 0.1

    if (lpAmountToRemove === 0) {
        console.log("⚠️ No LP tokens to remove");
        return;
    }

    // Check balances before
    const balancesBefore = {
        tokenA: poolType === 'native' ? await connection.getBalance(poolConfig.userTokenA) : await getTokenBalance(poolConfig.userTokenA),
        tokenB: await getTokenBalance(poolConfig.userTokenB),
        lp: lpBalance
    };
    logBalances(balancesBefore, "BEFORE Removing Liquidity");

    // Create transaction
    const transaction = new Transaction();

    let accounts;
    if (poolType === 'regular') {
        accounts = [
            { pubkey: poolConfig.poolPDA, isSigner: false, isWritable: true },
            { pubkey: poolConfig.tokenA, isSigner: false, isWritable: false },
            { pubkey: poolConfig.tokenB, isSigner: false, isWritable: false },
            { pubkey: poolConfig.vaultA, isSigner: false, isWritable: true },
            { pubkey: poolConfig.vaultB, isSigner: false, isWritable: true },
            { pubkey: poolConfig.lpMint, isSigner: false, isWritable: true },
            { pubkey: poolConfig.userLP, isSigner: false, isWritable: true },
            { pubkey: poolConfig.userTokenA, isSigner: false, isWritable: true },
            { pubkey: poolConfig.userTokenB, isSigner: false, isWritable: true },
            { pubkey: userKeypair.publicKey, isSigner: true, isWritable: false },
            { pubkey: SPL_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: ATA_PROGRAM_ID, isSigner: false, isWritable: false },
        ];
    } else {
        accounts = [
            { pubkey: poolConfig.poolPDA, isSigner: false, isWritable: true },
            { pubkey: poolConfig.tokenA, isSigner: false, isWritable: false },
            { pubkey: poolConfig.tokenB, isSigner: false, isWritable: false },
            { pubkey: poolConfig.vaultA, isSigner: false, isWritable: true },
            { pubkey: poolConfig.vaultB, isSigner: false, isWritable: true },
            { pubkey: poolConfig.lpMint, isSigner: false, isWritable: true },
            { pubkey: poolConfig.userLP, isSigner: false, isWritable: true },
            { pubkey: poolConfig.userTokenA, isSigner: false, isWritable: true },
            { pubkey: poolConfig.userTokenB, isSigner: false, isWritable: true },
            { pubkey: userKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: SPL_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ];
    }

    const data = Buffer.alloc(1 + 8);
    data.writeUInt8(2, 0); // RemoveLiquidity discriminator
    data.writeBigUInt64LE(BigInt(lpAmountToRemove), 1);

    transaction.add({
        keys: accounts,
        programId: AMM_PROGRAM_ID,
        data,
    });

    const signature = await sendAndConfirmTransaction(connection, transaction, [userKeypair], {
        commitment: "confirmed",
    });

    console.log(`✅ Liquidity removed! Signature: ${signature}`);

    // Check balances after
    const balancesAfter = {
        tokenA: poolType === 'native' ? await connection.getBalance(poolConfig.userTokenA) : await getTokenBalance(poolConfig.userTokenA),
        tokenB: await getTokenBalance(poolConfig.userTokenB),
        lp: await getTokenBalance(poolConfig.userLP)
    };
    logBalances(balancesAfter, "AFTER Removing Liquidity");
}


async function createPoolConfig(tokenA:string, tokenB:string,poolAddress:string,poolType:string="Regular") : Promise <PoolConfig>{
    const TokenA = new PublicKey(tokenA);
    const TokenB = new PublicKey(tokenB);
    const Pool = new PublicKey(poolAddress);

    const [poolPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("pool"), TokenA.toBuffer(), TokenA.toBuffer()],
      AMM_PROGRAM_ID
    );

     const [lpMint] = await PublicKey.findProgramAddress(
      [Buffer.from("mint"), poolPDA.toBuffer()],
      AMM_PROGRAM_ID
    );

    const [vaultA] = TokenA===NATIVE_SOL_MINT ? [poolPDA]  :  await PublicKey.findProgramAddress(
      [Buffer.from("vault"), poolPDA.toBuffer(), TokenA.toBuffer()],
      AMM_PROGRAM_ID
    );
    
    const [vaultB] = TokenB===NATIVE_SOL_MINT ? [poolPDA] : await PublicKey.findProgramAddress(
      [Buffer.from("vault"), poolPDA.toBuffer(), TokenB.toBuffer()],
      AMM_PROGRAM_ID
    );

    const userTokenA = TokenA ===NATIVE_SOL_MINT ? userKeypair.publicKey : getAssociatedTokenAddressSync(TokenA, userKeypair.publicKey, false, SPL_TOKEN_PROGRAM_ID, ATA_PROGRAM_ID);
    const userTokenB = TokenB === NATIVE_SOL_MINT ? userKeypair.publicKey : getAssociatedTokenAddressSync(TokenB, userKeypair.publicKey, false, SPL_TOKEN_PROGRAM_ID, ATA_PROGRAM_ID);
    const userLP = getAssociatedTokenAddressSync(lpMint, userKeypair.publicKey, false, SPL_TOKEN_PROGRAM_ID, ATA_PROGRAM_ID);
    return {
        tokenA: TokenA,
        tokenB: TokenB,
        poolPDA: poolPDA,
        lpMint: lpMint,
        vaultA: vaultA,
        vaultB: vaultB,
        userTokenA: userTokenA,
        userTokenB: userTokenB,
        userLP: userLP
    }
}

async function main(){
    const tokenA = "EKrc5X3p1nhA2e59XkHYsDu2Lj3DYAAjZPW8vEbLgsm8";
    const tokenB = "3cgKXXJasRfzNBHL6ZufStoWW2i2myjSW9cVWkxRaxt6";
    const poolAddress = "XZnSFwsNAPj6zj3DFA33EHn3pY52uPMZGEQoGtATvJU";
    const percentage = 0.1;
    const config = await createPoolConfig(tokenA, tokenB,poolAddress);
    const r = await removeLiquidity(config, percentage,"regular");
}

main();
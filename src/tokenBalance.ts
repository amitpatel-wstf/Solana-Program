import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from 'bs58';
import "dotenv/config";


const connection = new Connection("https://rpc.gorbchain.xyz", {
    wsEndpoint: "wss://rpc.gorbchain.xyz/ws",
    commitment: "confirmed"
})

const userKeypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.PVT!)));


async function getTokenBalance() {
    const tokenOwnerAccounts = await connection.getParsedTokenAccountsByOwner(userKeypair.publicKey, {
        programId: new PublicKey("G22oYgZ6LnVcy7v8eSNi2xpNk1NcZiPD8CVKSTut7oZ6")
    })

   if(tokenOwnerAccounts){
    for(let i = 0; i < tokenOwnerAccounts.value.length; i++) {
        console.log("Token Address => ",tokenOwnerAccounts.value[i]?.pubkey.toString())
        console.log("Token Details => ",tokenOwnerAccounts.value[i]?.account.data.parsed)
    }
   }
}

getTokenBalance();
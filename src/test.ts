import { Connection, PublicKey } from "@solana/web3.js";
import { AccountLayout } from "@solana/spl-token";

export async function getBalance(userPubKey: string, mintAddress: string, connection: Connection) {
  try {
    const tokenAccounts = await connection.getTokenAccountsByOwner(
      new PublicKey(userPubKey),
      { mint: new PublicKey(mintAddress) }
    );

    if (tokenAccounts.value.length === 0) {
      console.log("No token accounts found for this mint");
      return 0;
    }

    // Decode the account data to get the balance
    const accountInfo = tokenAccounts.value[0];
    if(!accountInfo) return 0;

    if (!accountInfo?.account.data) {
      console.log("No account data found");
      return 0;
    }
    // @ts-expect-error
    const accountData = AccountLayout.decode(accountInfo?.account?.data);

    console.log("Token Account:", accountInfo.pubkey.toString());
    console.log("Balance:", accountData.amount.toString());

    return accountData.amount.toString();

  } catch (error) {
    console.error("Error getting balance:", error);
    return 0;
  }
}

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

getBalance("Fds56LQv7DqPrwxte7NwQMxV9irEVRZivTwEx82Tijg7", "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr", connection)
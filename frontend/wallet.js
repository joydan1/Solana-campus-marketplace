import { useProgram } from "./useProgram";
import * as web3 from "@solana/web3.js";

export function useMarketplace() {
  const { getProgram, walletAddress } = useProgram();

  const listItem = async (name, price, category) => {
    const program = getProgram();
    if (!program) throw new Error("Wallet not connected");

    const itemAccount = web3.Keypair.generate();

    await program.methods
      .listItem(name, price, category, false)
      .accounts({
        item: itemAccount.publicKey,
        seller: new web3.PublicKey(walletAddress),
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([itemAccount])
      .rpc();

    alert(`Item listed: ${itemAccount.publicKey.toBase58()}`);
  };

  const buyItem = async (itemPubkey, sellerPubkey) => {
    const program = getProgram();
    if (!program) throw new Error("Wallet not connected");

    await program.methods
      .buyItem()
      .accounts({
        item: new web3.PublicKey(itemPubkey),
        buyer: new web3.PublicKey(walletAddress),
        seller: new web3.PublicKey(sellerPubkey),
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    alert(`Item purchased: ${itemPubkey}`);
  };

  return { listItem, buyItem };
}
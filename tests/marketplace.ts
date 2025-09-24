import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Marketplace } from "../target/types/marketplace";
import { expect } from "chai";

describe("marketplace", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.Marketplace as Program<Marketplace>;

  it("Lists, buys, and confirms an item with escrow", async () => {
    // Generate a new keypair for the item account
    const itemKeypair = anchor.web3.Keypair.generate();

    // Define item data
    const name = "Physics Textbook";
    const price = new anchor.BN(1_000_000); // 0.001 SOL
    const category = "Books";
    const useEscrow = true;

    // LIST ITEM
    await program.methods
      .listItem(name, price, category, useEscrow)
      .accounts({
        item: itemKeypair.publicKey,
        seller: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([itemKeypair])
      .rpc();

    console.log("Item listed:", itemKeypair.publicKey.toBase58());

    // BUY ITEM (simulate another user)
    const buyer = anchor.web3.Keypair.generate();

    // Airdrop SOL to buyer so they can purchase
    const connection = provider.connection;
    await connection.requestAirdrop(buyer.publicKey, 2_000_000_000); // 2 SOL
    await new Promise((resolve) => setTimeout(resolve, 2000)); // wait for airdrop

    await program.methods
      .buyItem()
      .accounts({
        item: itemKeypair.publicKey,
        buyer: buyer.publicKey,
        seller: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    console.log("Item bought (escrow active)");

    // CONFIRM PURCHASE (releases funds)
    await program.methods
      .confirmPurchase()
      .accounts({
        item: itemKeypair.publicKey,
        buyer: buyer.publicKey,
        seller: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    console.log("Purchase confirmed and funds released");

    // Fetch account and verify state
    const itemAccount = await program.account.itemAccount.fetch(itemKeypair.publicKey);
    expect(itemAccount.sold).to.be.true;
    console.log("Final Item State:", itemAccount);
  });
});

import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { OrcafarmTest } from '../target/types/orcafarm_test';
import { ORCA_FARM_ID } from "@orca-so/sdk";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token, AccountLayout } from "@solana/spl-token";

describe('orcafarmTest', () => {

  // Configure the client to use the local cluster.
  let provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.OrcafarmTest as Program<OrcafarmTest>;

  const user = anchor.web3.Keypair.generate();
  const DEVNET_ORCASOL_FARM_PARAMS = Object.freeze({
    address: new PublicKey("6YrLcQs5yFvXkRY5VkMGEfVgo5rwozJf7jXedpZxbKmi"),
    farmTokenMint: new PublicKey("3z8o3b4gMBpnRsrDv7ruZPcVtgoULMFyEoEEGwTsw2TR"),
    rewardTokenMint: new PublicKey("orcarKHSqC5CDDsGbho8GKvwExejWHxTqGzXgcewB9L"),
    rewardTokenDecimals: 6,
    baseTokenMint: new PublicKey("CmDdQhusZWyi9fue27VSktYgkHefm3JXNdzc9kCpyvYi"),
    baseTokenDecimals: 6,
  });

  it('Is initialized!', async () => {
    // Add your test here.

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user.publicKey, 1000000000),
      "confirmed"
    );
    const [pdaFarmOwner, bump] = 
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("global-authority")],
      program.programId,
    );

    const tx = await program.rpc.initialize({
      instructions: [SystemProgram.transfer({
        fromPubkey: user.publicKey,
        toPubkey: pdaFarmOwner,
        lamports: 20000000
      })], 
      signers: [user]
    });
    console.log("Your transaction signature", tx);
  });

  it('inintialize pda user farm', async () => {
    
    let globalFarmAddress = DEVNET_ORCASOL_FARM_PARAMS.address;

    const [pdaFarmOwner, bump] = 
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("global-authority")],
        program.programId,
      );

    let pdaUserFarmAddress = (
      await PublicKey.findProgramAddress(
        [globalFarmAddress.toBuffer(), pdaFarmOwner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer()], ORCA_FARM_ID)
    )[0];

    console.log("user.publicKey =", user.publicKey.toBase58());
    console.log("globalFarm =", globalFarmAddress.toBase58());
    console.log("pdaUserFarmAddress =", pdaUserFarmAddress.toBase58());
    console.log("pdaFarmOwner =", pdaFarmOwner.toBase58());
    console.log("ORCA_FARM_ID =", ORCA_FARM_ID.toBase58());

    let tx = await program.rpc.initPdaUserFarm(
      bump, {
        accounts: {
          payer: user.publicKey,
          globalFarm: globalFarmAddress,
          pdaUserFarm: pdaUserFarmAddress,
          farmOwner: pdaFarmOwner,
          orcaFarmProgram: ORCA_FARM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        },
        signers: [user]
      }
    );
    console.log("payer=", user.publicKey.toBase58());
    console.log("globalFarm=", globalFarmAddress.toBase58());
    console.log("pdaUserFarm=", pdaUserFarmAddress.toBase58());
    console.log("farmOwner=", pdaFarmOwner.toBase58());
    console.log("orcaFarmProgram=", ORCA_FARM_ID.toBase58());
    console.log("tx =", tx);
  })
});

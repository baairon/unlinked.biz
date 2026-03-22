import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { UnlinkedProfile } from "../target/types/unlinked_profile";
import { assert } from "chai";

describe("unlinked-profile", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.UnlinkedProfile as Program<UnlinkedProfile>;
  const authority = provider.wallet;

  const [profilePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("profile"), authority.publicKey.toBuffer()],
    program.programId
  );

  const testCid = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";

  it("initializes a profile", async () => {
    await program.methods
      .initializeProfile(testCid)
      .accounts({
        profile: profilePda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const account = await program.account.profileAccount.fetch(profilePda);
    assert.equal(account.cid, testCid);
    assert.equal(account.version, 1);
    assert.ok(account.authority.equals(authority.publicKey));
  });

  it("updates a profile", async () => {
    const newCid = "QmNewCidAfterProfileUpdate1234567890abcdefghijk";

    await program.methods
      .updateProfile(newCid)
      .accounts({
        profile: profilePda,
        authority: authority.publicKey,
      })
      .rpc();

    const account = await program.account.profileAccount.fetch(profilePda);
    assert.equal(account.cid, newCid);
    assert.equal(account.version, 2);
  });

  it("rejects CID longer than 64 characters", async () => {
    const longCid = "a".repeat(65);

    try {
      await program.methods
        .updateProfile(longCid)
        .accounts({
          profile: profilePda,
          authority: authority.publicKey,
        })
        .rpc();
      assert.fail("Should have thrown");
    } catch (err) {
      assert.include(err.toString(), "CidTooLong");
    }
  });
});

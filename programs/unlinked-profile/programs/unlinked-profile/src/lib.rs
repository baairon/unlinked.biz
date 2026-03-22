use anchor_lang::prelude::*;

// TODO: Replace with new program ID after deployment
declare_id!("DQfdaW4gHY64GJpocjyseyB3QAwava5EseW7Ghi9YRRp");

#[program]
pub mod unlinked_profile {
    use super::*;

    pub fn initialize_profile(ctx: Context<InitializeProfile>, cid: String) -> Result<()> {
        require!(cid.len() <= 200, ProfileError::CidTooLong);

        let profile = &mut ctx.accounts.profile;
        profile.authority = ctx.accounts.authority.key();
        profile.cid = cid;
        profile.updated_at = Clock::get()?.unix_timestamp;
        profile.version = 1;
        profile.bump = ctx.bumps.profile;

        Ok(())
    }

    pub fn update_profile(ctx: Context<UpdateProfile>, cid: String) -> Result<()> {
        require!(cid.len() <= 200, ProfileError::CidTooLong);

        let profile = &mut ctx.accounts.profile;
        profile.cid = cid;
        profile.updated_at = Clock::get()?.unix_timestamp;
        profile.version = profile.version.checked_add(1).unwrap();

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeProfile<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + (4 + 200) + 8 + 4 + 1,
        seeds = [b"profile", authority.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, ProfileAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateProfile<'info> {
    #[account(
        mut,
        realloc = 8 + 32 + (4 + 200) + 8 + 4 + 1,
        realloc::payer = authority,
        realloc::zero = false,
        seeds = [b"profile", authority.key().as_ref()],
        bump = profile.bump,
        has_one = authority
    )]
    pub profile: Account<'info, ProfileAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct ProfileAccount {
    pub authority: Pubkey,
    pub cid: String,
    pub updated_at: i64,
    pub version: u32,
    pub bump: u8,
}

#[error_code]
pub enum ProfileError {
    #[msg("CID must be 200 characters or fewer")]
    CidTooLong,
}

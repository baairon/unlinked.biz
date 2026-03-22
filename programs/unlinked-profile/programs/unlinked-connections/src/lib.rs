use anchor_lang::prelude::*;

declare_id!("8fnvM2kBVXQLCAqAMQp6Fv6Ks5deXEvVSNPLBmARVRH8");

#[program]
pub mod unlinked_connections {
    use super::*;
    
    pub fn send_request(
        ctx: Context<SendRequest>,
        wallet_a: Pubkey,
        wallet_b: Pubkey,
    ) -> Result<()> {
        let from_key = ctx.accounts.from.key();
        let to_key = ctx.accounts.to.key();

        
        require!(
            wallet_a.to_bytes() < wallet_b.to_bytes(),
            ConnectionError::KeysNotOrdered
        );

        
        let (expected_a, expected_b) = ordered_keys(&from_key, &to_key);
        require!(
            wallet_a == expected_a && wallet_b == expected_b,
            ConnectionError::KeyMismatch
        );

        require!(from_key != to_key, ConnectionError::CannotConnectSelf);

        let conn = &mut ctx.accounts.connection;
        conn.from = from_key;
        conn.to = to_key;
        conn.status = ConnectionStatus::Pending as u8;
        conn.created_at = Clock::get()?.unix_timestamp;
        conn.accepted_at = 0;
        conn.bump = ctx.bumps.connection;

        Ok(())
    }

    
    pub fn accept_request(
        ctx: Context<AcceptRequest>,
        wallet_a: Pubkey,
        wallet_b: Pubkey,
    ) -> Result<()> {
        let conn = &mut ctx.accounts.connection;

        require!(
            conn.to == ctx.accounts.to.key(),
            ConnectionError::NotRecipient
        );
        require!(
            conn.status == ConnectionStatus::Pending as u8,
            ConnectionError::NotPending
        );

        
        require!(
            wallet_a.to_bytes() < wallet_b.to_bytes(),
            ConnectionError::KeysNotOrdered
        );

        conn.status = ConnectionStatus::Accepted as u8;
        conn.accepted_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    
    
    pub fn reject_request(
        ctx: Context<RejectRequest>,
        wallet_a: Pubkey,
        wallet_b: Pubkey,
    ) -> Result<()> {
        let conn = &ctx.accounts.connection;
        let signer = ctx.accounts.closer.key();

        require!(
            wallet_a.to_bytes() < wallet_b.to_bytes(),
            ConnectionError::KeysNotOrdered
        );
        require!(
            conn.status == ConnectionStatus::Pending as u8,
            ConnectionError::NotPending
        );
        require!(
            signer == conn.from || signer == conn.to,
            ConnectionError::Unauthorized
        );

        Ok(())
    }

    
    
    pub fn remove_connection(
        ctx: Context<RemoveConnection>,
        wallet_a: Pubkey,
        wallet_b: Pubkey,
    ) -> Result<()> {
        let conn = &ctx.accounts.connection;
        let signer = ctx.accounts.closer.key();

        require!(
            wallet_a.to_bytes() < wallet_b.to_bytes(),
            ConnectionError::KeysNotOrdered
        );
        require!(
            conn.status == ConnectionStatus::Accepted as u8,
            ConnectionError::NotAccepted
        );
        require!(
            signer == conn.from || signer == conn.to,
            ConnectionError::Unauthorized
        );

        Ok(())
    }
}

fn ordered_keys(a: &Pubkey, b: &Pubkey) -> (Pubkey, Pubkey) {
    if a.to_bytes() < b.to_bytes() {
        (*a, *b)
    } else {
        (*b, *a)
    }
}



#[derive(Accounts)]
#[instruction(wallet_a: Pubkey, wallet_b: Pubkey)]
pub struct SendRequest<'info> {
    #[account(
        init,
        payer = from,
        space = 8 + ConnectionAccount::INIT_SPACE,
        seeds = [b"connection", wallet_a.as_ref(), wallet_b.as_ref()],
        bump,
    )]
    pub connection: Account<'info, ConnectionAccount>,

    #[account(mut)]
    pub from: Signer<'info>,

    pub to: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(wallet_a: Pubkey, wallet_b: Pubkey)]
pub struct AcceptRequest<'info> {
    #[account(
        mut,
        seeds = [b"connection", wallet_a.as_ref(), wallet_b.as_ref()],
        bump = connection.bump,
    )]
    pub connection: Account<'info, ConnectionAccount>,

    pub to: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(wallet_a: Pubkey, wallet_b: Pubkey)]
pub struct RejectRequest<'info> {
    #[account(
        mut,
        seeds = [b"connection", wallet_a.as_ref(), wallet_b.as_ref()],
        bump = connection.bump,
        close = closer,
    )]
    pub connection: Account<'info, ConnectionAccount>,

    #[account(mut)]
    pub closer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(wallet_a: Pubkey, wallet_b: Pubkey)]
pub struct RemoveConnection<'info> {
    #[account(
        mut,
        seeds = [b"connection", wallet_a.as_ref(), wallet_b.as_ref()],
        bump = connection.bump,
        close = closer,
    )]
    pub connection: Account<'info, ConnectionAccount>,

    #[account(mut)]
    pub closer: Signer<'info>,
}



#[account]
#[derive(InitSpace)]
pub struct ConnectionAccount {
    pub from: Pubkey,       
    pub to: Pubkey,         
    pub status: u8,         
    pub created_at: i64,    
    pub accepted_at: i64,   
    pub bump: u8,           
}

#[derive(Clone, Copy, PartialEq)]
pub enum ConnectionStatus {
    Pending = 0,
    Accepted = 1,
}

#[error_code]
pub enum ConnectionError {
    #[msg("Cannot send a connection request to yourself")]
    CannotConnectSelf,
    #[msg("Only the recipient can accept this request")]
    NotRecipient,
    #[msg("Connection request is not in pending state")]
    NotPending,
    #[msg("Connection is not in accepted state")]
    NotAccepted,
    #[msg("You are not a party to this connection")]
    Unauthorized,
    #[msg("Wallet keys must be in canonical order (a < b)")]
    KeysNotOrdered,
    #[msg("Provided keys do not match the from/to pair")]
    KeyMismatch,
}

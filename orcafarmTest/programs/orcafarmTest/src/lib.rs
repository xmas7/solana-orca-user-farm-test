use anchor_lang::prelude::*;
use solana_program::{
    program::{ invoke_signed },
    instruction::Instruction
};

declare_id!("H1rzmWRUrR4wp5q3zPicGGk4mSPGDxMHiX8EfpDoAb6E");

#[account]
#[derive(Default)]
pub struct GlobalState {
    pub super_owner: Pubkey,
    pub mint_usd: Pubkey,
}

pub const AUTHORITY_TAG: &[u8] = b"global-authority";

#[program]
pub mod orcafarm_test {
    use super::*;

    pub enum INSTRUCTIONS {
        InitGlobalFarm,
        InitUserFarm,
        ConvertTokens,
        RevertTokens,
        Harvest,
        RemoveRewards,
        SetEmissionsPerSecond,
    }

    pub fn initialize(_ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }

    
    pub fn init_pda_user_farm(
        ctx: Context<InitPdaUserFarm>,
        bump: u8
    ) -> ProgramResult {
        msg!("init_pda_user_farm {:?}", ctx.accounts.farm_owner.key());
        invoke_signed(
            &Instruction {
                program_id: ctx.accounts.orca_farm_program.key(),
                data: vec![INSTRUCTIONS::InitUserFarm as u8],
                accounts: vec![
                    AccountMeta::new_readonly(ctx.accounts.global_farm.key(), false),
                    AccountMeta::new(ctx.accounts.pda_user_farm.key(), false),
                    AccountMeta::new_readonly(ctx.accounts.farm_owner.key(), true),
                    AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                ]
            },
            &[
                ctx.accounts.global_farm.to_account_info().clone(),
                ctx.accounts.pda_user_farm.to_account_info().clone(),
                ctx.accounts.farm_owner.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
                ctx.accounts.orca_farm_program.to_account_info().clone()
            ],
            &[&[
                AUTHORITY_TAG, &[bump]
            ]]
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct InitPdaUserFarm<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub global_farm: AccountInfo<'info>,

    #[account(mut)]
    pub pda_user_farm: AccountInfo<'info>,

    #[account(
        init_if_needed,
        seeds = [AUTHORITY_TAG],
        bump = bump,
        payer = payer
    )]
    pub farm_owner: Account<'info, GlobalState>,

    pub orca_farm_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}
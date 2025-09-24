use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("Dh9qpAVZunvQrHuBiMRExS6b8ieCBMdnM3vnRa9SfLJZ"); // Change after deploy

#[program]
pub mod marketplace {
    use super::*;

    pub fn list_item(
        ctx: Context<ListItem>,
        name: String,
        price: u64,
        category: String,
        use_escrow: bool,
    ) -> Result<()> {
        require!(name.len() <= 50, MarketplaceError::NameTooLong);
        require!(category.len() <= 20, MarketplaceError::CategoryTooLong);

        let item = &mut ctx.accounts.item;
        item.seller = ctx.accounts.seller.key();
        item.name = name.clone();
        item.price = price;
        item.category = category.clone();
        item.sold = false;
        item.escrow = use_escrow;
        item.buyer = None;

        emit!(ItemListed {
            seller: item.seller,
            name,
            price,
            category,
            escrow: use_escrow,
        });

        Ok(())
    }

    pub fn buy_item(ctx: Context<BuyItem>) -> Result<()> {
        let item = &mut ctx.accounts.item;
        require!(!item.sold, MarketplaceError::AlreadySold);

        let buyer = &ctx.accounts.buyer;
        let seller = &ctx.accounts.seller;
        let system_program = &ctx.accounts.system_program;

        if item.escrow {
            // Store buyer and wait for confirmation
            item.buyer = Some(buyer.key());
            item.sold = true;
        } else {
            // Direct transfer
            let ix = Transfer {
                from: buyer.to_account_info(),
                to: seller.to_account_info(),
            };
            transfer(CpiContext::new(system_program.to_account_info(), ix), item.price)?;
            item.sold = true;
        }

        emit!(ItemBought {
            buyer: buyer.key(),
            seller: seller.key(),
            price: item.price,
            escrow: item.escrow,
        });

        Ok(())
    }

    pub fn confirm_purchase(ctx: Context<ConfirmPurchase>) -> Result<()> {
        let item = &mut ctx.accounts.item;
        require!(item.escrow, MarketplaceError::NotEscrow);
        require!(item.buyer == Some(ctx.accounts.buyer.key()), MarketplaceError::NotAuthorized);
        require!(item.sold, MarketplaceError::NotSold);

        let ix = Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.seller.to_account_info(),
        };
        transfer(
            CpiContext::new(ctx.accounts.system_program.to_account_info(), ix),
            item.price,
        )?;

        emit!(ItemConfirmed {
            buyer: ctx.accounts.buyer.key(),
            seller: ctx.accounts.seller.key(),
            price: item.price,
        });

        Ok(())
    }

    pub fn close_item(ctx: Context<CloseItem>) -> Result<()> {
        let item = &ctx.accounts.item;
        require!(item.seller == ctx.accounts.seller.key(), MarketplaceError::NotAuthorized);
        require!(!item.sold, MarketplaceError::AlreadySold);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct ListItem<'info> {
    #[account(init, payer = seller, space = 8 + ItemAccount::LEN)]
    pub item: Account<'info, ItemAccount>,
    #[account(mut)]
    pub seller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyItem<'info> {
    #[account(mut)]
    pub item: Account<'info, ItemAccount>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: Safe because we only transfer lamports
    #[account(mut)]
    pub seller: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConfirmPurchase<'info> {
    #[account(mut)]
    pub item: Account<'info, ItemAccount>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: Safe because we only transfer lamports
    #[account(mut)]
    pub seller: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseItem<'info> {
    #[account(mut, close = seller)]
    pub item: Account<'info, ItemAccount>,
    #[account(mut)]
    pub seller: Signer<'info>,
}

#[account]
pub struct ItemAccount {
    pub seller: Pubkey,
    pub name: String,
    pub price: u64,
    pub category: String,
    pub sold: bool,
    pub escrow: bool,
    pub buyer: Option<Pubkey>,
}

impl ItemAccount {
    // Calculate storage size
    pub const LEN: usize = 
        32 + // seller
        4 + 50 + // name (max 50 chars)
        8 + // price
        4 + 20 + // category (max 20 chars)
        1 + // sold
        1 + // escrow
        1 + 32; // buyer (Option<Pubkey>)
}

#[event]
pub struct ItemListed {
    pub seller: Pubkey,
    pub name: String,
    pub price: u64,
    pub category: String,
    pub escrow: bool,
}

#[event]
pub struct ItemBought {
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub price: u64,
    pub escrow: bool,
}

#[event]
pub struct ItemConfirmed {
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub price: u64,
}
#[event]
pub struct ItemClosed {
    pub seller: Pubkey,
    pub name: String,
}
#[error_code]
pub enum MarketplaceError {
    #[msg("Item name too long")]
    NameTooLong,
    #[msg("Category too long")]
    CategoryTooLong,
    #[msg("This item has already been sold")]
    AlreadySold,
    #[msg("This item is not sold yet")]
    NotSold,
    #[msg("Only the authorized user can perform this action")]
    NotAuthorized,
    #[msg("Item does not use escrow")]
    NotEscrow,
}


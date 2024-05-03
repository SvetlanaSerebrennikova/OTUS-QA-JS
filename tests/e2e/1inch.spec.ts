// tests/e2e/example.spec.js
import {test} from '../fixtures';
import {
    ACCOUNT_BOX_USDT_ASSET,
    ACCOUNT_SEND_TOKEN_INPUT,
    DROPDOWN_SELECT_SRC_TOKEN,
    DST_TOKEN_SYMBOL,
    GIVE_PERMISSION_BUTTON,
    HEADER_ACCOUNT_ADDRESS,
    HEADER_ACCOUNT_BOX,
    IMPORT_CUSTOM_TOKEN_BUTTON,
    IMPORT_IMPORT_CUSTOM_TOKEN_BUTTON,
    IMPORT_TOKEN_WARNING_CHECKBOX,
    INPUT_TOKEN_LIST,
    LIMIT_BOX_DESTINATION_TOKEN_INPUT,
    LIMIT_PRICE_ALERT,
    MARKET_LIMIT_ORDER,
    REVIEW_LIMIT_ORDER,
    SEND_BUTTON,
    SENT_TO_ANOTHER_ADDRESS_INPUT,
    SRC_TOKEN_SYMBOL,
    SWAP_BOX_SOURCE_TOKEN_INPUT,
    SWAP_BOX_SWAP_BUTTON_INSUFFICIENT_BALANCE,
    SWAP_BUTTON,
    SWAP_BUTTON_CONFIRM_SWAP,
    TX_DIALOG_TITLE,
    VERIFY_LIMIT_ORDER
} from "../../pages/1inch";
import {Web3RequestKind} from './helpers';
import Routes from "../../pages/routes";
import {expect} from "@playwright/test";

test('1 Verify if the wallet is connected', async ({page, helpers, injectWeb3Provider}) => {
    await helpers.visitWithWallet();
    await helpers.haveText(HEADER_ACCOUNT_ADDRESS, '0xb194...8b18');
})

test('2 select tokens, verify that was selected', async ({page, helpers, injectWeb3Provider}) => {
    await helpers.visitWithWallet();
    await helpers.selectTokens();
    await helpers.haveText(SRC_TOKEN_SYMBOL, 'U USDT');
    await helpers.haveText(DST_TOKEN_SYMBOL, ' U USDC');
})

test('3 swap disabled', async ({page, helpers, injectWeb3Provider}) => {
    await helpers.visitWithWallet();
    await helpers.selectTokens();
    await page.fill(SWAP_BOX_SOURCE_TOKEN_INPUT, '');
    await page.type(SWAP_BOX_SOURCE_TOKEN_INPUT, '111');
    await helpers.haveText(SWAP_BOX_SWAP_BUTTON_INSUFFICIENT_BALANCE, 'Insufficient USDT balance');
    await page.isDisabled(SWAP_BOX_SWAP_BUTTON_INSUFFICIENT_BALANCE);
})

test('4 fusion swap', async ({page, helpers, injectWeb3Provider}) => {
    await helpers.visitWithWallet();
    await helpers.selectTokens();
    await page.fill(SWAP_BOX_SOURCE_TOKEN_INPUT, '');
    await page.type(SWAP_BOX_SOURCE_TOKEN_INPUT, '1');
    await helpers.pageHasNoSkeletons();
    await helpers.haveText(SWAP_BUTTON, 'Swap');
    await page.click(SWAP_BUTTON);
    await helpers.haveText(SWAP_BUTTON_CONFIRM_SWAP, 'Confirm swap');
    await helpers.pageHasNoSkeletons();
    await page.waitForTimeout(2_000);
    await page.click(SWAP_BUTTON_CONFIRM_SWAP);
    await injectWeb3Provider.authorize(Web3RequestKind.SignTypedDataV4);
    await page.isVisible(TX_DIALOG_TITLE);
})

test('5 create limit order', async ({page, helpers, injectWeb3Provider}) => {
    await helpers.visitWithWallet();
    await page.click(MARKET_LIMIT_ORDER);
    await helpers.selectTokens();
    await page.fill(SWAP_BOX_SOURCE_TOKEN_INPUT, '');
    await page.type(SWAP_BOX_SOURCE_TOKEN_INPUT, '1');
    await page.fill(LIMIT_BOX_DESTINATION_TOKEN_INPUT, '');
    await page.type(LIMIT_BOX_DESTINATION_TOKEN_INPUT, '2');
    await helpers.pageHasNoSkeletons();
    await helpers.haveText(REVIEW_LIMIT_ORDER, 'Review limit order');
    await page.click(REVIEW_LIMIT_ORDER);
    await helpers.haveText(VERIFY_LIMIT_ORDER, 'Verify order');
    await helpers.pageHasNoSkeletons();
    await page.waitForTimeout(2_000);
    await page.click(VERIFY_LIMIT_ORDER);
    await injectWeb3Provider.authorize(Web3RequestKind.SignTypedDataV4);
    await page.isVisible(TX_DIALOG_TITLE);
})

test('6 classic swap', async ({page, helpers, injectWeb3Provider}) => {
    await helpers.visitWithWallet();
    await helpers.selectTokens();
    await page.fill(SWAP_BOX_SOURCE_TOKEN_INPUT, '');
    await page.type(SWAP_BOX_SOURCE_TOKEN_INPUT, '0.01');
    await helpers.pageHasNoSkeletons();
    await helpers.haveText(SWAP_BUTTON, 'Swap');
    await page.click(SWAP_BUTTON);
    await helpers.haveText(SWAP_BUTTON_CONFIRM_SWAP, 'Confirm swap');
    await helpers.pageHasNoSkeletons();
    await page.waitForTimeout(2_000);
    await page.click(SWAP_BUTTON_CONFIRM_SWAP);
    await injectWeb3Provider.authorize(Web3RequestKind.SendTransaction);
    await page.isVisible(TX_DIALOG_TITLE);
})

test('7 send', async ({page, helpers, injectWeb3Provider}) => {
    await helpers.visitWithWallet();
    await page.click(HEADER_ACCOUNT_BOX);
    await page.waitForTimeout(4_000);
    await page.click(ACCOUNT_BOX_USDT_ASSET);
    await page.fill(SENT_TO_ANOTHER_ADDRESS_INPUT, '');
    await page.type(SENT_TO_ANOTHER_ADDRESS_INPUT, '0x3b608c5243732903152E38F1dAB1056A4A79b980');
    await page.fill(ACCOUNT_SEND_TOKEN_INPUT, '');
    await page.type(ACCOUNT_SEND_TOKEN_INPUT, '1');
    await helpers.pageHasNoSkeletons();
    await helpers.haveText(SEND_BUTTON, 'Send');
    await helpers.pageHasNoSkeletons();
    await page.waitForTimeout(2_000);
    await page.click(SEND_BUTTON);
    await injectWeb3Provider.authorize(Web3RequestKind.SendTransaction);
    await page.isVisible(TX_DIALOG_TITLE);
})

test('8 add custom token', async ({page, helpers, injectWeb3Provider}) => {
    await helpers.visitWithWallet();
    await page.click(DROPDOWN_SELECT_SRC_TOKEN);
    await page.type(INPUT_TOKEN_LIST, 'TOON');
    await page.click(IMPORT_CUSTOM_TOKEN_BUTTON);
    await page.click(IMPORT_TOKEN_WARNING_CHECKBOX);
    await page.click(IMPORT_IMPORT_CUSTOM_TOKEN_BUTTON);
    await helpers.haveText(SRC_TOKEN_SYMBOL, " T TOON");
})

test('9 Check price alert on limit order form', async ({page, helpers, injectWeb3Provider}) => {
    await helpers.visitWithWallet();
    await page.click(MARKET_LIMIT_ORDER);
    await helpers.selectTokens();
    await page.fill(SWAP_BOX_SOURCE_TOKEN_INPUT, '');
    await page.type(SWAP_BOX_SOURCE_TOKEN_INPUT, '2');
    await page.fill(LIMIT_BOX_DESTINATION_TOKEN_INPUT, '');
    await page.type(LIMIT_BOX_DESTINATION_TOKEN_INPUT, '1');
    await page.isVisible(LIMIT_PRICE_ALERT);
})

test('10 Give permission to use token', async ({page, helpers, injectWeb3Provider}) => {
    await helpers.visitWithWallet();
    await page.click(MARKET_LIMIT_ORDER);
    await helpers.pageHasNoSkeletons();
    await page.click(GIVE_PERMISSION_BUTTON);
    await injectWeb3Provider.authorize(Web3RequestKind.SendTransaction);
    await page.isVisible(TX_DIALOG_TITLE);
})

test('11 check native balance from API', async ({page, helpers, injectWeb3Provider}) => {
    await helpers.visitWithWallet();
    const nativeBalance = await helpers.nativeBalance(Routes.allowancesBalances);
    const json = await nativeBalance.json();
    const balance1 = json['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'].balance;
    const nativeBalanceFromPolygonscan = await page.request.get('https://api.polygonscan.com/api?module=account&action=balance&address=0xB19404C4a2D8B36C773bb9088AC4AC2Ba6908b18&apikey=DI67X3TBBKP6RW64UZ6XE8D3VY59KMXS7R');
    await expect(nativeBalanceFromPolygonscan).toBeOK();
    const json2 = await nativeBalanceFromPolygonscan.json();
    const balance2 = json2.result;
    expect(balance1).toEqual(balance2);
})



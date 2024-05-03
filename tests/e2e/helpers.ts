import {expect, Locator, Page, TestInfo} from '@playwright/test';
import playwrightConfig from "../../playwright.config";
import {
    CONNECT_WALLET_BUTTON_BROWSER_WALLET,
    COOKIE_AGREE_BUTTON,
    DROPDOWN_SELECT_DST_TOKEN,
    DROPDOWN_SELECT_SRC_TOKEN,
    INPUT_TOKEN_LIST,
    SWAP_BOX_CONNECT_WALLET_BUTTON,
    TOKEN_LIST_USDC_TOKEN,
    TOKEN_LIST_USDT_TOKEN
} from "../../pages/1inch";
import {Web3ProviderBackend} from "headless-web3-provider";
import * as dotenv from 'dotenv';

dotenv.config();


const assertTimeout = playwrightConfig.expect.timeout;

export enum Web3RequestKind {
    RequestAccounts = 'eth_requestAccounts',
    SendTransaction = 'eth_sendTransaction',
    SignTypedDataV4 = 'eth_signTypedData_v4',
}

export class Helpers {
    readonly page: Page;
    readonly injectWeb3Provider: Web3ProviderBackend;

    constructor(page: Page, injectWeb3Provider: Web3ProviderBackend, testInfo: TestInfo) {
        this.page = page
        this.injectWeb3Provider = injectWeb3Provider
    };

    stringToLocator(selector: string | Locator): Locator {
        if (typeof selector === 'string') {
            selector = this.page.locator(selector);
        }
        return selector;
    }

    async haveText(
        selector: string | Locator,
        expected: string | string[],
        elementName = '',
        options: { timeout?: number; useInnerText?: boolean } = {
            timeout: assertTimeout,
            useInnerText: false
        }
    ) {
        const locator = this.stringToLocator(selector);

        elementName =
            elementName === '' ? `Element <${locator['_selector']}>` : `'${elementName}'`;
        console.log(
            `${elementName} should have text "${expected}" (timeout: ${options.timeout})`
        );
        await expect(
            locator,
            `${elementName} should have text "${expected}" (timeout: ${options.timeout})`
        ).toHaveText(expected, {
            timeout: options.timeout,
            useInnerText: options.useInnerText
        });
        return locator;
    }

    //visit with wallet
    async visitWithWallet() {
        await this.page.goto('https://app.1inch.io/#/137/advanced/swap');
        await this.page.click(COOKIE_AGREE_BUTTON);
        await this.page.click(SWAP_BOX_CONNECT_WALLET_BUTTON);
        await this.page.click(CONNECT_WALLET_BUTTON_BROWSER_WALLET);
        await this.injectWeb3Provider.authorize(Web3RequestKind.RequestAccounts);
    }

    async selectTokens() {
        await this.page.click(DROPDOWN_SELECT_SRC_TOKEN);
        await this.page.type(INPUT_TOKEN_LIST, 'USDT');
        await this.page.click(TOKEN_LIST_USDT_TOKEN);
        await this.page.click(DROPDOWN_SELECT_DST_TOKEN);
        await this.page.type(INPUT_TOKEN_LIST, 'USDC');
        await this.page.click(TOKEN_LIST_USDC_TOKEN);
    }

    async nativeBalance(route) {
        const request = await this.page.waitForRequest(route, {
            timeout: 10000
        });
        const response = await request.response();
        return response;
    }

    async pageHasNoSkeletons(timeout = assertTimeout) {
        const skeleton = '//div[contains(@class, "skeleton")]';
        console.log('Checking no loading skeletons on page');
        const a = async () => {
            await expect
                .poll(
                    async () => {
                        const elements = await this.page
                            .locator(skeleton)
                            .elementHandles();

                        const filtered = [];
                        for (const el of elements) {
                            const clazz = await el.getAttribute('class');
                            if (!clazz.includes('loading-skeleton'))
                                filtered.push(el);
                        }
                        const noSkeletons = filtered.length == 0;
                        if (noSkeletons) console.log('No skeletons anymore...');
                        // else console.log('Still skeletons...');
                        return noSkeletons;
                    },
                    {
                        message: `page should have no loading skeletons - timeout: ${timeout}`,
                        timeout: timeout
                    }
                )
                .toBeTruthy();
        }
    }
}



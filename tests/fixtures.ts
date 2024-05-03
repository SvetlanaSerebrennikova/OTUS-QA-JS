// tests/fixtures.js
import {test as base} from '@playwright/test'
import {injectHeadlessWeb3Provider, Web3ProviderBackend} from 'headless-web3-provider'
import {configDotenv} from "dotenv";
import {Helpers} from "./e2e/helpers";

// Read from default ".env" file.
configDotenv()

interface BaseTest {
    signers: string[],
    injectWeb3Provider: Web3ProviderBackend,
    helpers: Helpers
}

export const test = base.extend<BaseTest>({
    // signers - the private keys that are to be used in the tests
    signers: [process.env.PRIVATE_WALLET_KEY],
    // injectWeb3Provider - function that injects web3 provider instance into the page
    injectWeb3Provider: async ({signers, page}, use) => {
        const web3Provider = await injectHeadlessWeb3Provider(
            page,
            signers, // signers
            137, // Chain ID
            'https://polygon-rpc.com' // Polygon client's JSON-RPC URL
        )
        await use(web3Provider as Web3ProviderBackend)
    },
    helpers: async ({page, injectWeb3Provider}, use, testInfo) => {
        await use(new Helpers(page, injectWeb3Provider, testInfo));
    },
})


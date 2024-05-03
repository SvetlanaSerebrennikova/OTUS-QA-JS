// tests/e2e/example.spec.js
import { test } from '../fixtures'
import {Web3RequestKind} from "headless-web3-provider";
import {expect} from "@playwright/test";

test('connect the wallet', async ({ page, injectWeb3Provider }) => {
    // Inject window.ethereum instance
    const wallet = await injectWeb3Provider(page)

    await page.goto('https://metamask.github.io/test-dapp/')

    // Request connecting the wallet
    await page.getByRole('button', { name: 'Connect', exact: true }).click()

    // You can either authorize or reject the request
    await wallet.authorize(Web3RequestKind.RequestAccounts)

    // Verify if the wallet is really connected
    await expect(page.locator('text=Connected')).toBeVisible()
    await expect(page.locator(`text=${'0x6eDFb29e8BC75cbF448F2c557153DbcD979123b2'.toLowerCase()}`))
        .toBeVisible()
    await page.pause()
})

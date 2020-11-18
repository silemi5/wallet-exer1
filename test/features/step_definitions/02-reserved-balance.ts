import { Given, Then } from 'cucumber'
import axios from 'axios'
import chai from "chai";
import dotenv from 'dotenv'
import Account from '../../../src/models/account'

dotenv.config();

const expect = chai.expect;

const uri: string = process.env.API_URI || 'http://localhost:4000'

const instance = axios.create({
  baseURL: uri,
  headers: {
    'Content-Type': 'application/json'
  }
})

let account
let account_id: string
let balance: { initial: number; delta: number }
let reservedContext: string

// Create reserved balance
Given('I would like to set aside {float} for {string} spending, assuming I have {float} in my balance', async function (float, string, float2) {
  reservedContext = string
  balance = {
    initial: float2,
    delta: float
  }

  // Create account for this instance
  account = await Account.create({ balance: balance.initial })
  account_id = account._id

  const query = `
    mutation CreateReservedBalance($account: ID!, $context: String!, $amount: Float!) {
      createReservedBalance(account: $account, context: $context, amount: $amount)
    }
  `

  const results: boolean = await instance.post('graphql',{
    query: query,
    variables: { account: account_id, context: string, amount: float}
  })

  if(!results) throw new Error('Error on creating reserved balance!')
});

Then('a reserved balance is created with the amount of {float} while my balance should be subtracted by that amount.', async function (float) {
  const account: any = await Account.findById(account_id)
  const contextDocument: any = account.contexts.find((obj: any) => obj.name === reservedContext)

  expect(account.balance).to.equal(balance.initial - balance.delta)
  expect(contextDocument.reservedBalance).to.equal(float)
});

// Update reserved balance
Given('I like to use {float} in my reserved balance for {string} in a game', async function (float, string) {
  const account: any = await Account.findById(account_id)
  const contextDocument = account.contexts.find((obj: any) => obj.name === string)

  if(!contextDocument) throw new Error('Context not found!')

  reservedContext = string

  // Get initial reserve balance for an instance
  balance.initial = contextDocument.reservedBalance
  
  // Multiply float by -1 to make it negative
  balance.delta = float * -1

  const query = `
    mutation UpdateReservedBalance($account: ID!, $context: String!, $delta: Float!){
      updateReservedBalance(account: $account, context: $context, delta: $delta)
    }
  `

  const response: boolean = await instance.post('graphql', {
    query: query,
    variables: { account: account_id, context: string, delta: balance.delta }
  })

  if(!response) throw new Error('Error updating reserved balance!')

});

Then('my reserved balance should decrease by {float}', async function (float) {
  const account: any = await Account.findById(account_id)
  const contextDocument = account.contexts.find((obj: any) => obj.name === reservedContext)

  if(!contextDocument) throw new Error('Context not found!')

  expect(contextDocument.reservedBalance).to.equal(balance.initial + balance.delta)
});

// Release reserved balance
Given('that I would like to release my remaining reserved balance for {string}', async function (string) {
  // Get an account
  reservedContext = string
  const account: any = await Account.findById(account_id)
  const contextDocument: { context: string; reservedBalance: number } = await account.contexts.find((obj: any) => obj.name === reservedContext)
  balance = {
    initial: account.balance,
    delta: contextDocument.reservedBalance,
  }

  const query = `
    mutation ReleaseReservedBalance($id: ID!, $context: String!){
      releaseReservedBalance(account: $id, context: $context)
    }
  `

  const response: boolean = await instance.post('graphql', {
    query: query,
    variables: { id: account_id, context: string }
  })

  if(!response) throw new Error('Error releasing reserved balance!')
});

Then('the remaining balance should be added to my balance, while the reserved balance for a given context will be deleted', async function () {
  const account: any = await Account.findById(account_id)
  const contextDocument: any = await account.contexts.find((obj: any) => obj.name === reservedContext)

  expect(contextDocument.reservedBalance).to.equal(0);
  expect(account.balance).to.equal(balance.initial + balance.delta)
});

import { Before, Given, When, Then, After } from 'cucumber'
import axios from 'axios'
import chai from "chai";
import dotenv from 'dotenv'
import mongoose from 'mongoose'
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

let account_id: string
let response: {
  "data": {
    "data": {
      "account": {
        "id": string;
        "balance": number;
        "reservedBalance": number;
        "virtualBalance": number;
      }
    }
  }
}
let account
let balance: { initial: number; delta: number }

// Create reserved balance
Given('I would like to set aside {float} for {string} spending, assuming I have {float} in my balance', async function (float, string, float2) {
  balance.initial = float2
  balance.delta = float

  // Create account for this instance
  account = await Account.create({ balance: float2 })
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

  expect(account.balance).to.equal(balance.initial + balance.delta)
});

// Update reserved balance
Given('I like to use {float} in my reserved balance for {string} in a game', async function (float, string) {
  const account: any = await Account.findById(account_id)
  const reserveBalance: { context: string; balance: number } = account.getReservedBalance(string)

  // Get initial reserve balance for an instance
  balance.initial = reserveBalance.balance
  
  // Multiply float by -1 to make it negative
  balance.delta = float * -1

  const query = `
    mutation UpdateReservedBalance($id: ID!, context: String!, delta: Float!){
      updateReservedBalance(id: $id, context: $context, delta: $delta)
    }
  `

  const response: boolean = await instance.post('graphql', {
    query: query,
    variables: { id: account_id, context: string, delta: balance.delta }
  })

  if(!response) throw new Error('Error updating reserved balance!')

});

Then('my reserved balance should decrease by {float}', async function (float) {
  const account: any = await Account.findById(account_id)

  expect(account.balance).to.equal(balance.initial + balance.delta)
});

// Release reserved balance
Given('that I would like to use my remaining reserved balance for other purposes', async function () {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

Then('the remaining balance should be added to my balance, while the reserved balance for a given context will be deleted', async function () {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

import { Before, Given, When, Then, After } from 'cucumber'
import axios from 'axios'
import chai from "chai";
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Account from '../../../src/models/account'
import { isContext } from 'vm';

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
let balance: { initial: number; delta: number }
let virtualContext: string

// Update virtual balance
Given('I like to use {float} in my virtual balance in my {string} context', async function (float, string) {
  // Create account for this instance
  const context = {
    name: string,
    reservedBalance: 0,
    virtualBalance: 1000
  }
  account = await Account.create({ contexts: { context } })
  account_id = account._id

  balance.initial = 0
  balance.delta = float
  
  const query = `
    mutation UpdateVirtualBalance($account = ID!, $context = String!, $delta = Float!){
      updateVirtualBalance(account: $account, context: $context, delta: $delta)
    }
  `
  
  const result = await instance.post('graphql', {
    query: query,
    variables: { account: account_id, context: string, delta: balance.delta }
  })

  if(!result) throw new Error('Transaction failed for virtual balance!')


});

Then('my virtual balance on {string} context should decrease by {float}', async function (string, float) {
  account = await Account.findById(account_id)

  throw new Error('Undefined test!');
});

// Cancel virtual balance
Given('I like to cancel my virtual balance on the {string} context', async function (string) {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

Then('that virtual balance should be resetted to {float}', async function (float) {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

// Commit virtual balance
Given('I like to commit my virtual balance on the {string} context of {float}', async function (string, float) {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

Then('all my virtual balance for that context should be transferred to my main balance', async function () {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

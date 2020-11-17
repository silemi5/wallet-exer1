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

let account: any
let account_id: string
let balance: { initial: number; delta: number }
let virtualContext: string

// Update virtual balance
Given('I like to use {float} in my virtual balance in my {string} context', async function (float, string) {
  // Create account for this instance
  virtualContext = string
  const context = {
    name: virtualContext,
    reservedBalance: 0,
    virtualBalance: 1000
  }
  
  account = await Account.create({})
  account_id = account._id
  account.contexts.push(context)
  account.save()

  balance = {
    initial: context.virtualBalance,
    delta: (float * -1)
  }
  
  const query = `
    mutation UpdateVirtualBalance($account: ID!, $context: String!, $delta: Float!){
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
  virtualContext = string
  const account: any = await Account.findById(account_id)
  const contextDocument: { context: string; virtualBalance: number } = await account.contexts.find((obj: any) => obj.name === virtualContext)
  
  expect(contextDocument.virtualBalance).to.equal(balance.initial + balance.delta);
});

// Cancel virtual balance
Given('I like to cancel my virtual balance on the {string} context', async function (string) {
  // Create account for this instance
  virtualContext = string
  const context = {
    name: virtualContext,
    reservedBalance: 0,
    virtualBalance: 1000
  }
  
  account = await Account.create({})
  account_id = account._id
  account.contexts.push(context)
  account.save()

  const query = `
    mutation CancelVirtualBalance($account: ID!, $context: String!) {
      cancelVirtualBalance(account: $account, context: $context)
    }
  `

  const result = await instance.post('graphql',{
    query: query,
    variables: { account: account_id, context: virtualContext }
  })

  if(!result) throw new Error('Error on creating virtual balance!')
});

Then('that virtual balance should be resetted to {float}', async function (float) {
  const account: any = await Account.findById(account_id)
  const contextDocument: { context: string; virtualBalance: number } = await account.contexts.find((obj: any) => obj.name === virtualContext)

  expect(contextDocument.virtualBalance).to.equal(0)
});

// Commit virtual balance
Given('I like to commit my virtual balance on the {string} context of {float}', async function (string, float) {
  // Create account for this instance
  virtualContext = string
  const context = {
    name: virtualContext,
    reservedBalance: 0,
    virtualBalance: 1000
  }
  
  balance = {
    initial: 0,
    delta: context.virtualBalance
  }

  account = await Account.create({})
  account_id = account._id
  account.contexts.push(context)
  account.save()

  const query = `
    mutation CommitVirtualBalance($account: ID!, $context: String!) {
      commitVirtualBalance(account: $account, context: $context)
    }
  `

  const result = await instance.post('graphql',{
    query: query,
    variables: { account: account_id, context: virtualContext }
  })

  if(!result) throw new Error('Error on creating virtual balance!')
});

Then('all my virtual balance for that context should be transferred to my main balance', async function () {
  const account: any = await Account.findById(account_id)
  const contextDocument: { context: string; virtualBalance: number } = await account.contexts.find((obj: any) => obj.name === virtualContext)

  expect(account.balance).to.equal(balance.initial + balance.delta)
  expect(contextDocument.virtualBalance).to.equal(0)
});

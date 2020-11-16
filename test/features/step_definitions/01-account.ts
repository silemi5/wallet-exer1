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
let accountResponse: {
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
let accountsResponse: {
  "data": {
    "data": {
      "accounts": [{
        "id": string;
        "balance": number;
        "reservedBalance": number;
        "virtualBalance": number;
      }]
    }
  }
}
let balance: {before: number; after: number; delta: number}

Before(async () =>{
  const db_Uri: string = process.env.CONNECTION_DB_URI || ""
  await mongoose.connect(db_Uri)
})

// Get an account
Given('I want to get information about an account', async function () {
  // Drop first the collection for fresh start
  await mongoose.connection.db.dropCollection('accounts')
  await mongoose.connection.db.createCollection('accounts')

  // Create a new account, then returns the account ID to use in the tests below.
  const createdAccount = await Account.create({})
  
  account_id = createdAccount._id.toString()
});

When('I try to access it with {string} as the context', async function (string) {
  const query = `
    query GetAccount($id: ID!) {
      account(id: $id) {
        id,
        balance,
        reservedBalance(context: "${string}"),
        virtualBalance(context: "${string}")
      }
    }
  `

  try{
    accountResponse = await instance.post('graphql', {
      query: query,
      variables: { id: account_id }
    })
  } catch (e) {
    console.log(e)
  }

  if(!accountResponse) throw new Error('Something happened!')
});

Then('I should receive account details such as its ID, balance, reserved balance, and virtual balance', async function () {
  const res = accountResponse.data.data.account
  expect(res).to.have.all.keys('id', 'balance', 'reservedBalance', 'virtualBalance')
  expect(res).to.deep.equal({
    'id': account_id,
    'balance': 0,
    'reservedBalance': 0,
    'virtualBalance': 0,
  })
});

// Get all accounts
Given('I want to get all accounts with their information', async function () {
  // Create 3 accounts
  for(let x = 0; x < 3; x++){
    await Account.create({ balance: Math.random() * 1000 })
  }

  const query = `
    query GetAccounts($first: Int, $after: Binary){
      accounts(first: $first, after: $after){
        totalCount
        edges{
          node{
            id
            balance
          }
          cursor
        }
        pageInfo{
          endCursor
          hasNextPage
        }
      }
    }
  `

  accountsResponse = await instance.post('graphql', {
    query: query,
    variables: {  }
  })

  if(!accountsResponse) throw new Error('Something happened!')

});

Then('I should receive all accounts with their details with pagination', async function () {
  const res: any = accountsResponse.data.data.accounts
  expect(res).to.have.all.keys('totalCount', 'edges', 'pageInfo')
  expect(res.edges).to.be.an('array')
});

// Update account
Given('I want to add {float} to the balance of an account', async function (string) {
  const account: any = await Account.findById(account_id)
  balance = account.balance
  
  const query = `
    mutation UpdateAccount($account: ID!, $delta: Float!){
      updateBalance(account:$account, delta: $delta)
    }
  `
  const request = await instance.post('graphql', {
    query: query,
    variables: { account: account_id, delta: string }
  })

  if(!request) return false
  else return true

});

Then('the balance should increased by {float}', async function (float) {
  const account: any = Account.findById(account_id)

  expect(account.balance).to.equal(balance.after)

});

After(async () => {
  await mongoose.connection.close()
})

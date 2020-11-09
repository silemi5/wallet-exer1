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

Before(async () =>{
  const db_Uri: string = process.env.CONNECTION_DB_URI || ""
  await mongoose.connect(db_Uri)

  // Drop first the collection for fresh start
  mongoose.connection.db.dropCollection('accounts')

  
})

Given('I want to get information about an account', async function () {
  // Create a new account, then returns the account ID to use in the tests below.
  const createdAccount = await Account.create({})
  
  account_id = createdAccount._id.toString()
});

When('I try to access it with {string} as the context', async function (string) {
  const query = `
    query GetAccount($id: ID!, $context: String!) {
      account(id: $id) {
        id,
        balance,
        reservedBalance(context: $context),
        virtualBalance(context: $context)
      }
    }
  `

  try{
    response = await instance.post('graphql', {
      query: query,
      variables: { id: account_id, context: string }
    })
  } catch (e) {
    console.log(e)
  }

  if(!response) throw new Error('Something happened!')
});

Then('I should receive account details such as its ID, balance, reserved balance, and virtual balance', async function () {
  const res = response.data.data.account
  expect(res).to.have.all.keys('id', 'balance', 'reservedBalance', 'virtualBalance')
  expect(res).to.deep.equal({
    'id': account_id,
    'balance': 0,
    'reservedBalance': 0,
    'virtualBalance': 0,
  })
});

After(() => {
  mongoose.connection.close()
})

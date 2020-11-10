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

// Create reserved balance
Given('I would like to set aside {string} for {string} spending, assuming I have {string} in my balance', async function (string, string2, string3) {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

Then('a reserved balance is created with the amount of {string} while my balance should be subtracted by that amount.', async function (string) {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

// Update reserved balance
Given('I like to use {string} in my reserved balance for {string} in a game', async function (string, string2) {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

Then('my reserved balance should decrease by {string}', async function (string) {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
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

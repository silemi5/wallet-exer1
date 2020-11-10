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

// Create virtual balance
Given('I would like to held {string} for {string} context', async function (string, string2) {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

Then('a virtual balance is created with the amount of {string} for that context', async function (string) {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

// Update virtual balance
Given('I like to use {string} in my virtual balance in my {string} context', async function (string, string2) {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

Then('my virtual balance on {string} context should decrease by {string}', async function (string, string2) {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

// Cancel virtual balance
Given('I like to cancel my virtual balance on a context', async function () {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

Then('that virtual balance should be resetted to {string}', async function (string) {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

// Commit virtual balance
Given('I like to commit my virtual balance on a context', async function () {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

Then('all my virtual balance for that context should be transferred to my main balance', async function () {
  // Write code here that turns the phrase above into concrete actions
  throw new Error('Undefined test!');
});

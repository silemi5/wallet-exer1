import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Account from './models/account'

dotenv.config()

export const resolvers = {
  Account: {
    reservedBalance: async (parent: any, { context }: { context: string }) => {
      return (await getContext(parent, context)).reservedBalance
    },
    virtualBalance: async (parent: any, { context }: any) => {
      return (await getContext(parent, context)).virtualBalance
    }
  },
  Query: {
    account: async (_: null, args: { id: string}) => {
      // WARNING: Don't use `any`
      const account: any = await Account.findById(args.id)

      if(!account) throw new Error('Account not found!')

      return {
        id: account._id,
        balance: account.balance,
      } 
    },
    accounts: () => {
      // TODO: Implement this
      // Placeholders
      return [
        {
          id: 'INVALID-ID-1',
          balance: 0,
          reservedBalance: 0,
          virtualBalance: 0
        },
        {
          id: 'INVALID-ID-2',
          balance: 0,
          reservedBalance: 0,
          virtualBalance: 0
        },
      ]
    }
  },
  Mutation: {
    updateBalance: async (_: null, { account, delta }: { account: string, delta: number }) => {
      // WARNING: Avoid using `any` XD
      const acct: any = await Account.findById(account)

      if(!acct) throw new Error('Account not found!')

      if((acct.balance += delta ) < 0) throw new Error('Operation leads to negative balance!')

      // TODO: Operation on model, maybe on a function?
      acct.balance += delta
      await acct.save()
      
      return true;
    },
    createReservedBalance: async (_: null, { account, context, amount }: { account: string, context: string, amount: number }) => {
      // WARNING: Avoid using `any` XD
      const acct: any = await Account.findById(account)

      if(amount < 0) throw new Error('Invalid amount to put reserved balance!')

      let contextDocument = await acct.contexts.find((obj: any) => obj.name === context)
      if(!context){
        contextDocument = { name: context, reservedBalance: amount }
        acct.contexts.push(contextDocument)
      } else {
        contextDocument.reservedBalance += amount
      }
      
      await acct.save();

      return true;
    },
    updateReservedBalance: async (_: null, { account, context, delta }: { account: string; context: string, delta: number }) => {
      // WARNING: Avoid using `any` XD
      const acct: any = await Account.findById(account)
      const contextDocument = await acct.contexts.find((obj: any) => obj.name === context)

      if(!contextDocument) throw new Error(`Reserved balance for that context doesn't exist!`) 
      else {
        if((contextDocument.reservedBalance + delta) < 0) throw new Error('Invalid amount to put reserved balance!')
        else
          contextDocument.reservedBalance += delta
      }
      
      await acct.save();

      return true;
    },
    releaseReservedBalance: async (_: null, { account, context }: { account: string; context: string }) => {
      // WARNING: Avoid using `any` XD
      const acct: any = await Account.findById(account)
      const contextDocument = await acct.contexts.find((obj: any) => obj.name === context)

      if(!contextDocument) throw new Error(`Reserved balance for that context doesn't exist!`) 
      else {
        acct.balance += contextDocument.reservedBalance
        contextDocument.reservedBalance = 0
      }
      await acct.save();

      return true;
    },
    updateVirtualBalance: async (_: null, { account, context, delta }: { account: string; context: string, delta: number }) => {
      // WARNING: Avoid using `any` XD
      const acct: any = await Account.findById(account)
      const contextDocument = await acct.contexts.find((obj: any) => obj.name === context)

      if(!contextDocument) throw new Error(`Virtual balance for that context doesn't exist!`) 
      else {
        if((contextDocument.virtualBalance + delta) < 0) throw new Error('Invalid amount to put virtual balance!')
        else
          contextDocument.virtualBalance += delta
      }
      
      await acct.save();

      return true;
    },
    cancelVirtualBalance: async (_: null, { account, context }: { account: string; context: string }) => {
      // WARNING: Avoid using `any` XD
      const acct: any = await Account.findById(account)
      const contextDocument = await acct.contexts.find((obj: any) => obj.name === context)

      if(!contextDocument) throw new Error(`Virtual balance for that context doesn't exist!`) 
      else {
        contextDocument.virtualBalance = 0
      }
      await acct.save();

      return true;
    },
    commitVirtualBalance: async (_: null, { account, context }: { account: string; context: string }) => {
      // WARNING: Avoid using `any` XD
      const acct: any = await Account.findById(account)
      const contextDocument = await acct.contexts.find((obj: any) => obj.name === context)

      if(!contextDocument) throw new Error(`Virtual balance for that context doesn't exist!`) 
      else {
        acct.balance += contextDocument.virtualBalance
        contextDocument.virtualBalance = 0
      }
      await acct.save();

      return true;
    },
  },
}

const getContext = async (parent: any, context: any) => {
  parent = await Account.findById(parent.id)

  let contextDocument = parent.contexts.find((obj: any) => obj.name === context)

  if(!contextDocument) {
    contextDocument = { name: context, reservedBalance: 0, virtualBalance: 0 }
    parent.contexts.push(contextDocument);
    await parent.save();
  }

  return contextDocument
}

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
    createReservedBalance: (_: null, { account, context, amount }: { account: string, context: string, amount: number }): boolean => {
      // TODO: Implement this
      return false;
    },
    updateReservedBalance: (_: null, { context, delta }: { context: string, delta: number }): boolean => {
      // TODO: Implement this
      return false;
    },
    releaseReservedBalance: (_: null, { context }: { context: string }): boolean => {
      // TODO: Implement this
      return false;
    },
    updateVirtualBalance: (_: null, { context, delta }: { context: string, delta: number }): boolean => {
      // TODO: Implement this
      return false;
    },
    cancelVirtualBalance: (_: null, { context }: { context: string }): boolean => {
      // TODO: Implement this
      return false;
    },
    commitVirtualBalance: (_: null, { context }: { context: string }): boolean => {
      // TODO: Implement this
      return false;
    },
  },
}

const getContext = async (parent: any, context: any) => {
  parent = await Account.findById(parent.id)

  console.log(parent.contexts)
  let contextDocument = parent.contexts.find((obj: any) => obj.name === context)

  if(!contextDocument) {
    contextDocument = { name: context, reservedBalance: 0, virtualBalance: 0 }
    parent.contexts.push(contextDocument);
    await parent.save();
  }

  return contextDocument
}

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Account from './models/account'

dotenv.config()

export const resolvers = {
  Query: {
    account: async (_: null, args: { id: string; context: string }) => {
      // TODO: Find the cause why context is undefined
      // WARNING: Don't use `any`
      const account: any = await Account.findById(args.id)

      return {
        id: account._id,
        balance: account.balance,
        reservedBalance: account.getReservedBalance(args.context),
        virtualBalance: account.getVirtualBalance(args.context),
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
    updateBalance: (_: null, { account, delta }: { account: string, delta: number }): boolean => {
      // TODO: Implement this
      return false;
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
  }
}

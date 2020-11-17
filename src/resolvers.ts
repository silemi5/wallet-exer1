import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Account from './models/account'
import { v5 as uuid } from 'uuid'
import { cache } from './cache'

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
    accounts: async (_: any, args: { first: number | undefined; after: string | undefined }, context: { x_request_id: string | undefined }) => {
      const key = generateKey('account', args)

      // X-REQUEST-ID is given
      if(context.x_request_id === key){
        // Find in cache
       const cachedResponse: any = await findInCache(key)
       if(cachedResponse){
         return cachedResponse
       }
      }

      if(args.first === undefined){
        args.first = 10
      }

      let accounts
      if(args.after === undefined){
        accounts = await Account.find({ balance: { $gt: 0 } }).limit(args.first)
      } else {
        accounts = await Account.find({ _id: { $gt: args.after }, balance: { $gt: 0 } }).limit(args.first)
      }
      const accountsCount: number = await Account.countDocuments({ balance: { $gt: 0 } })
       
      const accountsConnectionEdge: any = []

      accounts.forEach((currentValue: any) => {
        accountsConnectionEdge.push({
          node: {
            id: currentValue._id,
            balance: currentValue.balance
          },
          cursor: currentValue._id
        })
      })

      const hasNextPage = () => {
        if(((accountsCount - (args.first || 10)) - accounts.length) > 0)
          return true
        else 
          return false
      }

      const response = {
        totalCount: accountsCount,
        edges: accountsConnectionEdge,
        pageInfo: {
          endCursor: accountsConnectionEdge[accountsConnectionEdge.length - 1].cursor,
          hasNextPage: hasNextPage
        }
      }

      return cacheResponse('accounts', key, args, response)
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
      if(!contextDocument){
        contextDocument = { name: context, reservedBalance: amount }
        acct.contexts.push(contextDocument)
      } else {
        contextDocument.reservedBalance += amount
      }
      
      acct.balance -= amount
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

const findInCache = async (key: string) => {
  return await cache.get(key)
}

const generateKey = (request: string, args: any) => {
  const NAMESPACE = "ee5e7a7c-d081-4e86-84aa-a9dfdb956c4c"
  return uuid(`${request}:${args}`, NAMESPACE);
}

const cacheResponse = (request: string, key: string, args: any, response: any) => {
  cache.set(key, response)
  return response
}

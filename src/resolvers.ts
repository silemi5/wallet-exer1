import dotenv from 'dotenv'
import Account from './models/account'
import { v5 as uuid } from 'uuid'
import { cache } from './cache'

dotenv.config()

const NAMESPACE = process.env.NAMESPACE || "ee5e7a7c-d081-4e86-84aa-a9dfdb956c4c"

export const resolvers = {
  Account: {
    reservedBalance: async (parent: any, { context }: { context: string }) => {
      return (await getContext(parent, context)).reservedBalance
    },
    virtualBalance: async (parent: any, { context }: { context: string }) => {
      return (await getContext(parent, context)).virtualBalance
    }
  },
  Query: {
    account: async (_: null, args: { id: string}, clientContext: { x_request_id: string | undefined }) => {
      const key = generateKey('account', args)

      // X-REQUEST-ID is given
      if(clientContext.x_request_id === key){
        // Find in cache
       const cachedResponse: any = await findInCache(key)
       if(cachedResponse){
         return cachedResponse
       }
      }

      // WARNING: Don't use `any`
      const accoundDocument: any = await Account.findById(args.id)

      if(!accoundDocument) throw new Error('Account not found!')

      const response = {
        id: accoundDocument._id,
        balance: accoundDocument.balance,
      }

      // caches the response then returns it to the client
      return cacheResponse(key, response)
    },
    accounts: async (_: any, args: { first: number | undefined; after: string | undefined }, clientContext: { x_request_id: string | undefined }) => {
      const key = generateKey('accounts', args)

      // X-REQUEST-ID is given
      if(clientContext.x_request_id === key){
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

       // caches the response then returns it to the client
      return cacheResponse(key, response)
    }
  },
  Mutation: {
    updateBalance: async (_: null, { account, delta }: { account: string, delta: number }) => {
      // WARNING: Avoid using `any` XD
      console.log("running!")
      const accountDocument: any = await Account.findById(account)

      if(!accountDocument) throw new Error('Account not found!')

      if((accountDocument.balance + delta ) < 0) throw new Error('Operation leads to negative balance!')

      // TODO: Operation on model, maybe on a function?
      accountDocument.balance += delta
      await accountDocument.save()
      
      return true;
    },
    createReservedBalance: async (_: null, { account, context, amount }: { account: string, context: string, amount: number }) => {
      // WARNING: Avoid using `any` XD
      const accountDocument: any = await Account.findById(account)

      if(amount < 0) throw new Error('Invalid amount to put reserved balance!')

      let contextDocument = await accountDocument.contexts.find((obj: any) => obj.name === context)
      if(!contextDocument){
        contextDocument = { name: context, reservedBalance: amount }
        accountDocument.contexts.push(contextDocument)
      } else {
        contextDocument.reservedBalance += amount
      }
      
      accountDocument.balance -= amount
      await accountDocument.save();

      return true;
    },
    updateReservedBalance: async (_: null, { account, context, delta }: { account: string; context: string, delta: number }) => {
      // WARNING: Avoid using `any` XD
      const accountDocument: any = await Account.findById(account)
      const contextDocument = await accountDocument.contexts.find((obj: any) => obj.name === context)

      if(!contextDocument) throw new Error(`Reserved balance for that context doesn't exist!`) 
      else {
        if((contextDocument.reservedBalance + delta) < 0) throw new Error('Invalid amount to put reserved balance!')
        else
          contextDocument.reservedBalance += delta
      }
      
      await accountDocument.save();

      return true;
    },
    releaseReservedBalance: async (_: null, { account, context }: { account: string; context: string }) => {
      // WARNING: Avoid using `any` XD
      const accountDocument: any = await Account.findById(account)
      const contextDocument = await accountDocument.contexts.find((obj: any) => obj.name === context)

      if(!contextDocument) throw new Error(`Reserved balance for that context doesn't exist!`) 
      else {
        accountDocument.balance += contextDocument.reservedBalance
        contextDocument.reservedBalance = 0
      }
      await accountDocument.save();

      return true;
    },
    updateVirtualBalance: async (_: null, { account, context, delta }: { account: string; context: string, delta: number }) => {
      // WARNING: Avoid using `any` XD
      const accountDocument: any = await Account.findById(account)
      const contextDocument = await accountDocument.contexts.find((obj: any) => obj.name === context)

      if(!contextDocument) throw new Error(`Virtual balance for that context doesn't exist!`) 
      else {
        if((contextDocument.virtualBalance + delta) < 0) throw new Error('Invalid amount to put virtual balance!')
        else
          contextDocument.virtualBalance += delta
      }
      
      await accountDocument.save();

      return true;
    },
    cancelVirtualBalance: async (_: null, { account, context }: { account: string; context: string }) => {
      // WARNING: Avoid using `any` XD
      const accountDocument: any = await Account.findById(account)
      const contextDocument = await accountDocument.contexts.find((obj: any) => obj.name === context)

      if(!contextDocument) throw new Error(`Virtual balance for that context doesn't exist!`) 
      else {
        contextDocument.virtualBalance = 0
      }
      await accountDocument.save();

      return true;
    },
    commitVirtualBalance: async (_: null, { account, context }: { account: string; context: string }) => {
      // WARNING: Avoid using `any` XD
      const accountDocument: any = await Account.findById(account)
      const contextDocument = await accountDocument.contexts.find((obj: any) => obj.name === context)

      if(!contextDocument) throw new Error(`Virtual balance for that context doesn't exist!`) 
      else {
        accountDocument.balance += contextDocument.virtualBalance
        contextDocument.virtualBalance = 0
      }
      await accountDocument.save();

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
  return uuid(`${request}:${args}`, NAMESPACE);
}

const cacheResponse = (key: string, response: any) => {
  cache.set(key, response)
  return response
}

import { ApolloServer } from 'apollo-server';
import mongoose from 'mongoose'
import { typeDefs } from './typeDefs'
import { resolvers } from './resolvers'
import dotenv from 'dotenv'

dotenv.config();

const uri: string = process.env.CONNECTION_URI || ""

mongoose.connect(uri)

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const auth = req.headers.authorization || '';
    return {
      auth
    }
  }
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  We have a nominal liftoff at ${url}`);
});


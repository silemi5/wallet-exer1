import { ApolloServer } from 'apollo-server';
import mongoose from 'mongoose'
import { typeDefs } from './typeDefs'
import { resolvers } from './resolvers'
import dotenv from 'dotenv'

dotenv.config();

const DB_URI: string = process.env.CONNECTION_DB_URI || ""

mongoose.connect(DB_URI)

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


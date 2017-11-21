fetch = require('node-fetch');
const ApolloClient = require('apollo-client-preset').ApolloClient;
const HttpLink = require('apollo-link-http').HttpLink;
const InMemoryCache = require('apollo-cache-inmemory').InMemoryCache;

client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:8080/graphql' }),
  cache: new InMemoryCache()
});
const attachToResource = require('./src/attachToResource')(client)
// require('./src/templates')({prototype: {apolloClient: client } })
// .then(console.log)
// .catch(console.error)

attachToResource(4)
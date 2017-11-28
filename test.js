fetch = require('node-fetch');
const ApolloClient = require('apollo-client-preset').ApolloClient;
const HttpLink = require('apollo-link-http').HttpLink;
const InMemoryCache = require('apollo-cache-inmemory').InMemoryCache;
const gql = require('graphql-tag')

client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:8080/graphql' }),
  cache: new InMemoryCache()
});
const attachToResource = require('./src/attachToResource')(client)
// require('./src/templates')({prototype: {apolloClient: client } })
// .then(console.log)
// .catch(console.error)

const tranistionAllTemplates = async function(Vue) {
  const apolloClient = Vue.prototype.$apolloClient;

  //TODO Turn this query into something that only returns unique resource names. So we do not have to filter them out in the following step
  resources = await apolloClient.query({
    query: gql`
      {
        allTemplates{
          nodes{
            resourceByResourceId {
              name
            }
          }
        }
      }`
  })
  resourcesWithTemplates = resources.data.allTemplates.nodes.map(e => e.resourceByResourceId.name).filter(onlyUnique)
  
  const done = await loadTemplates(0, resourcesWithTemplates, Vue)
  return true;
}

const loadTemplates = async (n, resources, Vue) => {
  const apolloClient = Vue.prototype.$apolloClient;
  const resource = {name: resources[n]}
  if (resource && resource.name) {
    try {
      resourceTemplates = await apolloClient.query({
        query: gql`
          {
            ${camelCase(resource.name)} {
              nodes {
                templates{
                  nodes {
                    id
                    name
                    html
                    css
                    js
                  }
                }
              }
            }
          }
        `
      }) 
      const templates = resourceTemplates.data[camelCase(resource.name)].nodes[0].templates
      templates.nodes.forEach(template => {
        if (template.name && template.html && template.js) {
          const style = insertScope(`${template.css || ''}`, `.template-${template.id}`)

          const stringTemplate = `<template>${template.html || ''}</template><style> ${style} </style><script>${template.js || ''}</script>`
          const func = camelCase(`update_${resource.name}_templates`)
          Vue.prototype.$apolloClient.mutate({
            mutation: gql`
              ${func}(input:{
                id: template.id,
                vue: "${stringTemplate}"
              })
            `
          }).catch(console.error)
        }
      })
    }
    catch(e) {
      // console.log(e)
    }

  }
  if (n >= resources.length) {
    return true;
  } else {
    n++
    return await loadTemplates(n, resources, Vue)
  }
}

function insertScope (style, scope) {
  const regex = /(^|\})\s*([^{]+)/g
  return style.trim().replace(regex, (m, g1, g2) => {
    return g1 ? `${g1} ${scope} ${g2}` : `${scope} ${g2}`
  })
}

function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}


tranistionAllTemplates({prototype: {$apolloClient: client}})
.catch(console.error)
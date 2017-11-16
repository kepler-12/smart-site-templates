const gql = require('graphql-tag')

module.exports = async function(Vue) {
  const apolloClient = Vue.prototype.$apolloClient;
  resources = await apolloClient.query({
    query: gql`
      {
        allResources{
          nodes {
            name
            id
          }
        }
      }
    `
  })
  console.log(resources)
  resources.data.allResources.nodes.forEach(async resource => {
    resourceTemplates = await apolloClient.query({
      query: gql`
        {
          ${resource.name} {
            nodes {
              templates{
                nodes {
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
    console.log(resourceTemplates)  
    const templates = resourceTemplates.data[resource.name].nodes[0].templates
    templates.forEach(template => {
      Vue.component(template.name, Vue.prototype.$stringToTemplate(`${template.html}${template.css}${template.js}`))
    })
  }) 
}
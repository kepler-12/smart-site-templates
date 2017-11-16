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
  const done = await loadTemplates(0, resources.data.allResources.nodes, Vue)
  return true;
}

const loadTemplates = async (n, resources, Vue) => {
  const apolloClient = Vue.prototype.$apolloClient;
  const resource = resources[n]
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
  const templates = resourceTemplates.data[resource.name].nodes[0].templates
  templates.nodes.forEach(template => {
    conosle.log(template);
    if (template.name && template.html) {
      Vue.component(template.name, Vue.prototype.$stringToTemplate(`${template.html}${template.css || ''}${template.js || ''}`))
    }
  })
  if (n >= resources.length) {
    return true;
  } else {
    n++
    return await loadTemplates(n, resources, Vue)
  }
}
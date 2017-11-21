const gql = require('graphql-tag')
const camelCase = require('camelcase')

module.exports = async function(Vue) {
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
        console.log(template);
        if (template.name && template.html && template.js) {
          const style = insertScope(`${template.css || ''}`, `.template-${template.id}`)
          const stringTemplate = `
          <template>
              ${template.html || ''}
          </template>
          <style > ${style} </style>
          <script>
            ${template.js || ''}
          </script>
          `
          Vue.component(template.name, Vue.prototype.$stringToTemplate(stringTemplate))
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
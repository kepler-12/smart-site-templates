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
  if (resource && resource.name) {
    resourceTemplates = await apolloClient.query({
      query: gql`
        {
          ${resource.name} {
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
    const templates = resourceTemplates.data[resource.name].nodes[0].templates
    templates.nodes.forEach(template => {
      console.log(template);
      if (template.name && template.html && template.js) {
        const style = insertScope(`${template.css || ''}`, `.template-${template.id}`)
        const stringTemplate = `
        <template>
          <style > ${style} </style>
          <div id="template-${template.id}" class="template-${template.id}" >
            ${template.html || ''}
          </div>
        </template>
        <script>
          ${template.js || ''}
        </script>
        `
        Vue.component(template.name, Vue.prototype.$stringToTemplate(stringTemplate))
      }
    })
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

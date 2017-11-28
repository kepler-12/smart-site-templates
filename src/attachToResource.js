const gql = require('graphql-tag')

module.exports = (client) => {
   return async (resourceId, additional_fields) => {
    const fields = additional_fields || {};
    fields.vue = "text";
    return await client.mutate({
      mutation: gql`
        mutation {
          attachFieldSetToResource(input:{
            resourceId: ${resourceId}
            fields: "${JSON.stringify(fields).replace(/"/g, '\\"')}"
            fieldSet: "templates"
          }) {
            clientMutationId
          }
        }
      `
    })
  }
} 

module.exports = async function(client) {
  const template_columns = {
    "default_fields": "json"
  }
  const result = await client.mutate({
    mutation: gql`
    mutation {
      createFieldSet(input:{
        name: "templatesads"
        fields: "${JSON.stringify(template_columns).replace(/"/g, '\\"')}"
      }) {
        clientMutationId
      }
    }`
  })
}
const elasticsearch = require('elasticsearch')

// Core ES variables for this project
const port = 9200
const host = process.env.ES_HOST || 'localhost'
const client = new elasticsearch.Client({host: {host, port}})


async function checkConnection() {
  let isConnected = false
  while (!isConnected) {
    console.log('Connecting to ES')
    try {
      const health = await client.cluster.health({})
      console.log(health)
      isConnected = true
    } catch (err) {
      console.log('Connection Failed, Retrying...', err)
    }
  }
}


/** Clear the index, recreate it, and add mappings */
async function resetIndex(index) {
  if (await client.indices.exists({index})) {
    await client.indices.delete({index})
  }
  await client.indices.create({index})
}

async function createSettings(index,settingsSchema) {
 
  return client.indices.putSettings({index,  body: settingsSchema})
}

async function closeIndex(index ) {
 return client.indices.close({index})
}

async function openIndex(index ) {
 return client.indices.open({index})
}

async function createMapping(index, type, schema) {
  return client.indices.putMapping({index, type, body: schema})
}

module.exports = {
  checkConnection, resetIndex, createMapping, client, createSettings, 
  closeIndex, openIndex
}
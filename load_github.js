const esConnection = require('./connect/esConnect');
const data = require('./github_data/data');
const schema = require('./github_data/schema_load');
const settingsSchema = require('./github_data/settingsSchema');
const index = 'github';
const type = 'entry';

async function mainLoad() {
  await esConnection.checkConnection()

  try {
    // Clear previous ES index
    await esConnection.resetIndex(index);
    await esConnection.closeIndex(index);
    await esConnection.createSettings(index, settingsSchema);
    await esConnection.openIndex(index);
    await esConnection.createMapping(index, type, schema);

    let dataLimit = data.length;
    let bulkLimit = 500;
    let bulkOps = [];

    for (let i = 0; i < dataLimit; i++) {
      // Describe action
      bulkOps.push({index: {_index: index, _type: type}})
      let l = data[i]["_source"];
      bulkOps.push(l);

      if (i > 0 && i % bulkLimit === 0) { // Do bulk insert after every bulkLimit
        await esConnection.client.bulk({body: bulkOps})
        bulkOps = []
        console.log(`bulkop ${i - (bulkLimit - 1)} - ${i}`)
      }
    }

    await esConnection.client.bulk({body: bulkOps})
    console.log(`final write ${dataLimit}`)

  } catch (err) {
    console.error(err)
  }
}
 
mainLoad();
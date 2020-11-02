const Nightmare = require('nightmare')
const nightmare = Nightmare({
  show: false
});
const fs = require('fs')
const ethers = require('ethers')
const provider = new ethers.providers.JsonRpcProvider('https://eth.framework.xyz')
const abi = [{ "inputs": [], "name": "aggregator", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }]
const getEventAddress = async (address) => {
  const contract = new ethers.Contract(address, abi, provider)
  const e = await contract.aggregator()
  return e
}
const Bluebird = require('bluebird')

nightmare
  // load a url
  .goto('https://docs.chain.link/docs/reference-contracts')
  // wait for table to load
  .wait('#content-container')
  .evaluate(() => {
    const arrayOfAggregators = []
    // get number of rows of table
    var rowCount = document.querySelector("#content-container > section.content-body.grid-75 > div.markdown-body > div:nth-child(6) > div > table > tbody").lastElementChild.rowIndex
    for (let i = 1; i <= rowCount; i++) {
      arrayOfAggregators.push({
        pair: document.querySelector(`#content-container > section.content-body.grid-75 > div.markdown-body > div:nth-child(6) > div > table > tbody > tr:nth-child(${i}) > td:nth-child(1)`).innerText,
        aggregatorAddress: document.querySelector(`#content-container > section.content-body.grid-75 > div.markdown-body > div:nth-child(6) > div > table > tbody > tr:nth-child(${i}) > td:nth-child(2) > a > code > span`).innerText
      })
    }
    // return the array of aggregator - pairs
    return arrayOfAggregators
  })
  // end the instance
  .end()
  // log to file
  .then(async (result) => {

    const chainlinkData = (await Bluebird.map(result, async (res)=> {
      res.eventAddress = await getEventAddress(res.aggregatorAddress)
      return res
    })).map((data)=>Object.entries(data).sort().reduce( (o,[k,v]) => (o[k]=v,o), {} ))

    fs.writeFileSync('chainlinkAggregators.json', JSON.stringify(chainlinkData, null, 2))
  })
  //catch errors if they happen
  .catch((error) => {
    console.error('an error has occurred: ' + error);
  });

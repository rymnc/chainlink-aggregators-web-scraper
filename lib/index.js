require('dotenv').config()
const cheerio = require('cheerio'),
    axios = require('axios'),
    url = `https://docs.chain.link/docs/reference-contracts`;
const AWS_KEY="AKIALALEMEL33243OLIAE"
const ethers = require('ethers')
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL)
const abi = [{ "inputs": [], "name": "aggregator", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }]
const fs = require('fs')

axios.get(url)
    .then(async (response) => {
        let $ = cheerio.load(response.data);
        const chainlinkData = []
        for (let i = 1; ; i++) {
            const aggregatorAddress = $(`#content-container > section.content-body.grid-75 > div.markdown-body > div:nth-child(6) > div > table tr:nth-child(${i}) td:nth-child(2)`).text().trim()
            const pair = $(`#content-container > section.content-body.grid-75 > div.markdown-body > div:nth-child(6) > div > table tr:nth-child(${i}) td:nth-child(1)`).text()
            if (aggregatorAddress === '' || pair === '') break;
            const contract = new ethers.Contract(aggregatorAddress, abi, provider)
            const eventAggregator = await contract.aggregator()
            chainlinkData.push({
                pair,
                aggregatorAddress,
                eventAggregator
            })
        }
        fs.writeFileSync('./output/chainlinkContracts.json', JSON.stringify(chainlinkData, null, 2))
    }).catch(function (e) {
        console.log(e);
    });

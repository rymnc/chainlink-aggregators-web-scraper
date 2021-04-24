require('dotenv').config()
const cheerio = require('cheerio'),
    axios = require('axios'),
    urls = [
	    `https://docs.chain.link/docs/ethereum-addresses`
	    `https://docs.chain.link/docs/binance-smart-chain-addresses`,
	    `https://docs.chain.link/docs/matic-addresses`,
	    `https://docs.chain.link/docs/xdai-price-feeds`,
	    `https://docs.chain.link/docs/huobi-eco-chain-price-feeds`,
    ];
const ethers = require('ethers')
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL)
const abi = [{ "inputs": [], "name": "aggregator", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }]
const fs = require('fs')

axios.get(urls[0])
    .then(async (response) => {
        let $ = cheerio.load(response.data);
        const chainlinkData = []
        for (let i = 1; ; i++) {
            const aggregatorAddress = $(`#content-container > section.content-body.grid-75 > div.markdown-body > div:nth-child(4) > div > table tr:nth-child(${i}) td:nth-child(3)`).text().trim()
            const pair = $(`#content-container > section.content-body.grid-75 > div.markdown-body > div:nth-child(4) > div > table tr:nth-child(${i}) td:nth-child(1)`).text()
	    const decimals = $(`#content-container > section.content-body.grid-75 > div.markdown-body > div:nth-child(4) > div > table tr:nth-child(${i}) td:nth-child(2)`).text().trim()
            if (aggregatorAddress === '' || pair === '') break;
            const contract = new ethers.Contract(aggregatorAddress, abi, provider)
            const eventAggregator = await contract.aggregator().catch(console.error)
            chainlinkData.push({
                pair,
                aggregatorAddress,
                eventAggregator,
		decimals,
            })
        }
        fs.writeFileSync('./output/chainlinkContracts.json', JSON.stringify(chainlinkData, null, 2))
    }).catch(function (e) {
        console.log(e);
    });

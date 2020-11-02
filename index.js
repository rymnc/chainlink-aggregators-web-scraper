var Nightmare = require('nightmare'),
  nightmare = Nightmare({
    show: false
  });

nightmare
  //load a url
  .goto('https://docs.chain.link/docs/reference-contracts')
  //simulate typing into an element identified by a CSS selector
  //here, Nightmare is typing into the search bar
  .wait('#content-container')
  //execute javascript on the page
  //here, the function is getting the HREF of the first search result
  .evaluate(function() {
    const arrayOfAggregators = []
    var rowCount = document.querySelector("#content-container > section.content-body.grid-75 > div.markdown-body > div:nth-child(6) > div > table > tbody").lastElementChild.rowIndex
    for(let i=1; i<=rowCount;i++){
      arrayOfAggregators.push({
        pair: document.querySelector(`#content-container > section.content-body.grid-75 > div.markdown-body > div:nth-child(6) > div > table > tbody > tr:nth-child(${i}) > td:nth-child(1)`).innerText,
        aggregatorAddress: document.querySelector(`#content-container > section.content-body.grid-75 > div.markdown-body > div:nth-child(6) > div > table > tbody > tr:nth-child(${i}) > td:nth-child(2) > a > code > span`)
        .innerText
      })
    }
    return arrayOfAggregators
  })
  //end the Nightmare instance along with the Electron instance it wraps
  .end()
  //run the queue of commands specified, followed by logging the HREF
  .then(function(result) {
    console.log(result);
  })
  //catch errors if they happen
  .catch(function(error){
    console.error('an error has occurred: ' + error);
  });
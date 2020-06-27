const axios = require('axios');

async function getLink(url) {
    const response = await axios.get(url);
    console.log(response);
}

getLink('http://www.pitchfork.com/').catch(error => {console.log(error)})
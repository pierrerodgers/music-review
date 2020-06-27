const axios = require('axios');
const cheerio = require('cheerio')

async function getHtml(url) {
    const { data } = await axios.get(url);
    return data;
}
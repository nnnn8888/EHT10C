require('dotenv').config();
const fetch = require('node-fetch');
const {TwitterApi} = require('twitter-api-v2');

const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const reseachtwitt = async ()=>{
    await client.v2.search('#crypto', { 
        'max_results': '40',
        'expansions': 'author_id'
     }).then((val) => {
    //console.log(val._realData.data[0])
    for (let element in val._realData.data) {         
        ajoutlike = val._realData.data[element].id;
        console.log(ajoutlike)
        client.v2.like(process.env.TWITTER_ID, ajoutlike).then((result) => {
            console.log(result)
            console.log("success")})
            .catch(err => {
            console.error(err)
        })
        }
})}

const getPriceAndTweet = () => {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10')
        .then(res => res.json())
        .then(json => {
            
            const today = new Date();
            
            let moins1 = today.setHours(today.getHours() - 1);
            
            let date = today.toUTCString();


            let letweet = "";

            for (let item in json) {         
            letweet = letweet + `$${json[item].symbol.toUpperCase()}: ${json[item].current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} | `;
            }

            finaltt = date + ' - TOP 10 - ' + letweet + ' #crypto #blockchain #token #coin';
            
            //tweet//
            client.v2.tweet(finaltt).then((val) => {
                console.log(val)
                console.log("success")})
                .catch(err => {
                console.error(err)
            })

            reseachtwitt()

        .catch(err => {
            console.error(err)
            })
    })
}

getPriceAndTweet();
setInterval(getPriceAndTweet, 3600000);

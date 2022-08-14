require('dotenv').config();
const fetch = require('node-fetch');
const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');

const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

let result
let finaltt

//sauvegarde le dernier fetch prix top 10 dans le fichier save.json
const savePrice = (save) => {
    let data = JSON.stringify(save)
    fs.writeFile('save.json', data, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
}

//ouvre le dernier save.json pour comparer avec le nouveau fetch de prix
const oldPrice = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('save.json', 'utf8', function readFileCallback(err, data) {
            if (err) {
                reject(console.log(err));
            } else {
                let obj = JSON.parse(data);
                //console.log(obj)
                resolve(obj)
            }

        })
    })
}



//compare les prix de l'ancien top 10 contenu dans save.json au nouveau qui vient d'etre fetch. Renvoi la différence l'implément dans une chaine de caractère et envoi le nouveau tweet
let diffPrice = (o, o2) => {
    const today = new Date();
    let date = today.toUTCString();
    let letweet = '';
    let saveNewPrice = [];

    console.log(o);
    //console.log(o2);
    //pour chaque element présent dans l'ancien top10 on le cherche dans le nouveau fecth et on fait la différence des prix
    for (let i = 0; i < o2.length; i++) {
        console.log(o2[i].symbol);
        let obj = o.find(({ indice }) => indice === o2[i].symbol);
        console.log(obj);
        if (obj && obj.indice != 'usdt' && obj.indice != 'usdc' && obj.indice != 'busd') {
            console.log(obj.indice);
            console.log(o2[i].current_price);
            let saveNP = new Object();
            saveNP.indice = o2[i].symbol;
            saveNP.prix = o2[i].current_price;
            saveNewPrice.push(saveNP);
            let calc = ((o2[i].current_price - obj.prix) / obj.prix) * 100
            result = Math.round((calc + Number.EPSILON) * 100) / 100
            let posNum = Math.sign(result);
            if (posNum == 1) {
                result = '+' + result;
            }
            console.log(result);
            letweet = letweet + `$${o2[i].symbol.toUpperCase()}: ${o2[i].current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} ${result}% | `;
        } else {
            console.log('pas de comparaison possible');
            let saveNP2 = new Object();
            saveNP2.indice = o2[i].symbol;
            console.log('symbole sans comparaison:' + saveNP2.indice);
            saveNP2.prix = o2[i].current_price;
            console.log('prix sans comparaison:' + saveNP2.prix);
            saveNewPrice.push(saveNP2);
            letweet = letweet + `$${o2[i].symbol.toUpperCase()}: ${o2[i].current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} | `;
        }
        //console.log(letweet);
    }
    console.log(saveNewPrice);
    savePrice(saveNewPrice);
    finaltt = '🚀💸 ' + date + ' - TOP 10 - ' + letweet + '#bitcoin';
    console.log(finaltt);

    // //tweet//
    client.v2.tweet(finaltt).then((val) => {
        //console.log(val)
        console.log("tweet tweeted")
    })
    .catch(err => {
            console.error(err)
        })

}


const getPriceAndTweet = (a) => {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10')
        .then(res => res.json())
        .then(json => {
            //console.log(json);
            diffPrice(a, json);


        })
}



let run = () => {
    oldPrice()
        .then((c) => {
            //console.log(c);
            getPriceAndTweet(c);
            
        })
        .catch((e) => console.error(e));
};
run();
setInterval(run, 3600000);
// setInterval(reseachtwitt, 43200000);

const express = require('express');
const cors = require('cors');
const path = require('path');
const finnhub = require('finnhub');
const axios = require('axios');
const {
  MongoClient,
  ServerApiVersion
} = require("mongodb");

const app = express();
const PORT = process.env.PORT || 8080;

const uri = "mongodb+srv://asokraj:teE1keaf7HxWkzaX@cluster0.ltidhfc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const db = "Web3"

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const polygon_apiKey = '6xsTW8rqr6AQMKhkoNuwA2U54Z7bDJLd';
const finnhub_apiKey = "cmr19q1r01ql2lmtdgi0cmr19q1r01ql2lmtdgig";
const finnhubBaseUrl = 'https://finnhub.io/api/v1/';
const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = "cmr19q1r01ql2lmtdgi0cmr19q1r01ql2lmtdgig";
const finnhubClient = new finnhub.DefaultApi();

app.use(cors());
app.use(express.static('stock-app/dist/stock-app'));
app.use(express.json());
app.set('trust proxy', true);

client.connect();

app.get('/lookup_symbol', (req, res) => {
  const query = req.query.q;
  finnhubClient.symbolSearch(query, (error, data, response) => {
    if (error) {
      console.error('Error:', error);
    } else {
      res.json(data);
    }
  });
})

app.get('/chart_data', (req, res) => {

  const query = req.query.symbol;
  const currentDate = new Date();
  const twoYearsAgo = new Date(currentDate);
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const currentDateFormatted = currentDate.toISOString().split('T')[0];
  const twoYearsAgoFormatted = twoYearsAgo.toISOString().split('T')[0];

  const url = `https://api.polygon.io/v2/aggs/ticker/${query}/range/1/day/${twoYearsAgoFormatted}/${currentDateFormatted}?adjusted=true&sort=asc&apiKey=${polygon_apiKey}`;

  axios.get(url)
    .then(response => {
      const ohlc = [];
      const volume = [];
      const time = [];
      const ticker = response.data.ticker;
      if (response.data.results) {
        for (const item of response.data.results) {
          ohlc.push([item.t, item.o, item.h, item.l, item.c]);
          volume.push([item.t, item.v]);
        }
      }
      res.json({
        ticker,
        ohlc,
        volume
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
})

app.get('/company_data', async (req, res) => {
  try {
    const query = req.query.symbol;

    const companyDataUrl = `stock/profile2?symbol=${query}`
    const quotesUrl = `quote?symbol=${query}`
    const peersUrl = `stock/peers?symbol=${query}`;
    console.log('here11');
    const [companyResponse, quotesResponse, peersResponse] = await Promise.all([
      axios.get(finnhubBaseUrl + companyDataUrl, {
        params: {
          token: finnhub_apiKey
        }
      }),
      axios.get(finnhubBaseUrl + quotesUrl, {
        params: {
          token: finnhub_apiKey
        }
      }),
      axios.get(finnhubBaseUrl + peersUrl, {
        params: {
          token: finnhub_apiKey
        }
      })
    ]);
    console.log('heree2');
    console.log(companyResponse);
    let companyProfileData = companyResponse.data;
    let quotesData = quotesResponse.data;
    let peersData = peersResponse.data;
    console.log(companyProfileData);
    let date = new Date(quotesData.t * 1000);
    quotesData.t = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;

    peersData = peersData.filter(peer => !peer.includes('.'));

    res.json({
      companyProfileData,
      quotesData,
      peersData
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal server error je'
    });
  }
})

app.get('/quote_data', async (req, res) => {
  try {
    const query = req.query.symbol;
    const quotesUrl = `quote?symbol=${query}`;

    const quotesResponse = await axios.get(finnhubBaseUrl + quotesUrl, {
      params: {
        token: finnhub_apiKey
      }
    });

    const quotesData = quotesResponse.data;
    res.json({
      quotesData
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

app.get('/company_news', async (req, res) => {
  try {
    const query = req.query.symbol;

    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const fromDate = oneWeekAgo.toISOString().split('T')[0];
    const toDate = currentDate.toISOString().split('T')[0];

    const companyNewsUrl = `company-news?symbol=${query}`;

    const response = await axios.get(finnhubBaseUrl + companyNewsUrl, {
      params: {
        from: fromDate,
        to: toDate,
        token: finnhub_apiKey
      }
    });

    const companyNews = response.data
      .filter((news) => news.image && news.headline)
      .slice(0, 20)
      .map((news) => {
        const timestamp = news.datetime;
        const date = new Date(timestamp * 1000);
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        return {
          ...news,
          formattedDate
        };
      });

    res.json(companyNews);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

app.get('/company_insights', async (req, res) => {
  try {
    const query = req.query.symbol;

    const sentimentsUrl = `stock/insider-sentiment?symbol=${query}&from=2022-01-01`
    const recommendationsUrl = `stock/recommendation?symbol=${query}`
    const earningsUrl = `stock/earnings?symbol=${query}`

    const [sentimentsResponse, recommendationsResponse, earningsResponse] = await Promise.all([
      axios.get(finnhubBaseUrl + sentimentsUrl, {
        params: {
          token: finnhub_apiKey
        }
      }),
      axios.get(finnhubBaseUrl + recommendationsUrl, {
        params: {
          token: finnhub_apiKey
        }
      }),
      axios.get(finnhubBaseUrl + earningsUrl, {
        params: {
          token: finnhub_apiKey
        }
      })
    ]);

    const sentimentsData = sentimentsResponse.data;
    const recommendationsData = recommendationsResponse.data;
    const earningsData = earningsResponse.data;

    let avg_mspr = 0,
      positive_mspr = 0,
      negative_mspr = 0,
      count = 0,
      positive_count = 0,
      negative_count = 0;
    let avg_change = 0,
      positive_change = 0,
      negative_change = 0;

    for (let i = 0; i < sentimentsData.data.length; i++) {
      const mspr = sentimentsData.data[i]['mspr'];
      const change = sentimentsData.data[i]['change'];
      if (mspr !== undefined && change !== undefined) {
        avg_mspr += mspr;
        avg_change += change;
        count++;
        if (mspr > 0) {
          positive_mspr += mspr;
          positive_change += change;
          positive_count++;
        } else if (mspr < 0) {
          negative_mspr += mspr;
          negative_change += change;
          negative_count++;
        }
      } else {
        console.log('No data found');
      }
    }

    if (count > 0) {
      avg_mspr /= count;
      positive_mspr /= positive_count;
      negative_mspr /= negative_count;
      avg_change /= count;
      positive_change /= positive_count;
      negative_change /= negative_count;
    }

    const insiderSentiments = {
      avg_mspr: +avg_mspr.toFixed(2),
      positive_mspr: +positive_mspr.toFixed(2),
      negative_mspr: +negative_mspr.toFixed(2),
      avg_change: +avg_change.toFixed(2),
      positive_change: +positive_change.toFixed(2),
      negative_change: +negative_change.toFixed(2),
    };

    res.json({
      insiderSentiments,
      sentimentsData,
      recommendationsData,
      earningsData
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
})

app.get('/hourly_chart_data', (req, res) => {
  let chartColor;
  const query = req.query.symbol;
  const currentDate = new Date();
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);

  const currentDateFormatted = currentDate.toISOString().split('T')[0];
  const yesterdayFormatted = yesterday.toISOString().split('T')[0];

  const url = `https://api.polygon.io/v2/aggs/ticker/${query}/range/1/hour/${yesterdayFormatted}/${currentDateFormatted}?adjusted=true&sort=asc&apiKey=${polygon_apiKey}`;

  axios.get(url)
    .then(response => {
      const stocks = [];
      const time = [];
      const ticker = response.data.ticker;
      if (response.data.results) {
        for (const item of response.data.results) {
          time.push(item.t);
          stocks.push(item.c);
        }
      }
      if (response.data.results) {
        const lastItem = response.data.results[response.data.results.length - 1];
        if (lastItem && lastItem.d > 0) {
          chartColor = 'green';
        } else {
          chartColor = 'red';
        }
      }

      res.json({
        ticker,
        time,
        stocks,
        chartColor
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
})

app.get('/insert_data', async (req, res) => {
  try {
    await client.connect();
    const {
      companyData,
      quoteData
    } = req.query;

    const parsedCompanyData = JSON.parse(companyData);
    const parsedQuoteData = JSON.parse(quoteData);

    const result = await client.db('Web3').collection("Watchlist").insertOne({
      'symbol': parsedCompanyData['ticker'],
      'name': parsedCompanyData['name'],
      'price': parsedQuoteData['c'],
      'change': parsedQuoteData['d'],
      'change_percent': parsedQuoteData['dp']
    });
    console.log(`New listing created with the following id: ${result.insertedId}`);
  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
  }
});

app.get("/insert_watchlist_data", async (req, res) => {
  try {
    await client.connect();
    const query = req.query.symbol;
    const name = req.query.name;

    const existingItem = await client.db('Web3').collection("Watchlist").findOne({
      symbol: query
    });

    if (existingItem) {
      res.json({
        success: false,
        message: `${symbol} already exists in the watchlist`,
      });
    } else {
      const result = await client.db('Web3').collection("Watchlist").insertOne({
        symbol: query,
        name: name

      });
      res.json({
        success: true,
        message: `${symbol} added to Watchlist`
      });
    }


    console.log(`New listing created with the following id: ${result.insertedId}`);

  } catch (error) {
    console.error("Error inserting data into MongoDB:", error);
  }
});

app.get('/remove_data', async (req, res) => {
  try {
    await client.connect();
    const symbol = req.query.symbol;
    const result = await client.db('Web3').collection("Watchlist").deleteOne({
      'symbol': symbol
    });
    res.json(result);
  } catch (error) {
    console.error('Error deleting data from MongoDB:', error);
  }
});

app.get('/select_data', async (req, res) => {
  try {
    await client.connect();
    const data = await client.db(db).collection("Watchlist").find().toArray();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
  }
});

app.get('/get_wallet_money', async (req, res) => {
  try {
    await client.connect();
    const data = await client.db(db).collection("Portfolio").findOne({
      flag: true
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
  } finally {

  }
});

app.get('/insert_stock_data', async (req, res) => {
  try {
    await client.connect();
    const {
      ticker,
      name,
      price,
      quantity,
      total,
      buyOrSell
    } = req.query;

    let newQuantity, newTotal, newQ, newT, deleted = false;

    const stockPresent = await client.db('Web3').collection("Portfolio").findOne({
      symbol: ticker
    });

    if (stockPresent) {
      newQ = parseFloat(stockPresent.quantity);
      newT = parseFloat(stockPresent.buy_total);
    } else {
      newQ = 0;
      newT = 0;
    }

    if (buyOrSell == 'buy') {
      newQuantity = newQ + parseFloat(quantity);
      newTotal = newT + parseFloat(total);
      const updateResult = await client.db('Web3').collection("Portfolio").updateOne({
        'flag': true
      }, {
        $inc: {
          'wallet': -parseFloat(total)
        }
      });
    } else {
      newQuantity = newQ - parseFloat(quantity);
      newTotal = newT - parseFloat(total);
      const updateResult = await client.db('Web3').collection("Portfolio").updateOne({
        'flag': true
      }, {
        $inc: {
          'wallet': parseFloat(total)
        }
      });
    }

    if (stockPresent) {
      const result = await client.db('Web3').collection("Portfolio").updateOne({
        'symbol': ticker
      }, {
        $set: {
          'name': name,
          'quantity': newQuantity.toString(),
          'buy_total': newTotal.toFixed(2),
          'buy_price': price
        }
      });
      console.log("Updated");
    } else {
      const result = await client.db('Web3').collection("Portfolio").insertOne({
        'name': name,
        'symbol': ticker,
        'buy_price': price,
        'quantity': quantity.toString(),
        'buy_total': total,
      });
      console.log("Created");
    }

    if (newQuantity == 0) {
      const result = await client.db('Web3').collection("Portfolio").deleteOne({
        'symbol': ticker
      });
      deleted = true;
      console.log('deleted');
    }

    res.json({
      success: true,
      delete: deleted
    });

  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
  }
});

app.get('/select_stock_data', async (req, res) => {
  try {
    await client.connect();
    const data = await client.db('Web3').collection("Portfolio").find({
      flag: {
        $ne: true
      }
    }).toArray();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
  }
});

app.get('/select_ticker_stock_data', async (req, res) => {
  try {
    await client.connect();
    const symbol = req.query.symbol;

    const data = await client.db('Web3').collection("Portfolio").findOne({
      symbol: symbol,
      flag: {
        $ne: true
      }
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

app.get('*', (req, res) => {
  res.send('');
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
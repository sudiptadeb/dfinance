/**
 * Created by sudi-3385 on 21/01/18.
 */
window.dfinance = {
    jsonToQueryString: function (json) {
        return '?' +
            Object.keys(json).map(function (key) {
                return encodeURIComponent(key) + '=' +
                    encodeURIComponent(json[key]);
            }).join('&');
    }
};
angular.module('serviceAlphaVantage', [])
    .factory('serviceAlphaVantageApi', ['$http', function ($http) {
        /*
        *   Actual api call is made here
        *   If any testing is needed its needed here to check if the api endpoint is running or not
        *
        *   Also please change the apikey in case you plan to use it for anything other than simple demo
        *   the api suggest 1req/sec limit but that's not a hard limit
        *
        * */
        return function (func, symbol, interval, market) {
            return $http({
                method: "GET",
                url: 'https://www.alphavantage.co/query' + dfinance.jsonToQueryString({
                    'apikey': 'PITAKY5GRBS9H4ZC',
                    'function': func,
                    'symbol': symbol,
                    'interval': interval,
                    'market': market,
                    'datatype': 'json'
                })
            })
        }
    }])
    .factory('alphaToD3', function () {
        /*
        *   The selected api responses are not uniform and key names change according to the
        *   params given. This function help in standardising the api response and prepping it
        *   be used in d3charts directly
        *
        * */
        return function (data) {
            var mapping = {
                "Monthly Prices (open, high, low, close) and Volumes": "Monthly Time Series",
                "Weekly Prices (open, high, low, close) and Volumes": "Weekly Time Series",
                "Daily Prices (open, high, low, close) and Volumes": "Time Series (Daily)",
                "Intraday (1min) prices and volumes": "Time Series (1min)",
                "Intraday (5min) prices and volumes": "Time Series (5min)",
                "Intraday (15min) prices and volumes": "Time Series (15min)",
                "Intraday (30min) prices and volumes": "Time Series (30min)",
                "Intraday (60min) prices and volumes": "Time Series (60min)",
                "Daily Prices and Volumes for Digital Currency":"Time Series (Digital Currency Daily)",
                "Weekly Prices and Volumes for Digital Currency":"Time Series (Digital Currency Weekly)",
                "Monthly Prices and Volumes for Digital Currency":"Time Series (Digital Currency Monthly)",
                "Intraday Prices and Volumes for Digital Currency":"Time Series (Digital Currency Intraday)"
            };

            var funcDesc = data['Meta Data']['1. Information'];
            var timeSeries = data[mapping[funcDesc]];

            var result = [];
            for (var key in timeSeries) {
                if (timeSeries.hasOwnProperty(key)) {
                    var entry = timeSeries[key];
                    if(funcDesc=='Intraday Prices and Volumes for Digital Currency'){
                        result.push({
                            date: Math.ceil((new Date(key)).getTime()),
                            open: parseFloat(entry['1a. price (USD)']),
                            high: parseFloat(entry['1a. price (USD)']),
                            low: parseFloat(entry['1a. price (USD)']),
                            close: parseFloat(entry['1a. price (USD)']),
                            volume: parseFloat(entry['2. volume'])
                        })
                    }else if(funcDesc.indexOf('Digital Currency')==-1){
                        result.push({
                            date: Math.ceil((new Date(key)).getTime()),
                            open: parseFloat(entry['1. open']),
                            high: parseFloat(entry['2. high']),
                            low: parseFloat(entry['3. low']),
                            close: parseFloat(entry['4. close']),
                            volume: parseFloat(entry['5. volume'])
                        })
                    }else{
                        result.push({
                            date: Math.ceil((new Date(key)).getTime()),
                            open: parseFloat(entry['1a. open (USD)']),
                            high: parseFloat(entry['2a. high (USD)']),
                            low: parseFloat(entry['3a. low (USD)']),
                            close: parseFloat(entry['4a. close (USD)']),
                            volume: parseFloat(entry['5. volume (USD)'])
                        })
                    }

                }
            }

            result.reverse();
            return [{values: result, key: data['Meta Data']['2. Symbol'], area: true}];
        }
    });

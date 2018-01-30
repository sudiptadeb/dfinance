/**
 * Created by sudi-3385 on 27/10/17.
 */

angular.module('dfinance.pages.stocks', ['serviceAlphaVantage', 'dfinance.commonComponents'])
    .controller('stocksController', [
        '$http', '$q', '$scope', '$timeout',
        'serviceAlphaVantageApi',
        'alphaToD3',
        function ($http, $q, $scope, $timeout, serviceAlphaVantageApi, alphaToD3) {

            var self = this;

            // Get the list of stocks from localStorage
            try {
                self.stocks = JSON.parse(window.localStorage.getItem('dfinanceCacheStocks'));
            } catch (e) {
                console.debug('LocalStorage Not Available')
            }

            var stockData = [[], []];

            // Updating the crypto list from the json
            $http.get('assets/src/data/digital_currency_list.json')
                .then(function (response) {
                    var data = response.data;

                    // Process the list for our search component
                    for (var i = 0; i < data.length; i++) {
                        data[i].value = data[i]['currency code'];
                        data[i]['Company Name'] = data[i]['currency name'];
                        data[i]['Symbol'] = data[i]['currency code'];
                        data[i].type = 'crypto';
                        stockData[1].push(data[i]);
                    }
                    // Updating the stocks list from the datahub endpoint in the background
                    $http.get('https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed-symbols_json/data/5c10087ff8d283899b99f1c126361fa7/nasdaq-listed-symbols_json.json')
                        .then(function (response) {
                            var data = response.data;

                            // Process the list for our search component
                            for (var i = 0; i < data.length; i++) {
                                data[i].value = data[i]['Symbol'];
                                data[i].type = 'NASDAQ';
                                stockData[0].push(data[i]);
                            }

                            stockData = (stockData[0].concat(stockData[1])).sort(function (a, b) {
                                return (a['Symbol'].localeCompare(b['Symbol']));
                            });
                            try {
                                window.localStorage.setItem('dfinanceCacheStocks', JSON.stringify(stockData));
                            } catch (e) {
                                console.debug('LocalStorage Not Available')
                            }
                            self.stocks = stockData;
                        });
                });


            // stock search function
            self.stockSearch = function (query) {
                return query ? self.stocks.filter(createFilterFor(query)) : self.stocks;
            };
            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);
                return function filterFn(item) {
                    return (item['Company Name'].toLowerCase().indexOf(lowercaseQuery) === 0
                    || item['Symbol'].toLowerCase().indexOf(lowercaseQuery) === 0);
                };

            }


            // API call to fetch stock details

            self.selectedStock = {
                symbol: 'ATHN',
                type: 'NASDAQ',
                frequency: 'DAILY',
                interval: '1min',
                market: 'USD',
                func: 'TIME_SERIES_MONTHLY'
            };

            // Change the time frequency of the stock data
            self.changeFrequency = function (frequency) {
                self.selectedStock.frequency = frequency;
                self.selectedStock.func = (self.selectedStock.type == 'NASDAQ' ? 'TIME_SERIES_' : 'DIGITAL_CURRENCY_') + self.selectedStock.frequency;
                self.getStock();
            };

            // change the chart type between lineArea and CandleStick
            self.changeChartType = function (type) {
                self.stockChartOptions.chart.type = type;
                self.getStock();
            };

            // callback whenever a stock symbol is changed via search
            self.selectedSymbolChange = function () {
                self.selectedStock.symbol = self.selectedItem ? self.selectedItem['Symbol'] : self.searchText;
                self.selectedStock.type = self.selectedItem ? self.selectedItem['type'] : 'NASDAQ';
                self.selectedStock.func = (self.selectedStock.type == 'NASDAQ' ? 'TIME_SERIES_' : 'DIGITAL_CURRENCY_') + self.selectedStock.frequency;
                self.getStock();
            };

            // Calculate the stock change percentage for the current time period
            self.getStockChangePercent = function () {
                var change = 0;
                if (self.stockChartData && self.stockChartData.length > 0) {
                    change = self.stockChartData[0].values[self.stockChartData[0].values.length - 1]['close'] - self.stockChartData[0].values[self.stockChartData[0].values.length - 2]['close'];
                }
                return Math.round(((change / self.stockChartData[0].values[0]['close']) * 100)*100)/100;
            };

            // Get the stock details from the api service provided
            // Check src/moodules/sevices/alphaVantageApi.js for details
            self.getStock = function () {
                self.stockChartData = [];
                serviceAlphaVantageApi(self.selectedStock.func, self.selectedStock.symbol, self.selectedStock.interval, self.selectedStock.market)
                    .then(function success(response) {
                        if (response.data['Error Message'] == undefined) {
                            self.stockdetail = response.data['Meta Data'];
                            self.stockChartData = alphaToD3(response.data);
                            $timeout(function () {
                                self.stockChartApi.refresh()
                            }, 100);
                            self.stockChartOptions.chart.noData = 'Fetching Data ...'
                        } else {
                            self.stockChartOptions.chart.noData = 'Data not available !'
                        }
                    }, function error(response) {
                        self.error = response;
                    });
            };


            // Setting up the d3 chart
            self.dateformat = {
                'TIME_SERIES_MONTHLY': ['%e %b %Y', '%d/%m/%Y'],
                'TIME_SERIES_WEEKLY': ['%e %b %Y', '%d/%m/%Y'],
                'TIME_SERIES_DAILY': ['%b %e %I:%M %p', '%d/%m/%Y'],
                'TIME_SERIES_INTRADAY': ['%I:%M %p', '%H:%M'],
                'DIGITAL_CURRENCY_MONTHLY': ['%e %b %Y', '%d/%m/%Y'],
                'DIGITAL_CURRENCY_WEEKLY': ['%e %b %Y', '%d/%m/%Y'],
                'DIGITAL_CURRENCY_DAILY': ['%b %e %I:%M %p', '%d/%m/%Y'],
                'DIGITAL_CURRENCY_INTRADAY': ['%I:%M %p', '%H:%M']
            };
            self.stockChartOptions = {
                chart: {
                    type: 'candlestickBarChart',
                    noData: 'Loading Data ...',
                    useInteractiveGuideline: true,
                    height: 500,
                    margin: {
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 60
                    },
                    x: function (d) {
                        return parseInt(d['date']);
                    },
                    y: function (d) {
                        return d['close'];
                    },
                    duration: 500,
                    xAxis: {
                        axisLabel: 'Dates',
                        tickFormat: function (d) {
                            if (this === window) {
                                return d3.time.format(self.dateformat[self.selectedStock.func][0])(new Date(d));
                            } else {
                                return d3.time.format(self.dateformat[self.selectedStock.func][1])(new Date(d));
                            }
                        },
                        showMaxMin: false
                    },

                    yAxis: {
                        axisLabel: 'Stock Price',
                        tickFormat: function (d) {
                            return '$ ' + d3.format(',.2f')(d);
                        },
                        showMaxMin: true
                    },
                    zoom: {
                        enabled: false,
                        scaleExtent: [1, 10],
                        useFixedDomain: false,
                        useNiceScale: true,
                        horizontalOff: false,
                        verticalOff: true,
                        unzoomEventType: 'dblclick.zoom'
                    }
                }
            };

            // Setting up the default stock
            self.searchText = 'ATHN';
            self.selectedSymbolChange();

        }])
    .filter('timeToDateFormat', function () {
        return function (input) {
            var date = new Date(input);
            if (!isNaN(date)) {
                return (date).toString();
            }
            else return '';
        };
    })
    .filter('getCompany', function () {
        return function (input, stocks) {
            input = input || '';
            for (var i = 0; i < stocks.length; i++) {
                if (stocks[i].value == input) {
                    return stocks[i]['Company Name']
                }
            }
            return '';
        };
    });

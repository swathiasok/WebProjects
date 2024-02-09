let previousInput = "";

function getData(tab) {
    let stock_symbol = document.getElementById('smbl').value;

    if (stock_symbol) {
        var xml_req = new XMLHttpRequest;

        xml_req.open('POST', `/${tab}_data`, true);
        xml_req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');

        xml_req.send(stock_symbol);

        xml_req.onreadystatechange = () => {
            if (xml_req.status == 200) {
                var response = xml_req.responseText;
                if (response != "None") {
                    var res = response && JSON.parse(response);
                    if (res && typeof res.name != null) {
                        document.getElementById("empty-div").style.display = "none";
                        document.getElementById("display").style.display = "block";
                        document.getElementById("empty-symbol").style.display = "none";
                        switch (tab) {
                            case "company":
                                showCompany(res);
                                break;
                            case "stock":
                                showStock(res);
                                break;
                            case "charts":
                                showChart(res);
                                break;
                            case "news":
                                showNews(res);
                                break;
                        }
                    }
                } else {
                    document.getElementById("display").style.display = "none";
                    document.getElementById("empty-div").style.display = "flex";
                }
            }
        }

    } else {
        console.log('no input');
        document.getElementById("display").style.display = "none";
        document.getElementById("empty-symbol").style.display = "flex";
    }

    return false;
}

function submitData(event) {
    event.preventDefault();
    let currentInput = document.getElementById('smbl').value;

    console.log(previousInput);
    console.log(currentInput);

    if (previousInput.length == 0) {
        getData('company');
    } else if (currentInput != previousInput) {
        getData('company');
    }

    previousInput = currentInput;

}

function clearForm() {
    document.getElementById("smbl").value = "";
    document.getElementById("display").style.display = "none";
    document.getElementById("empty-div").style.display = "none";
}

function hideTabs(currentTab) {
    tabs = ["company", "stock", "chart", "news"]
    tabs.forEach(element => {
        if (element != currentTab) {
            document.getElementById(element).style.display = "none";
            document.getElementById(`${element}_link`).classList.remove("active");
        }
    });

    document.getElementById(currentTab).style.display = "block";
    document.getElementById(`${currentTab}_link`).classList.add("active");
    document.getElementById("empty-symbol").style.display = "none";
}

function showCompany(response) {
    event.preventDefault();
    hideTabs("company");
    document.getElementById("company_logo").src = response.logo;
    document.getElementById("company_name").textContent = response.name;
    document.getElementById("company_symbol").textContent = response.symbol;
    document.getElementById("company_code").textContent = response.exchange_code;
    document.getElementById("company_start_date").textContent = response.start_date;
    document.getElementById("company_category").textContent = response.category;
}

function showStock(response) {
    event.preventDefault();
    hideTabs("stock");

    document.getElementById("stock_symbol").textContent = response.symbol;
    document.getElementById("trading_day").textContent = response.trading_day;
    document.getElementById("closing_price").textContent = response.closing_price;
    document.getElementById("opening_price").textContent = response.opening_price;
    document.getElementById("high_price").textContent = response.high_price;
    document.getElementById("low_price").textContent = response.low_price;

    if (response.change > 0) {
        document.getElementById("change").innerHTML = `${response.change}<img id="change_percent_img" style="vertical-align: middle;" src="/static/img/GreenArrowUp.png">`;
        document.getElementById("change_percent").innerHTML = `${response.change_percent}<img id="change_percent_img" style="vertical-align: middle;" src="/static/img/GreenArrowUp.png">`;

    } else {
        document.getElementById("change").innerHTML = `${response.change}<img id="change_percent_img" style="vertical-align: middle;" src="/static/img/RedArrowDown.png">`;
        document.getElementById("change_percent").innerHTML = `${response.change_percent}<img id="change_percent_img" style="vertical-align: middle;" src="/static/img/RedArrowDown.png">`;
    }

    document.getElementById("strong_sell").textContent = response.strong_sell;
    document.getElementById("strong_buy").textContent = response.strong_buy;
    document.getElementById("buy").textContent = response.buy;
    document.getElementById("hold").textContent = response.hold;
    document.getElementById("sell").textContent = response.sell;

}

function buildChart(data) {

    volume_data = data.volume_array
    price_data = data.price_array

    const stock_price = [];
    const volume = [];
    const dataLength = volume_data.length;
    let stock_symbol = document.getElementById('smbl').value;

    let currentDate = new Date().toJSON().slice(0, 10);

    for (let i = 0; i < dataLength; i += 1) {

        volume.push([
            volume_data[i][0],
            volume_data[i][1]
        ]);

        stock_price.push([
            price_data[i][0],
            price_data[i][1]
        ]);
    }

    Highcharts.stockChart('chart-container', {

        chart: {
            events: {
                load: function () {
                    let inputGroup = document.querySelector('.highcharts-input-group');
                    inputGroup.remove();
                }
            }
        },

        rangeSelector: {
            selected: 4,
            buttons: [{
                type: 'day',
                count: 7,
                text: '7d',
            }, {
                type: 'day',
                count: 15,
                text: '15d'
            }, {
                type: 'month',
                count: 1,
                text: '1m'
            }, {
                type: 'month',
                count: 3,
                text: '3m'
            }, {
                type: 'month',
                count: 6,
                text: '6m'
            }]
        },

        title: {
            text: `Stock Price ${stock_symbol} ${currentDate}`
        },

        subtitle: {
            useHTML: true,
            text: '<a target="_blank" rel="noopener noreferrer" href = "https://polygon.io"> Source: Polygon.io </a>',

        },

        yAxis: [{
                title: {
                    text: 'Stock Price'
                },
                tickAmount: 6,
                opposite: false,
            },
            {
                title: {
                    text: 'Volume'
                },
                tickAmount: 6,
            }
        ],

        tooltip: {
            split: true
        },

        series: [{
            name: 'AAPL Stock Price',
            data: stock_price,
            type: 'area',
            threshold: null,
            tooltip: {
                valueDecimals: 2
            },
            fillColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [
                    [0, Highcharts.getOptions().colors[0]],
                    [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                ]
            }
        }, {
            type: 'column',
            name: 'Volume',
            data: volume,
            yAxis: 1,
            pointWidth: 5,
            grouping: false,
            color: '#000104'
        }]
    });
}


function showChart(response) {
    event.preventDefault();
    hideTabs("chart");

    buildChart(response);
}

function newsRow(response) {
    return `
    <div class="news-row">
        <img src="${response.image}" class="news-image">
        <div class="news-content">
            <p class="news-title">${response.headline}</p>
            <p class="news-description">${response.datetime}</p>
            <a target="_blank" rel="noopener noreferrer" href="${response.url}" class="news-link">See Original Post</a>
        </div>
    </div>
    `;
}

function showNews(response) {
    event.preventDefault();
    hideTabs("news");
    document.getElementById("news").innerHTML = "";
    if (response.length < 5) {
        for (i = 0; i < response.length; i++) {
            document.getElementById("news").innerHTML += newsRow(response[i]);
        }
    } else {
        for (i = 0; i < 5; i++) {
            document.getElementById("news").innerHTML += newsRow(response[i]);
        }
    }
}

function submitForm() {

    if (document.getElementById('smbl').checkValidity()) {
        getData('company');
    } else {
        console.log('here2');
        form.reportValidity();
        return false;
    }
}
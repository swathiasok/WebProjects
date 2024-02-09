from flask import Flask, request, render_template, jsonify
from datetime import *
from dateutil.relativedelta import *
import finnhub
import requests

app = Flask(__name__)
app.debug = True
finnhub_client = finnhub.Client(
    api_key="cmr19q1r01ql2lmtdgi0cmr19q1r01ql2lmtdgig")


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/company_data', methods=['GET', 'POST'])
def company():
    stock_symbol = request.get_data(as_text=True) or request.args.get('symbol')
    response = finnhub_client.company_profile2(symbol=stock_symbol)
    if response:
        value = {
            "logo": response.get('logo'),
            "name": response.get('name'),
            "symbol": stock_symbol.upper(),
            "exchange_code": response.get('exchange'),
            "start_date": response.get('ipo'),
            "category": response.get('finnhubIndustry')
        }
    else:
        value = 'None'

    return value


@app.route('/stock_data', methods=['GET', 'POST'])
def stocks():
    stock_symbol = request.get_data(as_text=True) or request.args.get('symbol')
    response = finnhub_client.quote(symbol=stock_symbol)
    response_2 = finnhub_client.recommendation_trends(symbol=stock_symbol)

    value = {
        "symbol": stock_symbol.upper(),
        "trading_day": datetime.utcfromtimestamp(response.get('t')).strftime('%d %B, %Y'),
        "closing_price": response.get('pc'),
        "opening_price": response.get('o'),
        "high_price": response.get('h'),
        "low_price": response.get('l'),
        "change": response.get('d'),
        "change_percent": response.get('dp'),
        "strong_sell": response_2[0].get("strongSell"),
        "strong_buy": response_2[0].get("strongBuy"),
        "buy": response_2[0].get("buy"),
        "sell": response_2[0].get("sell"),
        "hold": response_2[0].get("hold")
    }

    return value


@app.route('/charts_data', methods=['GET', 'POST'])
def charts():
    stock_symbol = request.get_data(as_text=True) or request.args.get('symbol')
    today = date.today()
    from_date = today+relativedelta(months=-6, days=-1)
    url = "https://api.polygon.io/v2/aggs/ticker/" + stock_symbol.upper() + \
        "/range/1/day/" + str(from_date) + "/" + str(today) + \
        "?adjusted=true&sort=asc&apiKey=6xsTW8rqr6AQMKhkoNuwA2U54Z7bDJLd"

    price_array = []
    volume_array = []

    responses = requests.get(url)

    for response in responses.json().get("results"):
        price_array.append([response.get("t"), response.get("c")])
        volume_array.append([response.get("t"), response.get("v")])

    return jsonify({'price_array': price_array, 'volume_array': volume_array})


@app.route('/news_data', methods=['GET', 'POST'])
def news():
    stock_symbol = request.get_data(as_text=True) or request.args.get('symbol')
    today = date.today()
    last_month = today+relativedelta(months=-1)
    responses = finnhub_client.company_news(
        symbol=stock_symbol, _from=last_month, to=today)

    print(responses[0])
    values = []

    for response in responses:
        if response.get('headline') and response.get('datetime') and response.get('url') and response.get('image'):
            response['datetime'] = datetime.utcfromtimestamp(
                response.get('datetime')).strftime('%d %B, %Y')
            values.append(response)

    return values


if __name__ == "__main__":
    app.run()

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import pandas_ta as ta
import json

app = Flask(__name__)
CORS(app)

def load_stock_data_from_json():
    with open('StockDataDemoJJ.json', 'r') as file:
        stock_data = json.load(file)
    return stock_data

stock_data = load_stock_data_from_json()
df = pd.DataFrame(stock_data)

required_columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Ticker']
if not all(column in df.columns for column in required_columns):
    raise ValueError(f"JSON data must contain the following columns: {required_columns}")

df.rename(columns={'Close': 'close', 'Open': 'open', 'High': 'high', 'Low': 'low', 'Date': 'date'}, inplace=True)

df['sma'] = ta.sma(df['close'], length=14) 
df['ema'] = ta.ema(df['close'], length=14) 
df['rsi'] = ta.rsi(df['close'], length=14) 
df['macd'] = ta.macd(df['close'], fast=12, slow=26, signal=9)['MACD_12_26_9']
df['macd_signal'] = ta.macd(df['close'], fast=12, slow=26, signal=9)['MACDs_12_26_9']
df['bollinger_upper'] = ta.bbands(df['close'], length=20)['BBU_20_2.0']
df['bollinger_lower'] = ta.bbands(df['close'], length=20)['BBL_20_2.0']

@app.route('/get_chart_data', methods=['GET'])
def get_chart_data():
    stock = request.args.get('stock')

    df_filtered = df[df['Ticker'] == stock]

    if not df_filtered.empty:
        df_cleaned = df_filtered.dropna(subset=['sma', 'ema', 'rsi', 'macd', 'macd_signal', 'bollinger_upper', 'bollinger_lower'])
        chart_data = df_cleaned.to_dict(orient='records')
        return jsonify(chart_data)
    else:
        return jsonify([])

if __name__ == "__main__":
    app.run(debug=True)
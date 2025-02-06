import styles from './StocksDash.module.css';
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

export const StockDash = ({ selectedStock }) => {
    const [chartData, setChartData] = useState([]);
    const [selectedGraph, setSelectedGraph] = useState('candlestick');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/get_chart_data?stock=${selectedStock}`);
                const data = await response.json();
                console.log("Fetched data:", data);
                const formattedData = data.map((item) => ({...item,date: item.date.split('-').reverse().join('-'),}));
                setChartData(formattedData);
            } catch (error) {
                console.error('Error fetching chart data:', error);
            }
        };

        fetchData();
    }, [selectedStock]);

    useEffect(() => {
        console.log("Chart data state:", chartData);
    }, [chartData]);

    const handleGraphChange = (event) => {
        setSelectedGraph(event.target.value);
    };

    const plotData = [];
    switch (selectedGraph) {
        case 'candlestick':
            plotData.push({
                x: chartData.map((item) => item.date),
                open: chartData.map((item) => item.open),
                high: chartData.map((item) => item.high),
                low: chartData.map((item) => item.low),
                close: chartData.map((item) => item.close),
                type: 'candlestick',
                xaxis: 'x',
                yaxis: 'y',
                increasing: { line: { color: 'green' } },
                decreasing: { line: { color: 'red' } },
                name: 'CandleStick',
            });
            break;
        case 'sma':
            plotData.push({
                x: chartData.map((item) => item.date),
                y: chartData.map((item) => item.sma),
                type: 'scatter',
                mode: 'lines',
                line: { color: 'blue', width: 2 },
                name: 'SMA (14)',
            });
            break;
        case 'ema':
            plotData.push({
                x: chartData.map((item) => item.date),
                y: chartData.map((item) => item.ema),
                type: 'scatter',
                mode: 'lines',
                line: { color: 'orange', width: 2 },
                name: 'EMA (14)',
            });
            break;
        case 'rsi':
            plotData.push({
                x: chartData.map((item) => item.date),
                y: chartData.map((item) => item.rsi),
                type: 'scatter',
                mode: 'lines',
                line: { color: 'purple', width: 2 },
                name: 'RSI (14)',
                yaxis: 'y2',
            });
            break;
        case 'macd':
            plotData.push({
                x: chartData.map((item) => item.date),
                y: chartData.map((item) => item.macd),
                type: 'scatter',
                mode: 'lines',
                line: { color: 'cyan', width: 2 },
                name: 'MACD Line',
            });
            plotData.push({
                x: chartData.map((item) => item.date),
                y: chartData.map((item) => item.macd_signal),
                type: 'scatter',
                mode: 'lines',
                line: { color: 'magenta', width: 2 },
                name: 'MACD Signal',
            });
            break;
        case 'bollinger':
            plotData.push({
                x: chartData.map((item) => item.date),
                y: chartData.map((item) => item.bollinger_upper),
                type: 'scatter',
                mode: 'lines',
                line: { color: 'brown', width: 2 },
                name: 'Bollinger Upper',
            });
            plotData.push({
                x: chartData.map((item) => item.date),
                y: chartData.map((item) => item.bollinger_lower),
                type: 'scatter',
                mode: 'lines',
                line: { color: 'gray', width: 2 },
                name: 'Bollinger Lower',
            });
            break;
        default:
            break;
    }

    console.log("Plot data:", plotData);
    
    const displayedDates = chartData
        .filter((_, index) => index % Math.max(1, Math.floor(chartData.length / 6)) === 0)
        .map((item) => item.date);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{selectedStock} Stock Chart</h2>

            <div className={styles.dropdownContainer}>
                <label>
                    Select Graph Type:
                    <select value={selectedGraph} onChange={handleGraphChange}>
                        <option value="candlestick">Candlestick</option>
                        <option value="sma">SMA (14)</option>
                        <option value="ema">EMA (14)</option>
                        <option value="rsi">RSI (14)</option>
                        <option value="macd">MACD</option>
                        <option value="bollinger">Bollinger Bands</option>
                    </select>
                </label>
            </div>

            <div className={styles.chartContainer}>
                <Plot
                    data={plotData}
                    layout={{
                        title: `Stock Chart - ${selectedGraph}`,
                        xaxis: {
                            title: 'Date',
                            gridcolor: '#eee',
                            showgrid: true,
                            tickvals: displayedDates,
                            fixedrange: false,
                            tickangle: -45,
                        },
                        yaxis: {
                            title: 'Price (USD)',
                            gridcolor: '#eee',
                            showgrid: true,
                            fixedrange: false,
                        },
                        yaxis2: {
                            title: 'RSI',
                            overlaying: 'y',
                            side: 'right',
                            gridcolor: '#eee',
                            showgrid: false,
                            fixedrange: false,
                        },
                        paper_bgcolor: '#f9f9f9',
                        plot_bgcolor: '#ffffff',
                        margin: { t: 40, r: 40, l: 60, b: 60 },
                        font: { family: 'Arial, sans-serif', size: 12 },
                    }}
                    config={{
                        responsive: true,
                        displayModeBar: true,
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '400px' }}
                />
            </div>
        </div>
    );
};
import React from 'react';
import ReactDOM from 'react-dom';
import WeatherApp from './WeatherApp';
// 這個 CSS 檔案會作用到全域
import './index.css';
import reportWebVitals from './reportWebVitals';
// 引用serviceWorker 
import * as serviceWorker from './serviceWorker'

function App() {
  return <WeatherApp />
}

const rootElement = document.getElementById('root');

ReactDOM.render(<App />, rootElement);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
serviceWorker.register();

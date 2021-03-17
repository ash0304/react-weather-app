import React, { useState, useEffect, useMemo } from 'react';
// 載入 emotion 的 styled 套件
import styled from '@emotion/styled';
// 從 emotion-theming 中載入 ThemeProvider
import { ThemeProvider } from '@emotion/react';
// 匯出日出日落資料 & 引用 dayjs
import dayjs from 'dayjs';
import sunriseAndSunsetData from './sunrise-sunset.json';

import WeatherCard from './WeatherCard';
// 載入 useWeatherApi Hook
import useWeatherApi from './useWeatherApi';
// 匯入 WeatherSetting組件
import WeatherSetting from './WeatherSetting';
// 匯入定義好的 findLocation 方法
import { findLocation } from './utils';

// 定義主題配色
const theme = {
    light: {
        backgroundColor: '#ededed',
        foregroundColor: '#f9f9f9',
        boxShadow: '0 1px 3px 0 #999999',
        titleColor: '#212121',
        temperatureColor: '#757575',
        textColor: '#828282',
    },
    dark: {
        backgroundColor: '#1F2022',
        foregroundColor: '#121416',
        boxShadow:
            '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
        titleColor: '#f9f9fa',
        temperatureColor: '#dddddd',
        textColor: '#cccccc',
    },
}

// 定義帶有 styled 的 component
const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const getMoment = locationName => {
    // STEP 2 : 從日出日落時間中找出符合的地區
    const location = sunriseAndSunsetData.find(
        data => data.locationName === locationName
    )
    // STEP 3: 找不到的話回傳null
    if (!location) return null;
    // STEP 4 : 取得當前時間
    const now = new dayjs();
    // STEP 5 : 將當前時間以 "2021-03-09" 的時間格式呈現
    const nowDate = Intl.DateTimeFormat('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(now).replace(/\//g, '-');
    // STEP 6 : 從該地區中找到對應日期
    const locationDate = location.time && location.time.find((time) => time.dataTime === nowDate);
    // STEP 7 : 將日出日落以及當前時間轉換成時間戳(TimeStamp)
    const sunriseTimestamp = dayjs(
        `${locationDate.dataTime} ${locationDate.sunrise}`
    ).unix();
    const sunsetTimestamp = dayjs(
        `${locationDate.dataTime} ${locationDate.sunset}`
    ).unix();
    // STEP 8 : 若當前時間界於日出和日落中間，則表示為白天，否則為晚上
    const nowTimeStamp = now.unix();
    return sunriseTimestamp <= nowTimeStamp && nowTimeStamp <= sunsetTimestamp ? 'day' : 'night';
};

const WeatherApp = () => {
    // 從 localStorage 取出 cityName，並取名為storageCity
    const storageCity = localStorage.getItem('cityName');
    // 使用 useState 並定義當前要拉取天氣資訊的地區，預設為臺北市
    const [currentCity, setCurrentCity] = useState(storageCity || '臺北市');
    // 根據 currentCity 來找出對應到不同 API 時顯示的地區名稱，找到的地區取名為locationInfo
    const currentLocation = findLocation(currentCity) || {};
    // 定義 currentPage 這個 state ， 預設值是WeatherCard
    const [currentPage, setCurrentPage] = useState('WeatherCard');
    // 使用 useWeatherApi Hook 後就能取得 weatherElement 和 fetchData 這兩個方法
    const [weatherElement, fetchData] = useWeatherApi(currentLocation);
    // 使用 useState 並定義 currentTheme 的預設值為light
    const [currentTheme, setCurrentTheme] = useState('light');

    // 透過 useMemo 避免每次都重新計算取值，記得帶入dependencies
    const moment = useMemo(() => getMoment(currentLocation.sunriseCityName), [currentLocation.sunriseCityName]);
    // 當 currentCity 有改變的時候，儲存到 localStorage 中
    useEffect(() => {
        localStorage.setItem('cityName', currentCity);
    }, [currentCity])
    // 根據 moment 決定要使用亮色或深色主題
    useEffect(() => {
        setCurrentTheme(moment === 'day' ? 'light' : 'dark');
    }, [moment])
    return (
        // 把主題配色透過 props 帶入 ThemeProvider 中
        <ThemeProvider theme={theme[currentTheme]}>
            <Container>
                {/* 條件渲染根據 currentPage 狀態改變顯示組件 */}
                {currentPage === 'WeatherCard' && <WeatherCard weatherElement={weatherElement}
                    cityName={currentLocation.cityName}
                    moment={moment}
                    fetchData={fetchData}
                    setCurrentPage={setCurrentPage} />}
                {currentPage === 'WeatherSetting' && <WeatherSetting cityName={currentLocation.cityName} setCurrentCity={setCurrentCity} setCurrentPage={setCurrentPage} />}
            </Container>
        </ThemeProvider>
    );
};

export default WeatherApp;



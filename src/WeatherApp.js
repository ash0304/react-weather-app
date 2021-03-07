import React, { useState, useEffect, useCallback } from 'react';
// 載入 emotion 的 styled 套件
import styled from '@emotion/styled';
// 載入圖示
import WeatherIcon from './WeatherIcon';
import { ReactComponent as AirFlowIcon } from './images/airFlow.svg';
import { ReactComponent as RainIcon } from './images/rain.svg';
import { ReactComponent as RedoIcon } from './images/refresh.svg';

// 定義帶有 styled 的 component
const Container = styled.div`
    background-color: #ededed;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const WeatherCard = styled.div`
    position: relative;
    min-width: 360px;
    box-shadow: 0 1px 3px 0 #999999;
    background-color: #f9f9f9;
    box-sizing: border-box;
    padding: 30px 15px;
`;

const Location = styled.div`
    font-size: 28px;
    color: #212121;
    margin-bottom: 20px;
`;

const Description = styled.div`
    font-size: 16px;
    color: #828282;
    margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
`;

const Temperature = styled.div`
    color: #757575;
    font-size: 96px;
    font-weight: 300;
    display: flex;
`;

const Celsius = styled.div`
    font-weight: normal;
    font-size: 42px;
`;

const AirFlow = styled.div`
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 300;
    color: #828282;
    margin-bottom: 20px;

    svg {
        width: 25px;
        height: auto;
        margin-right: 30px;
    }
`;

const Rain = styled.div`
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 300;
    color: #828282;

    svg {
        width: 25px;
        height: auto;
        margin-right: 30px;
    }
`;

const Redo = styled.div`
    position: absolute;
    right: 15px;
    bottom: 15px;
    font-size: 12px;
    display: inline-flex;
    align-items: flex-end;
    color: #828282;

    svg {
        margin-left: 10px;
        width: 15px;
        height: 15px;
        cursor: pointer;
    }
`;

// 定義 fetchCurrentWeather 方法，呼叫中央氣象局API
const fetchCurrentWeather = () => {
    // STEP 3-1: 加上return 直接把fect API 回傳的Promise回傳出去
    return fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-B699F3CC-3A72-43B8-86D3-99C66F0582DC&locationName=臺北')
        .then((response) => response.json())
        .then((data) => {
            const locationData = data.records.location[0];
            // 將風速(WDSD)、氣溫(TEMP)、濕度(HUMD)的資料取出
            const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {
                if (['WDSD', 'TEMP', 'HUMD'].includes(item.elementName)) {
                    neededElements[item.elementName] = item.elementValue;
                }
                return neededElements
            }, {})
            // 3-2: 把取得的資料內容回傳出去，而不是在這裡 setWeatherElement
            return {
                observationTime: locationData.time.obsTime,
                locationName: locationData.locationName,
                temperature: weatherElements.TEMP,
                windSpeed: weatherElements.WDSD,
                humid: weatherElements.HUMD,
            }
        })
};
const fetchWeatherForecast = () => {
    // STEP 4-1: 加上return 直接把fect API 回傳的Promise回傳出去
    return fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-B699F3CC-3A72-43B8-86D3-99C66F0582DC&locationName=臺北市')
        .then((response) => response.json())
        .then((data) => {
            const locationData = data.records.location[0];
            const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {
                if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
                    neededElements[item.elementName] = item.time[0].parameter;
                }
                return neededElements;
            }, {})
            // 4-2: 把取得的資料內容回傳出去，而不是在這裡 setWeatherElement
            return {
                description: weatherElements.Wx.parameterName,
                weatherCode: weatherElements.Wx.parameterValue,
                rainPossibility: weatherElements.PoP.parameterName,
                comfortability: weatherElements.CI.parameterName
            }
        })
};

const WeatherApp = () => {
    console.log('invoke function component')
    // 定義會使用到的資料狀態
    const [weatherElement, setWeatherElement] = useState({
        observationTime: new Date(),
        locationName: '',
        humid: 0,
        temperature: 0,
        windSpeed: 0,
        description: '',
        weatherCode: 0,
        rainPossibility: 0,
        comfortability: '',
    })
    // 使用useCallback，避免即使內容沒變，程式在useEffect內仍判定有改變而引發無窮迴圈
    const fetchData = useCallback(() => {
        const fetchingData = async () => {
            const [currentWeather, weatherForecast] = await Promise.all([
                fetchCurrentWeather(),
                fetchWeatherForecast()
            ]);

            setWeatherElement({
                ...currentWeather,
                ...weatherForecast
            })
        }
        fetchingData();
    }, [])
    // 第二個參數傳入空陣列，只要每次重新渲染後dependencies內的元素沒有改變，任何useEffect內的函式就不會被執行
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    return (
        <Container>
            {console.log('render')}
            <WeatherCard>
                <Location>{weatherElement.locationName}</Location>
                <Description>
                    {weatherElement.description} {weatherElement.comfortability}
                </Description>
                <CurrentWeather>
                    <Temperature>
                        {Math.round(weatherElement.temperature)}<Celsius>°C</Celsius>
                    </Temperature>
                    <WeatherIcon currentWeatherCode={weatherElement.weatherCode} moment="night" />
                </CurrentWeather>
                <AirFlow>
                    <AirFlowIcon />
                    {weatherElement.windSpeed} m/h
                </AirFlow>
                <Rain>
                    <RainIcon />
                    {Math.round(weatherElement.rainPossibility)} %
                </Rain>
                {/* 將最後觀測時間移到畫面右下角呈現 */}
                <Redo onClick={fetchData}>
                    最後觀測時間:
                    {/* 優化時間呈現 */}
                    {new Intl.DateTimeFormat('zh-TW', {
                        hour: 'numeric',
                        minute: 'numeric'
                    }).format(new Date(weatherElement.observationTime))}{' '}
                    <RedoIcon />
                </Redo>
            </WeatherCard>
        </Container>
    );
};

export default WeatherApp;
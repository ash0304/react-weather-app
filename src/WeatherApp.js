import React, { useState } from 'react';
// 載入 emotion 的 styled 套件
import styled from '@emotion/styled';
// 載入圖示
import { ReactComponent as CloudyIcon } from './images/day-cloudy.svg';
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
// 透過styled(組件) 把樣式帶入已存在的組件中
const Cloudy = styled(CloudyIcon)`
    flex-basis: 30%;
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

const WeatherApp = () => {
    // 定義會使用到的資料狀態
    const [currentWeather, setCurrentWeather] = useState({
        observationTime: '2019-10-02 22:10:00',
        locationName: '臺北市',
        description: '多雲時晴',
        temperature: 27.5,
        windSpeed: 0.3,
        humid: 0.88
    })
    // 定義handleClick 方法，呼叫中央氣象局API
    const handleClick = () => {
        fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-B699F3CC-3A72-43B8-86D3-99C66F0582DC&locationName=臺北')
            .then((response) => response.json())
            .then((data) => {
                console.log(data)
                const locationData = data.records.location[0];
                // 將風速(WDSD)、氣溫(TEMP)、濕度(HUMD)的資料取出
                const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {
                    if (['WDSD', 'TEMP', 'HUMD'].includes(item.elementName)) {
                        neededElements[item.elementName] = item.elementValue;
                    }
                    return neededElements
                }, {})
                // 要使用到React組件中的資料
                setCurrentWeather({
                    observationTime: locationData.time.obsTime,
                    locationName: locationData.locationName,
                    description: '多雲時晴',
                    temperature: weatherElements.TEMP,
                    windSpeed: weatherElements.WDSD,
                    humid: weatherElements.HUMD,
                })
            })
    };
    return (
        <Container>
            <WeatherCard>
                <Location>{currentWeather.locationName}</Location>
                <Description>
                    {''}
                    {currentWeather.description}
                </Description>
                <CurrentWeather>
                    <Temperature>
                        {Math.round(currentWeather.temperature)}<Celsius>°C</Celsius>
                    </Temperature>
                    <Cloudy />
                </CurrentWeather>
                <AirFlow>
                    <AirFlowIcon />
                    {currentWeather.windSpeed} m/h
                </AirFlow>
                <Rain>
                    <RainIcon />
                    {/* 針對濕度進行四捨五入 */}
                    {Math.round(currentWeather.humid * 100)} %
                </Rain>
                {/* 將最後觀測時間移到畫面右下角呈現 */}
                <Redo onClick={handleClick}>
                    最後觀測時間:
                    {/* 優化時間呈現 */}
                    {new Intl.DateTimeFormat('zh-TW', {
                        hour: 'numeric',
                        minute: 'numeric'
                    }).format(new Date(currentWeather.observationTime))}
                    <RedoIcon />
                </Redo>
            </WeatherCard>
        </Container>
    );
};

export default WeatherApp;
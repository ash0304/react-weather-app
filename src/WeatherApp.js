import React, { useState, useEffect, useCallback, useMemo } from 'react';
// 載入 emotion 的 styled 套件
import styled from '@emotion/styled';
// 從 emotion-theming 中載入 ThemeProvider
import { ThemeProvider } from '@emotion/react';
// 匯出日出日落資料 & 引用 dayjs
import dayjs from 'dayjs';
import sunriseAndSunsetData from './sunrise-sunset.json';
// 載入圖示
import WeatherIcon from './WeatherIcon';
import { ReactComponent as AirFlowIcon } from './images/airFlow.svg';
import { ReactComponent as RainIcon } from './images/rain.svg';
import { ReactComponent as RefreshIcon } from './images/refresh.svg';
import { ReactComponent as LoadingIcon } from './images/loading.svg';

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

const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  background-color: ${({ theme }) => theme.foregroundColor};
  box-sizing: border-box;
  padding: 30px 15px;
`;

const Location = styled.div`
  font-size: 28px;
  color: ${({ theme }) => theme.titleColor};
  margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: ${({ theme }) => theme.temperatureColor};
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
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
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
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Refresh = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: ${({ theme }) => theme.textColor};

  svg {
    margin-left: 10px;
    width: 15px;
    height: 15px;
    cursor: pointer;
    animation: rotate infinite 1.5s linear;
    animation-duration: ${({ isLoading }) => (isLoading ? '1.5s' : '0s')};
  }

  @keyframes rotate {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
`;

// 定義 fetchCurrentWeather 方法，呼叫中央氣象局API
const fetchCurrentWeather = () => {
    // 加上return 直接把fect API 回傳的Promise回傳出去
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
            // 把取得的資料內容回傳出去，而不是在這裡 setWeatherElement
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
    // 加上return 直接把fect API 回傳的Promise回傳出去
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
            // 把取得的資料內容回傳出去，而不是在這裡 setWeatherElement
            return {
                description: weatherElements.Wx.parameterName,
                weatherCode: weatherElements.Wx.parameterValue,
                rainPossibility: weatherElements.PoP.parameterName,
                comfortability: weatherElements.CI.parameterName
            }
        })
};

const getMoment = locationName => {
    // STEP 2 : 從日出日落時間中找出符合的地區
    const location = sunriseAndSunsetData.find(
        data => data.locationName.substr(0, 2) === locationName
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
    console.log('invoke function component')
    // 使用 useState 並定義 currentTheme 的預設值為light
    const [ currentTheme, setCurrentTheme ] = useState('light');
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
        isLoading: true
    })

    // 解構賦值
    const {
        observationTime,
        locationName,
        temperature,
        windSpeed,
        description,
        weatherCode,
        rainPossibility,
        comfortability,
        isLoading
    } = weatherElement;

    // 使用useCallback，避免即使內容沒變，程式在useEffect內仍判定有改變而引發無窮迴圈
    const fetchData = useCallback(() => {
        const fetchingData = async () => {
            const [currentWeather, weatherForecast] = await Promise.all([
                fetchCurrentWeather(),
                fetchWeatherForecast()
            ]);

            setWeatherElement({
                ...currentWeather,
                ...weatherForecast,
                isLoading: false,
            })
        };

        setWeatherElement(prevState => {
            return {
                ...prevState,
                isLoading: true,
            };
        });

        fetchingData();
    }, [])
    // 透過 useMemo 避免每次都重新計算取值，記得帶入dependencies
    const moment = useMemo(() => getMoment(locationName), [locationName]);
    // 第二個參數傳入空陣列，只要每次重新渲染後dependencies內的元素沒有改變，任何useEffect內的函式就不會被執行
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 根據 moment 決定要使用亮色或深色主題
    useEffect(() => {
        setCurrentTheme(moment === 'day' ? 'light' : 'dark');
    }, [moment]) 
    return (
        // 把主題配色透過 props 帶入 ThemeProvider 中
        <ThemeProvider theme={theme[currentTheme]}>
            <Container>
                <WeatherCard>
                    <Location>{locationName}</Location>
                    <Description>
                        {description} {comfortability}
                    </Description>
                    <CurrentWeather>
                        <Temperature>
                            {Math.round(temperature)}<Celsius>°C</Celsius>
                        </Temperature>
                        {/* 將 momnet 帶入 props 中 */}
                        <WeatherIcon currentWeatherCode={weatherCode} moment={moment || 'day'} />
                    </CurrentWeather>
                    <AirFlow>
                        <AirFlowIcon />
                        {windSpeed} m/h
                </AirFlow>
                    <Rain>
                        <RainIcon />
                        {Math.round(rainPossibility)} %
                </Rain>
                    {/* 將最後觀測時間移到畫面右下角呈現 */}
                    <Refresh onClick={fetchData} isLoading={isLoading}>
                        最後觀測時間:
                    {/* 優化時間呈現 */}
                        {new Intl.DateTimeFormat('zh-TW', {
                            hour: 'numeric',
                            minute: 'numeric'
                        }).format(new Date(observationTime))}{' '}

                        {/* 當 isLoading 為true的時候顯示 LoadingIcon 否則顯示 RedoIcon */}
                        {isLoading ? <LoadingIcon /> : <RefreshIcon />}
                    </Refresh>
                </WeatherCard>
            </Container>
        </ThemeProvider>
    );
};

export default WeatherApp;
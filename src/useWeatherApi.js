// 載入會用到的 React Hooks
import { useState, useEffect, useCallback } from 'react';

// 定義 fetchCurrentWeather 方法，呼叫中央氣象局API
const fetchCurrentWeather = (locationName) => {
    // 加上return 直接把fect API 回傳的Promise回傳出去
    return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-B699F3CC-3A72-43B8-86D3-99C66F0582DC&locationName=${locationName}`)
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
const fetchWeatherForecast = (cityName) => {
    // 加上return 直接把fect API 回傳的Promise回傳出去
    return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-B699F3CC-3A72-43B8-86D3-99C66F0582DC&locationName=${cityName}`)
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

const useWeatherApi = (currentLocation) => {
    console.log(currentLocation)
    // 將傳入的 currentLocation 透過解構賦值取出
    const { locationName, cityName} = currentLocation;
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
    });

    // 使用useCallback，避免即使內容沒變，程式在useEffect內仍判定有改變而引發無窮迴圈
    const fetchData = useCallback(() => {
        const fetchingData = async () => {
            const [currentWeather, weatherForecast] = await Promise.all([
                fetchCurrentWeather(locationName),
                fetchWeatherForecast(cityName)
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
    }, [locationName, cityName])

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 把要給其他 React 組件使用的資料或方法回傳出去
    return [weatherElement, fetchData];
};

export default useWeatherApi;
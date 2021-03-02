import React from 'react';

// STEP 1 : 載入 emotion 的 styled 套件
import styled from '@emotion/styled';

// STEP 2 : 定義帶有 styled 的 component
const Container = styled.div`
    background-color: #ededed;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`

const WeatherCard = styled.div`
    position: relative;
    min-width: 360px;
    box-shadow: 0 1px 3px 0 #999999;
    background-color: #f9f9f9;
    box-sizing: border-box;
    padding: 30px 15px;
`

const WeatherApp = () => {
    return (
        <Container>
            <WeatherCard>
                <h1>Weather</h1>
            </WeatherCard>
        </Container>
    );
};

export default WeatherApp;
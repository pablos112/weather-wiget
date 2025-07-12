import { useState, useEffect } from "react";
import "./index.css";
const KEY = "d3bbbc5d151e4e81bf0105328252005";
function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not support by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
      },
      (err) => {
        console.error("Geolocation error", err);
        setError("Failed to get your location");
      }
    );
  }, []);

  useEffect(() => {
    const controler = new AbortController();
    const signal = controler.signal;

    if (!city.trim() && !coords) {
      setWeatherData(null);
      setError(null);
      return;
    }
    async function getData() {
      setLoading(true);
      try {
        const query = city.trim()
          ? city
          : `${coords.latitude}, ${coords.longitude}`;
        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${KEY}&q=${query}`,
          { signal }
        );
        const data = await res.json();

        if (data.error) {
          setError(data.error.message);
          setWeatherData(null);
          return;
        }
        setWeatherData(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetvh weather data");
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    }
    getData();
    return () => {
      controler.abort();
    };
  }, [city, coords]);

  function renderError() {
    return <p>{error}</p>;
  }
  function renderLoading() {
    return <p>Loading...</p>;
  }

  function renderWeather() {
    return (
      <div className="weather-card">
        <h2>{`${weatherData?.location?.name}, ${weatherData?.location?.country}`}</h2>
        <img
          src={`https:${weatherData?.current?.condition?.icon}`}
          alt="icon"
          className="weather-icon"
        />
        <p className="temperature">
          {Math.round(weatherData?.current?.temp_c)}°C
        </p>
        <p className="condition">{weatherData?.current?.condition?.text}</p>
        <div className="weather-details">
          <p>Humidity: {weatherData?.current?.humidity}%</p>
          <p>Wind: {weatherData?.current?.wind_kph} km/h</p>
        </div>
      </div>
    );
  }
  return (
    <div className="app">
      <div className="widget-container">
        <div className="weather-card-container">
          <h1 className="app-title">Weather Widget</h1>
          <div className="search-container">
            <input
              type="text"
              value={city}
              placeholder="Enter city name"
              className="search-input"
              onChange={(e) => {
                setCity(e.target.value);
              }}
            />
          </div>
        </div>
        {error && renderError()}
        {loading && renderLoading()}
        {!error && !loading && weatherData && renderWeather()}
      </div>
    </div>
  );
}

export default App;

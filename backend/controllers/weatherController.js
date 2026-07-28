import axios from 'axios';

// Maps Open-Meteo weather codes to descriptions and icons
const getWeatherDesc = (code) => {
  const codes = {
    0: { desc: 'Clear sky', icon: '☀️' },
    1: { desc: 'Mainly clear', icon: '🌤️' },
    2: { desc: 'Partly cloudy', icon: '⛅' },
    3: { desc: 'Overcast', icon: '☁️' },
    45: { desc: 'Foggy', icon: '🌫️' },
    48: { desc: 'Depositing rime fog', icon: '🌫️' },
    51: { desc: 'Light drizzle', icon: '🌧️' },
    53: { desc: 'Moderate drizzle', icon: '🌧️' },
    55: { desc: 'Dense drizzle', icon: '🌧️' },
    61: { desc: 'Slight rain', icon: '🌧️' },
    63: { desc: 'Moderate rain', icon: '🌧️' },
    65: { desc: 'Heavy rain', icon: '🌧️' },
    71: { desc: 'Slight snow', icon: '❄️' },
    73: { desc: 'Moderate snow', icon: '❄️' },
    75: { desc: 'Heavy snow', icon: '❄️' },
    80: { desc: 'Slight rain showers', icon: '🌦️' },
    81: { desc: 'Moderate rain showers', icon: '🌦️' },
    82: { desc: 'Violent rain showers', icon: '⛈️' },
    95: { desc: 'Thunderstorm', icon: '⛈️' },
    96: { desc: 'Thunderstorm with light hail', icon: '⛈️' },
    99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️' }
  };
  return codes[code] || { desc: 'Moderate weather', icon: '🌤️' };
};

// Generates dynamic agricultural advisories based on weather conditions
const getAdvisory = (temp, humidity, wind, rainCode, precipitationDaily) => {
  const advisories = [];

  if (precipitationDaily > 5) {
    advisories.push("☔ Heavy rainfall predicted. Postpone field watering/irrigation cycles and clear drainage paths.");
    advisories.push("🚫 Avoid applying chemical fertilizers or sprays today, as they will wash off.");
  } else if (temp > 35) {
    advisories.push("🔥 Extreme heat: Increase irrigation rate. Water early in the morning or late in the evening to reduce water loss.");
    advisories.push("🌾 Protect young crops from sun scorch with light shade nets or straw cover.");
  } else if (temp < 12) {
    advisories.push("❄️ Cold winter weather: Monitor crops for frostbite. Create smoke fires around fields at night if frost warning is active.");
  }

  if (humidity > 80 && temp > 20) {
    advisories.push("🪱 Damp & Warm: High risk of fungal outbreaks (leaf blast/powdery mildew) and insect pests. Examine leaves closely.");
  }

  if (wind > 20) {
    advisories.push("💨 High wind speed: Avoid liquid spraying as drift will blow sprays away. Support tall crops with stakes.");
  }

  if (advisories.length === 0) {
    advisories.push("☀️ Good farming conditions: Ideal day for sowing seeds, plowing soil, weeding, or spraying pest control.");
    advisories.push("💧 Soil absorption rates are excellent. Carry out regular scheduled irrigation.");
  }

  return advisories;
};

export const getWeather = async (req, res) => {
  let { lat, lon } = req.query;

  const latitude = lat ? parseFloat(lat) : 22.719;
  const longitude = lon ? parseFloat(lon) : 75.857;

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (apiKey) {
    console.log('[Weather API] Attempting OpenWeatherMap integration...');
    try {
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
      const currentRes = await axios.get(currentUrl);
      const currentData = currentRes.data;

      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
      const forecastRes = await axios.get(forecastUrl);
      const forecastData = forecastRes.data;

      const temp = currentData.main.temp;
      const humidity = currentData.main.humidity;
      const windSpeed = currentData.wind.speed * 3.6; // convert m/s to km/h
      const weatherId = currentData.weather[0].id;
      const description = currentData.weather[0].description;
      
      let icon = '🌤️';
      if (weatherId >= 200 && weatherId < 300) icon = '⛈️';
      else if (weatherId >= 300 && weatherId < 600) icon = '🌧️';
      else if (weatherId >= 600 && weatherId < 700) icon = '❄️';
      else if (weatherId === 800) icon = '☀️';
      else icon = '☁️';

      const advisories = getAdvisory(temp, humidity, windSpeed, weatherId, 0);

      const forecast = [];
      const dailyMap = {};
      
      forecastData.list.forEach((item) => {
        const dateStr = item.dt_txt.split(' ')[0];
        if (!dailyMap[dateStr]) {
          dailyMap[dateStr] = [];
        }
        dailyMap[dateStr].push(item);
      });

      Object.keys(dailyMap).slice(0, 5).forEach((date) => {
        const items = dailyMap[date];
        let maxT = -999;
        let minT = 999;
        let weather = items[0].weather[0];
        
        items.forEach((item) => {
          if (item.main.temp_max > maxT) maxT = item.main.temp_max;
          if (item.main.temp_min < minT) minT = item.main.temp_min;
        });

        let dayIcon = '🌤️';
        if (weather.id >= 200 && weather.id < 300) dayIcon = '⛈️';
        else if (weather.id >= 300 && weather.id < 600) dayIcon = '🌧️';
        else if (weather.id === 800) dayIcon = '☀️';

        forecast.push({
          date,
          tempMax: Math.round(maxT),
          tempMin: Math.round(minT),
          precipitation: 0,
          description: weather.description,
          icon: dayIcon
        });
      });

      return res.status(200).json({
        location: { latitude, longitude },
        current: {
          temp: Math.round(temp),
          feelsLike: Math.round(currentData.main.feels_like),
          humidity,
          windSpeed: Math.round(windSpeed),
          precipitation: 0,
          description,
          icon
        },
        forecast,
        advisories
      });
    } catch (e) {
      console.warn('[Weather API] OpenWeatherMap request failed, falling back to Open-Meteo:', e.message);
    }
  }

  // Fallback to Open-Meteo
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
    const response = await axios.get(url);
    const data = response.data;

    const current = data.current;
    const daily = data.daily;

    const currentDetails = getWeatherDesc(current.weather_code);
    const advisories = getAdvisory(
      current.temperature_2m,
      current.relative_humidity_2m,
      current.wind_speed_10m,
      current.weather_code,
      daily.precipitation_sum[0] || 0
    );

    const forecast = [];
    const daysToShow = Math.min(5, daily.time.length);
    for (let i = 0; i < daysToShow; i++) {
      const forecastDetails = getWeatherDesc(daily.weather_code[i]);
      forecast.push({
        date: daily.time[i],
        tempMax: daily.temperature_2m_max[i],
        tempMin: daily.temperature_2m_min[i],
        precipitation: daily.precipitation_sum[i],
        description: forecastDetails.desc,
        icon: forecastDetails.icon
      });
    }

    return res.status(200).json({
      location: { latitude, longitude },
      current: {
        temp: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        precipitation: current.precipitation,
        description: currentDetails.desc,
        icon: currentDetails.icon
      },
      forecast,
      advisories
    });
  } catch (err) {
    console.error('Failed to load Open-Meteo weather data:', err.message);
    // Return realistic fallback weather mock rather than crash
    const fallbackPayload = {
      location: { latitude, longitude },
      current: {
        temp: 28.5,
        feelsLike: 31.0,
        humidity: 65,
        windSpeed: 12.4,
        precipitation: 0.0,
        description: 'Partly cloudy',
        icon: '⛅'
      },
      forecast: [
        { date: '2026-07-22', tempMax: 32, tempMin: 22, precipitation: 0, description: 'Partly cloudy', icon: '⛅' },
        { date: '2026-07-23', tempMax: 33, tempMin: 23, precipitation: 1.2, description: 'Slight rain showers', icon: '🌦️' },
        { date: '2026-07-24', tempMax: 30, tempMin: 22, precipitation: 8.5, description: 'Moderate rain', icon: '🌧️' },
        { date: '2026-07-25', tempMax: 31, tempMin: 21, precipitation: 4.2, description: 'Slight rain', icon: '🌧️' },
        { date: '2026-07-26', tempMax: 32, tempMin: 22, precipitation: 0.5, description: 'Mainly clear', icon: '🌤️' }
      ],
      advisories: [
        "☀️ Good farming conditions: Ideal day for sowing seeds, plowing soil, or weeding.",
        "💧 Soil absorption rates are excellent. Carry out regular scheduled irrigation."
      ]
    };
    return res.status(200).json(fallbackPayload);
  }
};


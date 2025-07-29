const apiKey = 'You api'; // Replace with your OpenWeatherMap API key
let chartInstance;

function toggleTheme() {
  document.body.classList.toggle("dark");
}

async function getWeather(city = null, lat = null, lon = null) {
  let url = '';
  if (city) {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  } else if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    document.getElementById("cityName").textContent = data.name;
    document.getElementById("temperature").textContent = `${Math.round(data.main.temp)} °C`;
    document.getElementById("description").textContent = data.weather[0].description;
    document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById("wind").textContent = `Wind: ${data.wind.speed} km/h`;

    const iconCode = data.weather[0].icon;
    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    await getHourlyForecast(data.coord.lat, data.coord.lon);
  } catch (error) {
    alert("Error fetching weather!");
  }
}

function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        getWeather(null, latitude, longitude);
      },
      (err) => alert("Permission denied or error getting location.")
    );
  } else {
    alert("Geolocation not supported");
  }
}

async function getHourlyForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  const response = await fetch(url);
  const forecast = await response.json();

  const labels = [];
  const temps = [];

  for (let i = 0; i < 8; i++) {
    const hourData = forecast.list[i];
    const time = new Date(hourData.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    labels.push(time);
    temps.push(hourData.main.temp);
  }

  if (chartInstance) chartInstance.destroy();

  const ctx = document.getElementById('tempChart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Hourly Temp (°C)',
        data: temps,
        fill: true,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: 'white',
        tension: 0.4
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: document.body.classList.contains('dark') ? 'white' : 'black' } }
      },
      scales: {
        x: { ticks: { color: 'white' } },
        y: { ticks: { color: 'white' } }
      }
    }
  });
}

function getWeatherFromInput() {
  const city = document.getElementById("cityInput").value;
  if (city) getWeather(city);
}

window.getWeather = getWeatherFromInput;
window.getLocationWeather = getLocationWeather;
window.toggleTheme = toggleTheme;

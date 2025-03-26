document.getElementById('getWeather').addEventListener('click', getWeather);
document.getElementById('clearCache').addEventListener('click', clearCache);

async function getWeather() {
    const city = document.getElementById('city').value;
    const apiKey = '243501e40f8d23da6dffb20f2e32a502';  // OpenWeatherMap API key
    const geocodingUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    try {
        // Checking if cached data exists
        const cache = localStorage.getItem(city);
        if (cache) {
            const parsedCache = JSON.parse(cache);
            const cacheTime = parsedCache.timestamp;
            const currentTime = new Date().getTime();
            const timeDifference = (currentTime - cacheTime) / (1000 * 60);  // Converting to minutes

            // If cached data is less than 180 minutes old, use the cache
            if (timeDifference <= 180) {
                console.log('Using cached weather data');
                displayWeather(parsedCache.weatherData);
                return;  // Exit early
            } else {
                console.log('Cache is older than 180 minutes, fetching new data');
            }
        }

        // If no cache or cache is outdated, fetch new data
        const geocodeResponse = await fetch(geocodingUrl);
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.cod !== 200) {
            alert('City not found!');
            return;
        }

        const latitude = geocodeData.coord.lat;
        const longitude = geocodeData.coord.lon;

        console.log(`Coordinates of ${city}: Latitude = ${latitude}, Longitude = ${longitude}`);

        // Using the coordinates to get the weather data
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        console.log(weatherData);  // Log the weather data for debugging

        // Display the weather info on the page
        displayWeather(weatherData);

        // Cache the new weather data into localStorage with timestamp
        cacheWeatherData(city, weatherData);

        // Cache the weather data to a file
        cacheToFile(city, latitude, longitude, weatherData);

    } catch (error) {
        console.error(error);
        document.getElementById('error-message').style.display = 'block';
    }
}

function displayWeather(data) {
    if (data && data.main && data.main.temp !== undefined) {
        document.getElementById('city-name').innerText = `City: ${data.name}`;
        document.getElementById('temperature').innerText = `Temperature: ${data.main.temp}°C`;
        document.getElementById('description').innerText = `Weather: ${data.weather[0].description}`;
        document.getElementById('humidity').innerText = `Humidity: ${data.main.humidity}%`;
        document.getElementById('wind-speed').innerText = `Wind Speed: ${data.wind.speed} m/s`;

        document.getElementById('weather-info').style.display = 'block';
    } else {
        alert('Unable to retrieve weather data. Please try again.');
    }
}

function cacheToFile(city, latitude, longitude, weatherData) {
    const fileName = `${city.replace(/\s+/g, '-')}-${latitude.toFixed(4)}-${longitude.toFixed(4)}.txt`;

    const weatherContent = `
City: ${city}
Coordinates: Latitude = ${latitude}, Longitude = ${longitude}
Temperature: ${weatherData.main.temp}°C
Weather: ${weatherData.weather[0].description}
Humidity: ${weatherData.main.humidity}%
Wind Speed: ${weatherData.wind.speed} m/s
    `;

    // Creating a Blob with the weather data
    const blob = new Blob([weatherContent], { type: 'text/plain' });

    // Creating a temporary link to download the file
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    
    // Triggering a click on the link to start the download
    link.click();
}

function cacheWeatherData(city, weatherData) {
    const cacheData = {
        timestamp: new Date().getTime(),
        weatherData: weatherData
    };

    // Storing the weather data and timestamp in localStorage
    localStorage.setItem(city, JSON.stringify(cacheData));
}

function clearCache() {
    const city = document.getElementById('city').value;
    localStorage.removeItem(city);  // Removing the cached data for the given city

    console.log(`Cache for ${city} has been cleared.`);

    // Refreshing the UI to indicate cache has been cleared
    document.getElementById('weather-info').style.display = 'none';
    alert(`Cache for ${city} has been cleared. Please fetch the weather data again.`);
}
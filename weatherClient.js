'use strict'

const WEATHER_TOKEN = '07ad6de01fe24ccee5aec7f3fcf90702';
const MAP_TOKEN = 'pk.eyJ1IjoibWlzaGtvbG4iLCJhIjoiY2p1bGhyc21sMGoxbDN5cXNzZHc3YmhkbSJ9.G2BFsTLp5ftSXhpblLDJBA';
const FIRST = 0;
const MAP_ZOOM = 2;
const MAX_MAP_ZOOM = 18;
const ABS_ZERO = 273.15;
const CACHE_KEEP_MINUTES = 1;

class City {
    constructor(id, name, country, coord) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.coord = coord;
    }
}

class CacheItem {
    constructor(id, data) {
        this.id = id;
        this.setData(data);
    }

    setData(data) {
        this.data = data;
        this.created = new Date();
    }

    isExpired(expirationMinutes) {
        // get difference in minutes between now and created
        const msInMinute = 60000;
        let now = new Date();
        let diff = (now.getTime() - this.created.getTime()) / msInMinute;
        return diff > expirationMinutes;
    }
}

class Cache {
    items = [];

    getItem(id) {
        return this.items.find(e => e.id === id);
    }

    newItem(id, data) {
        this.items.push(new CacheItem(id, data));
    }
}

let cities = [];
let citySelect = null;
let mymap = null;
let cache = null;

window.onload = function () {
    cache = new Cache();
    initCities();
    getWeather();
    displayMap();
}

function initCities() {
    cities.length = 0;
    cities.push(new City(2643743, 'London', 'UK', { "lon": -0.12574, "lat": 51.50853 }));
    cities.push(new City(524901, 'Moscow', 'RU', { "lon": 37.615555, "lat": 55.75222 }));
    cities.push(new City(5128638, 'New York', 'US', { "lon": -74.014313, "lat": 40.78788 }));
    cities.push(new City(293397, 'Tel Aviv', 'IL', { "lon": 34.780571, "lat": 32.080879 }));
    cities.push(new City(1609350, 'Bangkok', 'TH', { "lon": 100.51667, "lat": 13.75 }));

    citySelect = document.getElementById('city');
    citySelect.options.length = 0;
    cities.forEach((city) => {
        citySelect.options[citySelect.options.length] = new Option(city.name, city.id);
    });

    citySelect.onchange = function() {
        getWeather();
        displayMap();
    }
}

function selectedCityId() {
    if(citySelect) {
        return parseInt(citySelect.options[citySelect.selectedIndex].value);
    }
}

function getCityById(id) {
    return cities.find(c => {
        return c.id === id;
    });
}

function getWeather() {
    let cityId = selectedCityId();

    // check cache
    let cachedWeather = cache.getItem(cityId);
    if(cachedWeather && !cachedWeather.isExpired(CACHE_KEEP_MINUTES)) {
        setDataToHtml(cachedWeather.data);
    }
    else {
        // fetch from openweathermap
        let url = 'http://api.openweathermap.org/data/2.5/weather?id=' + cityId + '&APPID=' + WEATHER_TOKEN;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setDataToHtml(data);

                // update expired or add new to cache
                if(cachedWeather) {
                    cachedWeather.setData(data);
                }
                else {
                    cache.newItem(cityId, data);
                }
            });
    }
}

function setDataToHtml(data) {
    document.getElementById('description').innerHTML = data.weather[FIRST].description;
    document.getElementById('wind').innerHTML = data.wind.speed + 'm/s';
    document.getElementById('temperature').innerHTML = Math.round(data.main.temp-ABS_ZERO) + '°C';
    document.getElementById('humidity').innerHTML = data.main.humidity +'%';
}

function displayMap() {
    // create a map for the first time
    if(!mymap) {
        mymap = L.map('mapId');
    }

    // display map of selected city
    let selectedId = selectedCityId();
    let selectedCity = getCityById(selectedId);
    mymap.setView([selectedCity.coord.lat, selectedCity.coord.lon], MAP_ZOOM);

    // layers
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + MAP_TOKEN, {
        maxZoom: MAX_MAP_ZOOM,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(mymap);

    // markers, with custom icon for selected city
    cities.forEach((city) => {
        let marker = L.marker([city.coord.lat, city.coord.lon]);
        if(city.id === selectedId) {
            // custom green icon
            // see https://github.com/pointhi/leaflet-color-markers
            let greenIcon = new L.Icon({
                iconUrl: 'img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
            marker.setIcon(greenIcon);
        }
        marker.addTo(mymap);
    });
}

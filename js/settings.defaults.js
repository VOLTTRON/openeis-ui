var defaultSettings = {
    BASE_HREF: '/',
    API_URL: '/api/',
    LOGIN_PAGE: '/',
    AUTH_HOME: '/projects',
    SENSORMAP_DEFINTION_URL: 'http://localhost:8000/static/projects/json/general_definition.json',
    SENSORMAP_SCHEMA_URL: '/static/projects/json/sensormap-schema.json',
    SENSORMAP_TOPIC_SEPARATOR: '/',
};

var settings = settings || {};

settings = angular.extend(defaultSettings, settings);

var base = document.getElementsByTagName('base')[0];
if (base) { base.setAttribute('href', settings.BASE_HREF); }

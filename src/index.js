import 'reset-css/reset.css';
import 'material-design-lite/material.min.css';
import 'swiper/dist/css/swiper.min.css';
import './sass/styles.scss';

// import Navigo from 'navigo';
import moment from 'moment';
import Swiper from 'swiper';
import Vue from 'vue';
import 'material-design-lite/material.min.js';
import WebViewTileHeader from 'webview-tile-header/WebViewTileHeader.js';
WebViewTileHeader._detectCurrentPlatform();

import headerSettingsIcon from './img/icon-settings.svg';

import tabbarResultSelectedAndroidIconSrc from './img/android/sensor-icon-active.svg';
import tabbarResultNotSelectedAndroidIconSrc from './img/android/sensor-icon-not-active.svg';
import tabbarResultSelectediOSIconSrc from './img/ios/sensor-icon-active.svg';
import tabbarResultNotSelectediOSIconSrc from './img/ios/sensor-icon-not-active.svg';

import tabbarHistorySelectedAndroidIconSrc from './img/android/timeline-icon-active.svg';
import tabbarHistoryNotSelectedAndroidIconSrc from './img/android/timeline-icon-not-active.svg';
import tabbarHistorySelectediOSIconSrc from './img/ios/timeline-icon-active.svg';
import tabbarHistoryNotSelectediOSIconSrc from './img/ios/timeline-icon-not-active.svg';

import tabbarSettingsSelectedAndroidIconSrc from './img/android/settings-icon-active.svg';
import tabbarSettingsNotSelectedAndroidIconSrc from './img/android/settings-icon-not-active.svg';
import tabbarSettingsSelectediOSIconSrc from './img/ios/settings-icon-active.svg';
import tabbarSettingsNotSelectediOSIconSrc from './img/ios/settings-icon-not-active.svg';

import temperatureListIconSrc from './img/temperature-icon-ambient-square.svg';

import Settings from './lib/Settings';
import * as Utils from './lib/Utils';
import TemperatureUnit from './enums/TemperatureUnit';
import MeasureType from './enums/MeasureType';

import '../bower_components/morph-tabbar/morph-tabbar.html'; 
import '../bower_components/morph-tabbar-item/morph-tabbar-item.html';

import '../bower_components/morph-pages/morph-location.html';
import '../bower_components/morph-pages/morph-pages.html';

import '../bower_components/morph-list-view/morph-list-view.html';
import '../bower_components/morph-list-view-item/morph-list-view-item.html';
import '../bower_components/morph-list-view-title/morph-list-view-title.html';


Settings.setPrefix('hat_tile_v1_');
const defaultSettings = {
  units: TemperatureUnit.Celsius,
  measureType: MeasureType.Ambient,
  showInstruction: true
};
const loadedSettings = Settings.Load(defaultSettings);

const STORAGE_KEY = 'hat-history-storage';

const tile = new Vue({
  el: '#wrapper',
  data: {
    currentPage: 'result',
    // platform: 'undefined',
    navigationDirection: 'forward',
    
    sensorValues: {
        ambientTemperature: 0,
        objectTemperature: 0,
        humidity: 0
    },
    snapshotValues: {
        measureType: MeasureType.Ambient,
        temperature: 0,
        humidity: 0,
        timestamp: 0,
        textInput: '',
    },
    settings: loadedSettings,
    temperatureHistoryValues: [],
    temperatureListDataValues: [],
    icons: {
      temperatureListIconSrc
    }
  },

  created() {
    const json = localStorage.getItem(STORAGE_KEY);
    this.temperatureHistoryValues = json != null ? JSON.parse(json) : [];
    this.temperatureListDataValues = this.temperatureListDataGroupByDateOutput;
  },
 
  filters: {
    capitalize: function (value) {
      if (!value) return '';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    // Format date to show Today or Tomorrow
    dateFormat: function (date) {
      let jsDate = new Date(date);
      let otherDates = moment(jsDate).fromNow();
      var callback = function () {
        return "[" + otherDates + "]";
      };

      return moment(jsDate).calendar(null, {
        sameDay: '[Today]',
        nextDay: 'DD/MM/YYYY',
        nextWeek: 'DD/MM/YYYY',
        lastDay: '[Yesterday]',
        lastWeek: 'DD/MM/YYYY',
        sameElse: 'DD/MM/YYYY'
      });
    }
    
  },

  methods: {
    changeMeasureType: function() {
      this.settings.measureType = this.settings.measureType == MeasureType.Ambient ? MeasureType.Object : MeasureType.Ambient;
    },

    disableInstruction: function() {
      this.settings.showInstruction = false;
    },

    saveTemperatureHistory: function() {
      this.temperatureHistoryValues.unshift({
        id: this.temperatureHistoryValues.length,
        temperatureValue: this.snapshotTemperatureOutput,
        humidityValue: this.snapshotHumidityOutput,
        time: this.snapshotTimeOutput,
        date: this.snapshotDateOutput,
        label: this.snapshotValues.textInput.trim(),
        type: this.snapshotValues.measureType
      });
      this.snapshotValues.textInput = '';
      this.temperatureListDataValues = this.temperatureListDataGroupByDateOutput;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.temperatureHistoryValues));
    },
   
    snapshotTimeObjectOutputFunction: function() {
      // return moment(this.snapshotValues.timestamp).toObject();
      let timestampObject = moment.unix(this.snapshotValues.timestamp);
    },

    removeTemperatureHistoryItem: function (id) {
      // TODO: pass item instead and say delete index of item
      // let index = this.temperatureHistoryValues.map(function(e) { return e.id; }).indexOf('id');
      let index = this.temperatureHistoryValues.map(function (e) { console.log(e.id); return e.id; }).indexOf(id);
      console.log('index', index);
      
      this.$delete(this.temperatureHistoryValues, index);
      this.temperatureListDataValues = this.temperatureListDataGroupByDateOutput;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.temperatureHistoryValues));
    }

  },

  watch: {
    settings: {
      handler: function(newSettings, oldSettings) {
          Settings.Save(newSettings);
      },
      deep: true
    }
  },

  computed: {
    platform: function() {
      // get tile.platform after body.classList is set
      return getPlatformValue();
    },

    tabbarResultSelectedIcon: function () {
      return this.platform == 'android' ? tabbarResultSelectedAndroidIconSrc : tabbarResultSelectediOSIconSrc;
    },

    tabbarResultNotSelectedIcon: function() {
      return this.platform == 'android' ? tabbarResultNotSelectedAndroidIconSrc : tabbarResultNotSelectediOSIconSrc;
    },

    tabbarHistorySelectedIcon: function () {
      return this.platform == 'android' ? tabbarHistorySelectedAndroidIconSrc : tabbarHistorySelectediOSIconSrc;
    },

    tabbarHistoryNotSelectedIcon: function () {
      return this.platform == 'android' ? tabbarHistoryNotSelectedAndroidIconSrc : tabbarHistoryNotSelectediOSIconSrc;
    },

    tabbarSettingsSelectedIcon: function () {
      return this.platform == 'android' ? tabbarSettingsSelectedAndroidIconSrc : tabbarSettingsSelectediOSIconSrc;
    },

    tabbarSettingsNotSelectedIcon: function () {
      return this.platform == 'android' ? tabbarSettingsNotSelectedAndroidIconSrc : tabbarSettingsNotSelectediOSIconSrc;
    },

    temperatureValue: function() {
      let temperature;
      // taking required temperature
      if(this.settings.measureType == MeasureType.Ambient) {
        temperature = this.sensorValues.ambientTemperature;
      } else {
        temperature = this.sensorValues.objectTemperature;
      }

      // if user uses fahrenheit, converting value
      if(this.settings.units == TemperatureUnit.Fahrenheit) {
        temperature = Utils.Celsius2Farenheit(temperature);
      }

      return temperature;
    },

    temperatureOutput: function() {
      const temperature = this.temperatureValue.toFixed(1);

      return temperature;
    },

    temperatureUnitSelected: function () {
      let temperatureUnit;
      if (this.settings.units == TemperatureUnit.Celsius) {
          temperatureUnit = 'C';
      } else {
          temperatureUnit = 'F';
      }
      return temperatureUnit;
    },

    humidityOutput: function() {
      return this.sensorValues.humidity.toFixed(1);
    },

    scaleUnitClass: function() {
      return {
        'temperature-scale__scale--celsius': this.settings.units == TemperatureUnit.Celsius,
        'temperature-scale__scale--fahrenheit': this.settings.units == TemperatureUnit.Fahrenheit
      };
    },

    scaleValue: function() {
      let scaleValue;
      if(this.settings.units == TemperatureUnit.Celsius) {
        scaleValue = this.temperatureValue * 7;
      } else {
        scaleValue = this.temperatureValue * 3;
      }
      return {
        transform: `translateY(${scaleValue}px)`
      };
    },

    isMeasuringObject: function() {
      return this.settings.measureType == MeasureType.Object;
    },

    snapshotTimeOutput: function() {
      return moment(this.snapshotValues.timestamp).format('h:mm A');
    },

    snapshotDateOutput: function () {
      // return moment.unix(this.snapshotValues.timestamp).format('DD/MM/YYYY');
      return this.snapshotValues.timestamp;

    },

    snapshotTemperatureOutput: function() {
      let temperature = this.snapshotValues.temperature;
      // if user uses fahrenheit, converting value
      if(this.settings.units == TemperatureUnit.Fahrenheit) {
        temperature = Utils.Celsius2Farenheit(temperature);
      }
      return temperature.toFixed(1);
    },

    snapshotHumidityOutput: function() {
      return this.snapshotValues.humidity.toFixed(1);
    },

    // make the data arrange by common date
    temperatureListDataGroupByDateOutput: function() {
      const dateGroups = this.temperatureHistoryValues.reduce((dateGroups, items) => {
        const date = items.date;
        const jsDate = new Date(date);
        let dayValue = moment(jsDate).startOf('day');
        if (!dateGroups[dayValue]) {
          dateGroups[dayValue] = [];
        }
        dateGroups[dayValue].push(items);
        return dateGroups;
      }, {});
      /// To add it in the array format
      const groupArrays = Object.keys(dateGroups).map((date) => {
        return {
          date,
          items: dateGroups[date]
        };
      });
      // groupArrays.sort(function (a, b) {
      //   return a.date - b.date;
      // }).reverse();
      // console.log(groupArrays);
      return groupArrays;
    }

  },
});

window.tile = tile;

// Showing module instruction to user by default
// if(tile.settings.showInstruction) {
//   document.location.hash = 'instruction';
// }

const instructionSwiper = new Swiper('.swiper-container', {
    direction: 'horizontal',
    pagination: {
        el: '.swiper-pagination'
    }
});

/* Revealing UI */
document.getElementById('wrapper').style.opacity = 1;


/* Header configuration */
WebViewTileHeader.create('Temperature');
WebViewTileHeader.customize({color: 'white', iconColor:'white', backgroundColor:'#FFB931', borderBottom:'none'});
WebViewTileHeader.hideShadow();

/* Paging system */
// WebViewTileHeader.addButton({image: headerSettingsIcon}, () => document.location.hash = 'settings');//Pages.showSettingsPage());
WebViewTileHeader.addEventListener('BackButtonClicked', () => {
    if(document.location.hash == '' || document.location.hash == '#instruction') {
        Nexpaq.API.Exit();
    } else {
        history.back();
    }
});
document.getElementById('button-snapshot').addEventListener('click', () => createSnapshot());
document.getElementById('snapshot-button-cancel').addEventListener('click', snapshotButtonCancelClickHandler);

document.addEventListener('NexpaqAPIReady', () => {
  Nexpaq.API.Module.SendCommand(Nexpaq.Arguments[0], 'StartSensor', []);
  Nexpaq.API.addEventListener('BeforeExit', () => Nexpaq.API.Module.SendCommand(Nexpaq.Arguments[0], 'StopSensor', []));

  Nexpaq.API.Module.addEventListener('DataReceived', function(event) {
    // we don't care about data not related to our module
    if(event.moduleUuid != Nexpaq.Arguments[0]) return;
    if(event.dataSource != 'SensorValue') return;

    tile.sensorValues.ambientTemperature = parseFloat(event.variables.ambient_temperature);
    tile.sensorValues.objectTemperature = parseFloat(event.variables.object_temperature);
    tile.sensorValues.humidity = parseFloat(event.variables.humidity);
  }); 

});

// function showPage(name) {
//     const pages = Array.from(document.querySelectorAll('.tile-screen'));
//     pages.map(
//         page => page.classList.contains(name) ? page.classList.remove('hidden') : page.classList.add('hidden')
//     );
// }

function snapshotButtonCancelClickHandler() {
  const containerElement = document.getElementById('snapshot-buttons-container');
  const snapshotItemElement = document.getElementById('snapshot-item');

  const animationPromise1 = Utils.runCssAnimationByClass(containerElement, 'animation-slidedown');
  const animationPromise2 = Utils.runCssAnimationByClass(snapshotItemElement, 'animation-disapear');

  Promise.all([animationPromise1, animationPromise2]).then(() => {
    document.location.hash = 'result';
    setTimeout(() => {
      containerElement.classList.remove('animation-slidedown');
      snapshotItemElement.classList.remove('animation-disapear');
    }, 500);
  });
}

function createSnapshot() {
  tile.snapshotValues.measureType = tile.settings.measureType;
  tile.snapshotValues.humidity = tile.sensorValues.humidity;
  if(tile.settings.measureType == MeasureType.Ambient) {
    tile.snapshotValues.temperature = tile.sensorValues.ambientTemperature;
  } else {
    tile.snapshotValues.temperature = tile.sensorValues.objectTemperature;
  }
  tile.snapshotValues.timestamp = moment();
  // tile.snapshotValues.timestamp = moment().add('-1', 'day');
}

function getPlatformValue() {
  let platform;
  if (document.body.classList.contains("platform-android")) {
    platform = "android";
  } else if (document.body.classList.contains("platform-ios")) {
    platform = "ios";
  } else {
    platform = "undefined";
  }
  return platform;
}

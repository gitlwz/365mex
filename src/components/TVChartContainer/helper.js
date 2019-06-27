import { theme, language, Utils } from 'quant-ui';
let { getLanguageData } = language;
export const $ = getLanguageData;
export const currency = Utils.currency;

export function isDark() {
    return theme.getCurrentColor() === "default";
}

export function getLanguageFromURL() {
    const regex = new RegExp('[\\?&]lang=([^&#]*)');
    const results = regex.exec(window.location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
export function getCurrentLanguage() {
    let value = language.getCurrentLanguage().substring(0, 2);
    return value || 'zh';
}
export function getDatafeedUrl() {
    let url = "http://192.168.1.21:9696";
    if (process.env.NODE_ENV !== 'development' && !document.location.host.startsWith("192.168.1.22")) {//非开发环境
        url = document.location.protocol + "//" + document.location.host;
    }
    return url;
}

const CONTEXT_KEY = "tv-context-options";
export function getContextOptions() {
    let options = window.localStorage.getItem(CONTEXT_KEY);
    let result = {};
    if (options) {
        try {
            result = JSON.parse(options);
        } catch (error) {

        }
    }
    return result;
}
export function setContextOptions(value) {
    window.localStorage.setItem(CONTEXT_KEY, JSON.stringify(value))
}

const SAVED_CHART_DATA = "tradingview.savedChartData";
export function getSavedChartData() {
    let options = window.localStorage.getItem(SAVED_CHART_DATA);
    let result = {};
    if (options) {
        try {
            result = JSON.parse(options);
        } catch (error) {

        }
    }
    return result;
}
export function setSavedChartData(value) {
    window.localStorage.setItem(SAVED_CHART_DATA, JSON.stringify(value))
}
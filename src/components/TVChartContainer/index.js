import { connect } from 'dva';
import jstz from 'jstz';
import throttle from "lodash/throttle";
import React, { Component } from 'react'
import { getOrdType } from '@/utils/dictionary';
import { toLowPrice, getCurrencyType } from '@/utils/utils';
import { overridesLight, overridesDark, lightColor, darkColor } from "./constants";
import {
    getCurrentLanguage, getDatafeedUrl, $, currency, isDark,
    getContextOptions, setContextOptions,
    getSavedChartData, setSavedChartData,
} from "./helper";
import { UDFCompatibleDatafeed } from './UDFCompatibleDatafeed/udf-compatible-datafeed';
import "./index.less";

const timezone = jstz.determine().name() || "Asia/Shanghai";
const arr = ['Canceled', 'Rejected', 'Filled'];
const CONTEXT_OPTIONS = getContextOptions();
class TVChartContainer extends Component {
    tvWidget = null;
    tvChartModel = null;
    orderPrice = {};
    positionSymbol = {};
    colorObject = {};
    static defaultProps = {
        symbol: 'XBTUSD',
        interval: '60',
        containerId: 'tv_chart_container',
        datafeedUrl: getDatafeedUrl(),
        libraryPath: '/charting_library/',
        chartsStorageUrl: 'https://saveload.tradingview.com',
        chartsStorageApiVersion: '1.1',
        clientId: '365mex.com',
        userId: 'public_user_id',
        fullscreen: false,
        autosize: true,
        enabled_features: [
            "minimalistic_logo",
            "narrow_chart_enabled",
            "dont_show_boolean_study_arguments",
            "clear_bars_on_series_error",
            "hide_loading_screen_on_series_error",
            "study_templates",
            "use_localstorage_for_settings",
        ],
        disabled_features: [
            "header_symbol_search",
            "edit_buttons_in_legend",
            "header_fullscreen_button",
            "widget_logo",
            "google_analytics",
            "14851",
            "header_saveload",
            "go_to_date",
        ],
        custom: {
            "liquidationMarker.backgroundBuy": "#00FFFF",
            "liquidationMarker.backgroundSell": "#e8704f",
            "liquidationMarker.textColor": "#222",
            "liquidationMarker.borderColor": "#222"
        },
        studiesOverrides: {
            "volume.volume.color.0": "#e8704f",
            "volume.volume.color.1": "#52b370",
            "volume.volume.transparency": 60,
            "volume.volume ma.color": "#4ab0ce",
            "volume.volume ma.transparency": 80,
            "volume.volume ma.linewidth": 5,
            "volume.show ma": false,
            "volume.options.showStudyArguments": false,
            "bollinger bands.median.color": "#33FF88",
            "bollinger bands.upper.linewidth": 7,
            "compare.plot.color": "#8B008B"
        },
    };

    componentDidMount() {
        this.colorObject = isDark() ? darkColor : lightColor;
        const widgetOptions = {
            symbol: this.props.symbol,
            datafeed: new UDFCompatibleDatafeed(this.props.datafeedUrl),
            interval: this.props.interval,
            container_id: this.props.containerId,
            timezone,
            library_path: this.props.libraryPath,
            locale: getCurrentLanguage(),
            enabled_features: this.props.enabled_features,
            disabled_features: this.props.disabled_features,
            charts_storage_url: this.props.chartsStorageUrl,
            charts_storage_api_version: this.props.chartsStorageApiVersion,
            client_id: this.props.clientId,
            user_id: this.props.userId,
            fullscreen: this.props.fullscreen,
            autosize: this.props.autosize,
            favorites: {
                intervals: ["1", "15", "30", "60", "D"]
            },
            toolbar_bg: this.colorObject.toolbarBackground,
            theme: isDark() ? "Dark" : "Light",
            drawings_access: {
                type: "black",
                tools: [{
                    name: "Regression Trend"
                }]
            },
            time_frames: [],
            // time_frames: [
            //     {
            //         "text": "1m",
            //         "resolution": "1"
            //     },
            //     {
            //         "text": "3d",
            //         "resolution": "3d"
            //     },
            //     {
            //         "text": "1d",
            //         "resolution": "1d"
            //     },
            //     {
            //         "text": "6h",
            //         "resolution": "360"
            //     }
            // ],
            custom: this.props.custom,
            studies_overrides: this.props.studiesOverrides,
            overrides: isDark() ? overridesDark : overridesLight,
            saved_data: this.getSavedData(this.props.symbol),
        };
        this.tvWidget = new window.TradingView.widget(widgetOptions);
        this.tvWidget.onChartReady(() => {
            this.tvChart = this.tvWidget.activeChart();
            this.tvWidgetSubscribe();
            this.autoLoad();
            this.tvChartModel = this.tvWidget.activeChart()._chartWidget._model.m_model;
            this.createIndices();
            this.createOrder();
            this.createPosition();
            this.tvWidget.onContextMenu(() => this.onContextMenuCallback(this));
        });
    }
    componentWillReceiveProps = throttle((props) => {
        if (this.tvChart) {
            if (props.orderListData.length > 0) {
                this.createOrder()
            }
            if (props.positionHavaListData.length > 0) {
                this.createPosition()
            }
        }
    }, 1000);
    getSavedData(symbol) {
        var t = getSavedChartData();
        if (!t || !t.charts)
            return null;
        try {
            t.charts[0].panes[0].sources[0].state.symbol = t.charts[0].panes[0].sources[0].state.shortName = symbol;
        } catch (e) {
            console.error("Couldn't set override symbol.", e);
            return null;
        }
        return t;
    }
    tvWidgetSubscribe() {
        this.tvWidget.subscribe("onAutoSaveNeeded", () => {
            this.tvWidget.save(function (e) {
                // console.log(`tvWidgetSubscribe object: ${JSON.stringify(Object.keys(e.charts[0]))}`);
                var t = e.charts[0];
                setSavedChartData({
                    charts: [{
                        panes: t.panes,
                        timeScale: t.timeScale
                    }]
                })
            })
        });
    }
    autoLoad() {
        let savedChartData = this.getSavedData(this.props.symbol);
        if (savedChartData) {
            this.tvWidget.load(savedChartData);
        }
    }
    getReferenceSymbol() {
        let referenceSymbol = "";
        const { instrumentList, symbolCurrent } = this.props;
        let instrumentData = instrumentList.filter(item => item.symbol === symbolCurrent);
        if (instrumentData.length > 0) {
            let currentInstrument = instrumentData[0];
            referenceSymbol = currentInstrument.referenceSymbol;
        }
        return referenceSymbol;
    }
    createIndices() {
        let indicesName = this.getReferenceSymbol();
        if (!indicesName) {
            return;
        }
        if (this.createStudyTemplate(indicesName)) {
            return;
        }
        let properties = this.tvChartModel.m_mainSeries.priceScale().properties();
        let logValue = properties.log._value;
        let perValue = properties.percentage._value;
        this.tvChart.createStudy("Compare", false, false, ["close", indicesName]);
        properties.log.setValue(logValue);
        properties.percentage.setValue(perValue);
    }
    createStudyTemplate(e) {
        let t = false;
        this.tvChart.createStudyTemplate({
            saveInterval: false
        }).panes[0].sources.filter(function (e) {
            return "study_Compare" === e.type
        }).forEach((n) => {
            t || n.state.inputs.symbol !== e ? this.tvChart.removeEntity(n.id) : t = true;
        });
        return t;
    }
    onContextMenuCallback(instance) {
        return [{
            text: CONTEXT_OPTIONS.disableOrders ? "Enable Order Display" : "Disable Order Display",
            position: "top",
            click: function (e) {
                if (CONTEXT_OPTIONS.disableOrders) {
                    CONTEXT_OPTIONS.disableOrders = false;
                    instance.createOrder();
                } else {
                    CONTEXT_OPTIONS.disableOrders = true;
                    instance.removeOrder();
                }
                setContextOptions(CONTEXT_OPTIONS);
            }
        }, {
            text: CONTEXT_OPTIONS.disablePositions ? "Enable Position Display" : "Disable Position Display",
            position: "top",
            click: function (e) {
                if (CONTEXT_OPTIONS.disablePositions) {
                    CONTEXT_OPTIONS.disablePositions = false;
                    instance.createPosition();
                } else {
                    CONTEXT_OPTIONS.disablePositions = true;
                    instance.removePosition();
                }
                setContextOptions(CONTEXT_OPTIONS);
            }
        }, {
            text: "-",
            position: "top"
        }]
    }
    removeOrder() {
        Object.keys(this.orderPrice).forEach((e) => {
            if (this.orderPrice[e]) {
                this.orderPrice[e].remove();
                delete this.orderPrice[e];
            }
        })
    }
    createOrder() {
        if (CONTEXT_OPTIONS.disableOrders) {
            return;
        }
        const { orderListData, symbolCurrent } = this.props;
        let _orderListData = orderListData.filter(item => item.symbol === symbolCurrent);
        for (let value of _orderListData) {
            let ordType = getOrdType(value.ordType);
            let text = '';
            let bigOrSmall = ">=";
            let color = this.colorObject.orderSell;
            if (value.side === "Sell") {
                if ((value.ordType === "StopLimit" || value.ordType === "Stop")) {
                    bigOrSmall = "<=";
                }
                if (value.ordType === "Limit") {
                    text = $(ordType) + ": " + value.price;
                } else {
                    text = $(ordType) + ": " + (value.price || '') + " Trigger " + bigOrSmall + value.stopPx;
                }
            } else {
                color = this.colorObject.orderBuy;
                if ((value.ordType === "MarketIfTouched" || value.ordType === "LimitIfTouched")) {
                    bigOrSmall = "<=";
                }
                if (value.ordType === "Limit") {
                    text = $(ordType) + ": " + value.price;
                } else {
                    text = $(ordType) + ": " + (value.price || '') + " Trigger " + bigOrSmall + value.stopPx;
                }
            }
            if (!this.orderPrice[value.orderID] && arr.indexOf(value.ordStatus) === -1) {//如果没有此订单 添加
                this.orderPrice[value.orderID] = this.createOrderByValue(text, color, (value.price || value.stopPx), value.orderQty)
            } else if (arr.indexOf(value.ordStatus) !== -1) {//如果订单完成
                if (this.orderPrice[value.orderID]) {
                    this.orderPrice[value.orderID].remove();
                    delete this.orderPrice[value.orderID];
                }
            } else {
                this.createOrderByValueSet(text, color, (value.price || value.stopPx), value.orderQty, this.orderPrice[value.orderID])
            }
        }
    }
    createOrderByValue(text, color, price, volume) {
        try {
            return this.tvChart.createOrderLine()
                .setLineLength(65)
                .setExtendLeft(true)
                .setText(text)
                .setQuantity(volume)
                .setPrice(price)
                .setLineColor(color)
                .setBodyBorderColor(color)
                .setBodyTextColor(color)
                .setQuantityBorderColor(color)
                .setQuantityBackgroundColor(color)
        } catch (error) {
            console.log(`createOrderLine failed: ${error}`);
            return null;
        }
    }
    createOrderByValueSet(text, color, price, volume, obj) {
        obj.setText(text)
            .setQuantity(volume)
            .setPrice(price)
            .setLineColor(color)
            .setBodyBorderColor(color)
            .setBodyTextColor(color)
            .setQuantityBorderColor(color)
            .setQuantityBackgroundColor(color)
    }
    removePosition() {
        Object.keys(this.positionSymbol).forEach((e) => {
            if (this.positionSymbol[e]) {
                this.positionSymbol[e].remove();
                delete this.positionSymbol[e];
            }
        })
    }
    createPosition() {
        if (CONTEXT_OPTIONS.disablePositions) {
            return;
        }
        const { positionHavaListData, symbolCurrent } = this.props;
        let _positionHavaListData = positionHavaListData.filter(item => item.symbol === symbolCurrent);
        let calculate = Math.pow(10, getCurrencyType().tick);
        for (let value of _positionHavaListData) {
            let color = this.colorObject.positionSell;
            let text = '▼ ' + currency(parseInt(((value.unrealisedPnl || 0) * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key;
            if (value.unrealisedPnl > 0) {
                color = this.colorObject.positionBuy;
                text = '▲ ' + currency(parseInt(((value.unrealisedPnl || 0) * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key;
            }
            if (this.positionSymbol[value.symbol]) {
                if (value.currentQty === 0) {
                    this.positionSymbol[value.symbol].remove();
                    delete this.positionSymbol[value.symbol];
                    return;
                }
                if (this.positionSymbol[value.symbol]._data.bodyText !== text ||
                    this.positionSymbol[value.symbol]._data.quantityText !== value.currentQty) {
                    this.createPositionByValueSet(text, color, toLowPrice(value.avgEntryPrice), value.currentQty, this.positionSymbol[value.symbol])
                }
            } else {
                if (value.currentQty !== 0 && value.avgEntryPrice) {
                    this.positionSymbol[value.symbol] = this.createPositionByValue(text, color, toLowPrice(value.avgEntryPrice), value.currentQty)
                }
            }
        }
    }
    createPositionByValue(text, color, price, volume) {
        try {
            return this.tvChart.createPositionLine()
                .setPrice(price)
                .setText(text)
                .setQuantity(volume)
                .setExtendLeft(true)
                .setLineLength(80)
                .setLineColor(color)
                .setBodyBorderColor(color)
                .setBodyTextColor(color)
        } catch (error) {
            console.log(`createPositionLine failed: ${error}`);
            return null;
        }
    }
    createPositionByValueSet(text, color, price, volume, obj) {
        obj.setPrice(price)
            .setText(text)
            .setQuantity(volume)
            .setLineColor(color)
            .setBodyBorderColor(color)
            .setBodyTextColor(color)
    }
    componentWillUnmount() {
        if (this.tvWidget) {
            try {
                this.tvWidget.remove();
            } catch (error) {
                this.tvWidget = null;
            }
        }
    }

    render() {
        return (
            <div
                id={this.props.containerId}
                className={'TVChartContainer'}
            />
        );
    }
}
export default connect(({ instrument, orderList, margin }) => {
    const { symbolCurrent, dataSource } = instrument;
    const { currencyType } = margin;
    const { orderListData, positionHavaListData } = orderList;
    return {
        instrumentList: dataSource,
        symbolCurrent,
        orderListData,
        currencyType,
        positionHavaListData,
    }
})(
    TVChartContainer
)

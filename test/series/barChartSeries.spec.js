/**
 * @fileoverview test bar chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BarChartSeries = require('../../src/js/series/barChartSeries'),
    SeriesDataModel = require('../../src/js/dataModels/seriesDataModel'),
    seriesGroup = require('../../src/js/dataModels/seriesGroup'),
    renderUtil = require('../../src/js/helpers/renderUtil');

describe('BarChartSeries', function() {
    var series, dataProcessor, boundsMaker;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(40);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);

        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getSeriesDataModel', 'getFirstItemLabel', 'getFormatFunctions']);
        dataProcessor.getFirstItemLabel.and.returnValue('1');
        dataProcessor.getFormatFunctions.and.returnValue([]);

        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getDimension']);
    });

    beforeEach(function() {
        series = new BarChartSeries({
            chartType: 'bar',
            theme: {
                label: {
                    fontFamily: 'Verdana',
                    fontSize: 11
                }
            },
            options: {},
            dataProcessor: dataProcessor,
            boundsMaker: boundsMaker
        });
    });

    describe('_makeBound()', function() {
        it('baseBound 정보에 startLeft, endLeft, endWidth정보를 더하여 start, end로 구분된 bound 정보를 생성합니다.', function() {
            var width = 40,
                height = 30,
                top = 10,
                startLeft = 10,
                endLeft = 10,
                actual = series._makeBound(width, height, top, startLeft, endLeft),
                expected = {
                    start: {
                        left: 10,
                        top: 10,
                        width: 0,
                        height: 30
                    },
                    end: {
                        left: 10,
                        top: 10,
                        width: 40,
                        height: 30
                    }
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateAdditionalLeft()', function() {
        it('divided 옵션이 있고 value가 0보다 크면 additional yAxis 너비와 OVERLAPPING_WIDTH를 더하여 반환합니다.', function() {
            var value = 10,
                actual, expected;

            boundsMaker.getDimension.and.returnValue({
                width: 50
            });
            series.options.divided = true;
            actual = series._calculateAdditionalLeft(value);
            expected = 51;

            expect(actual).toEqual(expected);
        });

        it('divided 옵션이 없으면 0을 반환합니다.', function() {
            var value = 10,
                actual, expected;

            actual = series._calculateAdditionalLeft(value);
            expected = 0;

            expect(actual).toEqual(expected);
        });

        it('divided 옵션이 있어도 value가 0보다 작으면 0을 반환합니다.', function() {
            var value = -10,
                actual, expected;

            series.options.divided = true;
            actual = series._calculateAdditionalLeft(value);
            expected = 0;

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeBarChartBound()', function() {
        it('옵션 없는 바 차트의 bound 정보를 생성합니다.', function() {
            var baseData = {
                    baseBarSize: 100,
                    basePosition: 10,
                    barSize: 20,
                    step: 20,
                    additionalPosition: 0
                },
                iterationData = {
                    baseTop: 10,
                    top: 0,
                    plusLeft: 0
                },
                isStacked = false,
                seriesItem = {
                    value: 10,
                    startRatio: 0,
                    ratioDistance: 0.4
                },
                index = 0,
                actual = series._makeBarChartBound(baseData, iterationData, isStacked, seriesItem, index),
                expected = {
                    start: {
                        top: 10,
                        left: 20,
                        width: 0,
                        height: 20
                    },
                    end: {
                        top: 10,
                        left: 20,
                        width: 40,
                        height: 20
                    }
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeBounds()', function() {
        it('옵션 없는 바 차트의 bounds 정보를 생성합니다.', function() {
            var seriesDataModel, actual, expected;

            seriesDataModel = new SeriesDataModel();
            dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
            seriesDataModel.groups = [
                new seriesGroup([{
                    value: 40,
                    startRatio: 0,
                    ratioDistance: 0.4
                }, {
                    value: 60,
                    startRatio: 0,
                    ratioDistance: 0.6
                }])
            ];
            boundsMaker.getDimension.and.returnValue({
                width: 100,
                height: 100
            });
            spyOn(series, '_makeBaseDataForMakingBound').and.returnValue({
                groupSize: 25,
                firstAdditionalPosition: 0,
                baseBarSize: 100,
                basePosition: 10,
                barSize: 20,
                step: 20,
                additionalPosition: 0
            });

            actual = series._makeBounds();
            expected = [[
                {
                    start: {
                        top: 10,
                        left: 20,
                        width: 0,
                        height: 20
                    },
                    end: {
                        top: 10,
                        left: 20,
                        width: 40,
                        height: 20
                    }
                }, {
                    start: {
                        top: 30,
                        left: 20,
                        width: 0,
                        height: 20
                    },
                    end: {
                        top: 30,
                        left: 20,
                        width: 60,
                        height: 20
                    }
                }
            ]];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeSeriesRenderingPosition()', function() {
        it('value가 양수일 경우의 series label의 렌더링 포지션을 구합니다.', function() {
            var bound = {
                    left: 50,
                    top: 10,
                    width: 40,
                    height: 20
                },
                labelHeight = 20,
                value = 10,
                label = '10',
                actual = series._makeSeriesRenderingPosition(bound, labelHeight, value, label),
                expected = {
                    left: 95,
                    top: 11
                };
            expect(actual).toEqual(expected);
        });

        it('value가 양수이면서 start일 경우의 series label의 렌더링 포지션을 구합니다.', function() {
            var bound = {
                    left: 50,
                    top: 10,
                    width: 40,
                    height: 20
                },
                labelHeight = 20,
                value = 10,
                label = '10',
                isStart = true,
                actual = series._makeSeriesRenderingPosition(bound, labelHeight, value, label, isStart),
                expected = {
                    left: 5,
                    top: 11
                };
            expect(actual).toEqual(expected);
        });

        it('value가 음수일 경우의 series label 렌더링 포지션을 구합니다.', function() {
            var bound = {
                    left: 50,
                    top: 10,
                    width: 40,
                    height: 20
                },
                labelHeight = 20,
                value = -10,
                label = '-10',
                actual = series._makeSeriesRenderingPosition(bound, labelHeight, value, label),
                expected = {
                    left: 5,
                    top: 11
                };
            expect(actual).toEqual(expected);
        });

        it('value가 음수이면서 start일 경우의 series label 렌더링 포지션을 구합니다.', function() {
            var bound = {
                    left: 50,
                    top: 10,
                    width: 40,
                    height: 20
                },
                labelHeight = 20,
                value = -10,
                label = '-10',
                isStart = true,
                actual = series._makeSeriesRenderingPosition(bound, labelHeight, value, label, isStart),
                expected = {
                    left: 95,
                    top: 11
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateTopPositionOfSumLabel()', function() {
        it('합계 레이블의 top position값을 계산합니다.', function() {
            var actual = series._calculateTopPositionOfSumLabel({
                    top: 10,
                    height: 30
                }, 20),
                expected = 16;
            expect(actual).toBe(expected);
        });
    });

    describe('_makePlusSumLabelHtml()', function() {
        it('양수합계 레이블 html을 생성합니다.', function() {
            var values = [10, 20, 30],
                bound = {
                    left: 10,
                    top: 10,
                    width: 40,
                    height: 20
                },
                labelHeight = 20,
                actual = series._makePlusSumLabelHtml(values, bound, labelHeight),
                expected = '<div class="tui-chart-series-label" style="left:55px;top:11px;font-family:Verdana;font-size:11px">60</div>';
            expect(actual).toBe(expected);
        });
    });

    describe('_makeMinusSumLabelHtml()', function() {
        it('음수합계 레이블 html을 생성합니다.', function() {
            var values = [-10, -20, -30],
                bound = {
                    left: 80,
                    top: 10,
                    width: 40,
                    height: 20
                },
                labelHeight = 20,
                actual = series._makeMinusSumLabelHtml(values, bound, labelHeight),
                expected = '<div class="tui-chart-series-label" style="left:35px;top:11px;font-family:Verdana;font-size:11px">-60</div>';
            expect(actual).toBe(expected);
        });
    });
});
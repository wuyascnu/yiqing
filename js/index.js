/** 实时显示时间 */
function showTime() {
    var time = new Date();
    var year = time.getFullYear();
    var month = (time.getMonth() + 1 + '').padStart(2, '0'); /**es6的方法 */
    var day = (time.getDate() + '').padStart(2, '0');
    var hour = (time.getHours() + '').padStart(2, '0');
    var minute = (time.getMinutes() + '').padStart(2, '0');
    var second = (time.getSeconds() + '').padStart(2, '0');

    var content = `${year}年${month}月${day}日 ${hour}:${minute}:${second}`;
    $('#title .time').text(content);
}

showTime();
setInterval(showTime, 1000);

/**向腾讯发送请求获取数据 
 * 疑惑：怎么看出是jsonp请求
 */
// var data;
/*function getData() {
    $.ajax({
        url: 'https://view.inews.qq.com/g2/getOnsInfo?name=disease_h5',
        data: {
            name: 'disease_h5'
        },
        dataType: 'jsonp',
        success: function (res) {
            var data = JSON.parse(res.data);
            center1(data);
            //center2(data);
            //right1(data);
            //right2(data);
            // console.log($('#center2')[0]);//拿到dom对象
        }
    });

    $.ajax({
        type: 'post',
        url: 'https://api.inews.qq.com/newsqa/v1/query/inner/publish/modules/list',
        data: {
            modules: 'chinaDayList,chinaDayAddList,nowConfirmStatis,provinceCompare'
        },
        dataType: 'json', //在chromeDevTool看请求是在XHR(普通ajax请求json)还是js（跨域jsop）
        success: function (res) {
            var data = res.data;
            left1(data);
            left2(data);
            console.log(data);
        }
    })
}
*/

function getData() {
    $.ajax({
        url: 'https://tiezheng.natapp4.cc/api/borrow/stats',
        method: 'GET',
        dataType: 'json', // 注意：改为 json，不是 jsonp
        success: function (data) {
            // 这里的数据已经是 JSON，不需要再 JSON.parse
            center1(data);
            //right1(data);
            //right2(data);
        },
        error: function (xhr, status, error) {
            console.error("数据请求失败：", error);
        }
    });
    center2();
    // 调用 center3 函数
    center3();
    right1();
    right2(); // 调用渲染逾期跑马灯
}

getData();
setInterval(getData, 5 * 60 * 1000); //每5分钟发送一次请求刷新数据

function center1(dataArray) {
    const map = {};

    // 把数组转换为 key-value 映射
    dataArray.forEach(item => {
        map[item.statisticscode] = item.statisticsValue;
    });

    $('#confirm').text(map["Borrow-Today"] ?? 0);
    $('#heal').text(map["Borrow-Month"] ?? 0);
    $('#dead').text(map["Restored-Today"] ?? 0);
    $('#nowConfirm').text(map["Borrow-All"] ?? 0);
    $('#noInfect').text(map["ReaderCount"] ?? 0);

    const avgBorrow = parseFloat(map["Borrow-ReaderAVG"] ?? 0);
    $('#overseasImport').text(avgBorrow.toFixed(2));
}

// 全局存储 chart 实例
function center2() {
    var trendChart = echarts.init(document.getElementById('trendChart'));
    var trendOption = {
        title: {
            text: '借阅热点时间段（近10天平均数）',
            left: 'center',
            top: '2%',
            textStyle: {
                color: '#FFFFFF',
                fontSize: 16
            }
        },
        tooltip: { trigger: 'axis' },
        legend: {
            data: ['借书', '还书'],
            top: '10%',
            textStyle: { color: '#FFFFFF' }
        },
        grid: {
            top: '20%',
            left: '10%',
            right: '10%',
            bottom: '10%'
        },
        xAxis: {
            type: 'category',
            data: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
            axisLabel: {
                interval: 0,
                rotate: 0,
                color: '#FFFFFF'
            },
            axisLine: { lineStyle: { color: '#AAAAAA' } }
        },
        yAxis: {
            type: 'value',
            max: 4, // 原0.4（小数）改为整数，值放大10倍
            axisLabel: { color: '#FFFFFF' },
            axisLine: { lineStyle: { color: '#AAAAAA' } },
            splitLine: { lineStyle: { color: '#555555' } }
        },
        series: [
            {
                name: '借书',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 2.5], // 显示为整数，可改为 [0,0,0,0,0,0,0,0,1,2,3,2]
                type: 'line',
                areaStyle: {},
                color: '#F6A623',
                label: {
                    show: true,
                    position: 'top',
                    color: '#FFFFFF',
                    formatter: function (params) {
                        return Number.isInteger(params.value) ? params.value : params.value.toFixed(1);
                    }
                }
            },
            {
                name: '还书',
                data: [1, 1, 1, 1.2, 1, 0.8, 0.5, 0.3, 0, 0, 0, 0],
                type: 'line',
                areaStyle: {},
                color: '#2F9D41',
                label: {
                    show: true,
                    position: 'top',
                    color: '#FFFFFF',
                    formatter: function (params) {
                        return Number.isInteger(params.value) ? params.value : params.value.toFixed(1);
                    }
                }
            }
        ]
    };
    trendChart.setOption(trendOption);
}

function center3() {
    // 读者借阅人数占比环形图
    var readerBorrowChart = echarts.init(document.getElementById('readerBorrowChart'));
    var readerBorrowOption = {
        series: [
            {
                type: 'pie',
                radius: ['50%', '70%'], 
                color: ['#d9e3f0', '#87e8de'],
                data: [
                    { value: 99.33, name: '' },
                    { value: 0.67, name: '' }
                ],
                label: {
                    show: true,
                    position: 'center',
                    formatter: '0.67%',
                    fontSize: 14, 
                    color: '#fff', 
                    fontWeight: 'normal' 
                }
            }
        ]
    };
    readerBorrowChart.setOption(readerBorrowOption);

    // 五大部类馆藏占比饼图
    var collectionChart = echarts.init(document.getElementById('collectionChart'));
    var collectionOption = {
        series: [
            {
                type: 'pie',
                radius: ['30%', '50%'], 
                data: [
                    { value: 1.99, name: '马、列、毛、邓', itemStyle: { color: '#69c0ff' } },
                    { value: 6.83, name: '哲学', itemStyle: { color: '#ffb64d' } },
                    { value: 55.26, name: '社会科学', itemStyle: { color: '#ff7dbb' } },
                    { value: 34.33, name: '自然科学', itemStyle: { color: '#87e8de' } },
                    { value: 1.58, name: '综合性图书', itemStyle: { color: '#ff6b6b' } }
                ],
                label: {
                    show: false
                }
            }
        ]
    };
    collectionChart.setOption(collectionOption);

    // 图书流通率半环形图
    var circulationChart = echarts.init(document.getElementById('circulationChart'));
    var circulationOption = {
        series: [
            {
                type: 'gauge',
                startAngle: 180,
                endAngle: 0,
                radius: '70%', 
                axisLine: {
                    lineStyle: {
                        width: 10,
                        color: [[0.2979, '#ffb64d'], [1, '#d9d9d9']]
                    }
                },
                pointer: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                detail: {
                    show: true,
                    formatter: '29.79%',
                    fontSize: 14, 
                    color: '#fff', 
                    fontWeight: 'normal', 
                    offsetCenter: [0, '0%']
                }
            }
        ]
    };
    circulationChart.setOption(circulationOption);
}


function right1() {
    
}

/*
function right2(data) {
    var myChart = echarts.init($('#right2')[0], 'dark');

    var option = {
        title: {
            text: '境外输入省市TOP5',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: [] // ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
        },
        series: [{
            name: '省市名称',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            // data: [
            //     {value: 335, name: '直接访问'},
            //     {value: 310, name: '邮件营销'},
            //     {value: 234, name: '联盟广告'},
            //     {value: 135, name: '视频广告'},
            //     {value: 1548, name: '搜索引擎'}
            // ],
            data: [],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };

    var provinces = data.areaTree[0].children;
    var topData5 = []; //数据临时存储
    for (var province of provinces) {
        for (var item of province.children) {
            if (item.name === '境外输入') {
                topData5.push({
                    'name': province.name,
                    'value': item.total.confirm
                });
                break;
            }
        }
    }
    //降序排序
    topData5.sort(function (a, b) {
        return b.value - a.value;
    });
    //只保留前5
    topData5.length = 5;
    console.log(topData5);
    //分别取出省份名称和对应数值
    for (var province of topData5) {
        option.legend.data.push(province.name);
        option.series[0].data.push(province); //这里的data是json字符串
    }

    myChart.setOption(option);
}
*/

function right2() {
    // 模拟借书逾期静态数据
    const overdueData = [
        { department: '初一6班', name: '梁鸿森', bookTitle: '半小时漫画...', borrowDate: '2025-06-03', returnDate: '2025-08-02', status: '未还' },
        { department: '初一1班', name: '李语欣', bookTitle: '你只是看起来...', borrowDate: '2025-05-28', returnDate: '2025-07-27', status: '未还' },
        { department: '初一6班', name: '孙文昊', bookTitle: '亚洲惊天大...', borrowDate: '2025-05-26', returnDate: '2025-07-25', status: '未还' },
        { department: '初一6班', name: '孙文昊', bookTitle: '亚洲惊天大...', borrowDate: '2025-05-26', returnDate: '2025-07-25', status: '未还' },
        { department: '初一6班', name: '孙文昊', bookTitle: '突出重围', borrowDate: '2025-05-26', returnDate: '2025-07-25', status: '未还' },
        { department: '初一3班', name: '徐玮键', bookTitle: '如果历史是...', borrowDate: '2025-05-22', returnDate: '2025-07-21', status: '未还' },
        { department: '初一3班', name: '徐玮键', bookTitle: '半小时漫画...', borrowDate: '2025-05-22', returnDate: '2025-07-21', status: '未还' },
        { department: '初一2班', name: '杜誉骞', bookTitle: '藏在故宫里...', borrowDate: '2025-05-15', returnDate: '2025-07-14', status: '未还' },
        { department: '初一6班', name: '唐均濠', bookTitle: '趣味物理学', borrowDate: '2025-05-14', returnDate: '2025-07-13', status: '未还' },
        { department: '初一2班', name: '杜誉骞', bookTitle: '马克思主义...', borrowDate: '2025-05-12', returnDate: '2025-07-11', status: '未还' },
        { department: '初一3班', name: '张玮深', bookTitle: '半小时漫画...', borrowDate: '2025-06-09', returnDate: '2025-07-09', status: '未还' },
        { department: '初一3班', name: '张玮深', bookTitle: '近战机密 枪械', borrowDate: '2025-06-09', returnDate: '2025-07-09', status: '未还' },
        { department: '初一3班', name: '徐浩轩', bookTitle: '文城', borrowDate: '2025-05-09', returnDate: '2025-07-08', status: '未还' },
        { department: '初一6班', name: '梁鸿森', bookTitle: '半小时漫画...', borrowDate: '2025-06-03', returnDate: '2025-07-03', status: '未还' },
        { department: '德育处', name: '伍诗婷', bookTitle: '杀死一只知...', borrowDate: '2025-04-03', returnDate: '2025-07-02', status: '未还' }
    ];

    const marqueeList = document.getElementById('marqueeList');
    let html = '';
    
    // 填充数据行
    overdueData.forEach((item, index) => {
        html += `
            <tr>
                <td>${item.department}</td>
                <td>${item.name}</td>
                <td>${item.bookTitle}</td>
                <td>${item.borrowDate}</td>
                <td>${item.returnDate}</td>
                <td>${item.status}</td>
            </tr>
        `;
    });
    
    marqueeList.innerHTML = html;
}


function left1(data) {
    var myChart = echarts.init($('#left1')[0], 'dark');

    var option = {
        title: {
            text: "全国累计趋势",
            textStyle: {
                color: 'white',
            },
            left: 'left',
        },
        tooltip: {
            trigger: 'axis',
            //指示器
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: '#7171C6'
                }
            },
        },
        //图例
        legend: {
            data: ['累计确诊', "累计治愈", "累计死亡"],
            left: "right"
        },
        //图形位置
        grid: {
            left: '4%',
            right: '6%',
            bottom: '4%',
            top: 50,
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            data: [], //['03.20', '03.21', '03.22']
        }],
        yAxis: [{
            type: 'value',
            //y轴字体设置
            axisLabel: {
                show: true,
                color: 'white',
                fontSize: 12,
                formatter: function(value) {
                    if (value >= 1000) {
                        value = value / 1000 + 'k';
                    }
                    return value;
                }
            },
            //y轴线设置显示
            axisLine: {
                show: true
            },
            //与x轴平行的线样式
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#17273B',
                    width: 1,
                    type: 'solid',
                }
            }
        }],
        series: [{
            name: "累计确诊",
            type: 'line',
            smooth: true,
            data: []//[260, 406, 529]
        }, {
            name: "累计治愈",
            type: 'line',
            smooth: true,
            data: []//[25, 25, 25]
        }, {
            name: "累计死亡",
            type: 'line',
            smooth: true,
            data: []//[6, 9, 17]
        }]
    };

    var chinaDayList = data.chinaDayList;
    for(var day of chinaDayList){
        option.xAxis[0].data.push(day.date);
        option.series[0].data.push(day.confirm);
        option.series[1].data.push(day.heal);
        option.series[2].data.push(day.dead);
    }

    myChart.setOption(option);
}

function left2(data) {
    var myChart = echarts.init($('#left2')[0], 'dark');

    var option = {
        title: {
            text: '全国新增趋势',
            textStyle: {
                color: 'white',
            },
            left: 'left',
        },
        tooltip: {
            trigger: 'axis',
            //指示器
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: '#7171C6'
                }
            },
        },
        //图例
        legend: {
            data: ['新增确诊', '新增疑似', '新增境外输入'],
            left: 'right'
        },
        //图形位置
        grid: {
            left: '4%',
            right: '6%',
            bottom: '4%',
            top: 50,
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            data: [] // ['03.20', '03.21', '03.22']
        }],
        yAxis: [{
            type: 'value',
            //y轴字体设置
            axisLabel: {
                show: true,
                color: 'white',
                fontSize: 12,
                formatter: function(value) {
                    if (value >= 1000) {
                        value = value / 1000 + 'k';
                    }
                    return value;
                }
            },
            //y轴线设置显示
            axisLine: {
                show: true
            },
            //与x轴平行的线样式
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#17273B',
                    width: 1,
                    type: 'solid',
                }
            }
        }],
        series: [{
            name: '新增确诊',
            type: 'line',
            smooth: true,
            data: [] // [20, 406, 529]
        }, {
            name: '新增疑似',
            type: 'line',
            smooth: true,
            data: [] // [25, 75, 122]
        }, {
            name: '新增境外输入',
            type: 'line',
            smooth: true,
            data: [] // [25, 75, 122]
        }]
    };

    var chinaDayAddList = data.chinaDayAddList;
    for(var dayAddList of chinaDayAddList){
        option.xAxis[0].data.push(dayAddList.date);
        option.series[0].data.push(dayAddList.confirm);
        option.series[1].data.push(dayAddList.suspect);
        option.series[2].data.push(dayAddList.importedCase);
    }

    myChart.setOption(option);
}
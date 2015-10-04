/**
 * Created by bialy on 9/28/15.
 */



function show() {
    var a = document.getElementById("custom");
    var b = document.getElementById("custom-icon").style.backgroundImage;
    a.style.display == "none" ? a.style.display = "" : a.style.display = "none";
}

function getUrlParam(name) {
    //构造一个含有目标参数的正则表达式对象
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    //匹配目标参数
    var r = window.location.search.substr(1).match(reg);
    //返回参数值
    if (r != null) return unescape(r[2]);
    return null;
}

$("#generate_url_text").val("<iframe>" + window.location + "</iframe>");

var svg;
var svg2;

var lifespan;
var features;
var w = 1000;
var w2 = 400;
var h = 1000;
var h2 = 1000;

var padding = 150;
var selectcolor;
var selectmapcolor;
var selectpiecolor;
var fontresult;

var dataset;
var dataset2;
//var nameresult = decodeURI(decodeURI(getUrlParam('nameresult')));
//var nameresult = decodeURI(decodeURI(getUrlParam('竺可桢')));
var nameresult = '竺可桢';
//var result1 = getUrlParam('result1');
var result1 = 1890;
//var result2 = getUrlParam('result2');
var result2 = 1974;
//var file_name = getUrlParam('file_name');
var file_name = "event";
//var file2_name = getUrlParam('file2_name');
var file2_name = "work";

var eventcategory = [];
var eventcategorycount = [];

var centroid;
var centroid2;

var angle;
var monthangle;

var wx = [];
var wy = [];

var worklist = [];

//每个省份对应一个事件总数值
var locationcount = [];

var innerRadius = w / 2 - padding - 50;
var invertinnerRadius = -w / 2 + padding + 60;

var outerRadius = w / 2 - padding;
var interval = 30;

var xposition = [];
var yposition = [];

var color = d3.scale.category20();

var projection = d3.geo.mercator()
    .center([107, 38])
    .scale(4400)
    .translate([w / 2, h / 2]);
var path = d3.geo.path().projection(projection);
var rScale = d3.scale.linear().range([0, 15]);

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip").
    style("opacity", 0.0);

function init() {
    console.log(file_name);
    if (selectcolor == undefined)
        selectcolor = "#4682B4";
    if (selectmapcolor == undefined)
        selectmapcolor = "#4682B4";
    if (selectpiecolor == undefined)
        selectpiecolor = "#2a6799";
    if (fontresult == undefined)
        fontresult = "chitext-1";

    d3.csv("../data/" + file_name + ".csv", function (data) {
        //upload 时间表
        data.forEach(function (d) {
            //先对用户上传的表格进行处理
            if (d.month == "") {
                d.month = "6";
                d.lack = "Y";
            }
            else
                d.lack = "N";

            var yearstring = d.year;
            if (yearstring.indexOf("~") >= 0) {
                var yearset = yearstring.split("~");
                d.year = yearset[0];
                d.year2 = yearset[1];
                d.duration = "Y";
            }
            else {
                d.year2 = "";
                d.duration = "N";
            }
            if (eventcategory.indexOf(d.category) < 0)
                eventcategory.push(d.category);
        });

        for (var i = 0; i < eventcategory.length; i++) {
            eventcategorycount.push(0);
        }

        data.forEach(function (d) {
            for (var i = 0; i < eventcategory.length; i++) {
                if (d.category == eventcategory[i])
                    eventcategorycount[i]++;
            }
        });

        if (svg != undefined) {
            svg.remove();
        }

        if (svg2 != undefined) {
            svg2.remove();
        }

        svg = d3.select("#right")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        //work一栏
        svg2 = d3.select("#right2")
            .append("svg")
            .attr("width", w2)
            .attr("height", h2);

        var zoom = d3.behavior.zoom()
            .scaleExtent([1, 5])
            .on("zoom", zoomed);
        //features g分组 里面的内容都可以缩放
        features = svg.append("g")
            .attr("width", w)
            .attr("height", h)
            .call(zoom);

        function zoomed() {
            features
                .attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        dataset = data;

        drawTimeline();

        drawMap();

        console.log("out of drawMap");

        d3.csv("../data/" + file2_name + ".csv", function (data) {

            console.log(file2_name);
            console.log(data);
            dataset2 = data;
            drawWork();
            drawPie();
        });
    });
}
init();

var drawTimeline = function () {
    //month
    lifespan = result2 - result1 + 1;

    angle = 1.9 * Math.PI / lifespan;
    monthangle = 1.9 * Math.PI / lifespan / 12;

    for (var j = 0; j < eventcategory.length; j++) {
        for (var i = 0; i < lifespan * 12; i++) {
            for (var i = 0; i < lifespan * 12; i++) {
                var arc = d3.svg.arc()
                    .innerRadius(outerRadius + j * interval)
                    .outerRadius(outerRadius + (j + 1) * interval)
                    .startAngle(i * monthangle)
                    .endAngle((i + 1) * monthangle);

                var arcs = features.datum(i).append("g")
                    .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

                arcs.append("path")
                    .attr("fill", function (d, i) {

                        if (parseInt(d / 12) % 2 == 0)
                            return d3.rgb(selectcolor).darker(1);
                        else
                            return d3.rgb(selectcolor).brighter(1);
                    })
                    .attr("opacity", "0.3")
                    .attr("stroke", "white")
                    .attr("stroke-width", "1")
                    .attr("stroke-width", "1")
                    .attr("d", arc())
                    .on("mouseover", function (i) {
                        d3.select(this).attr("fill", "#FFB90F");

                        var month = i % 12 + 1;
                        var year = parseInt(i / 12) + parseInt(result1);

                        svg.append("text")
                            .attr("id", "label")
                            .attr("class", fontresult)
                            .attr("x", w * 0.1)
                            .attr("y", h * 0.15)
                            .attr("text-font", "20px")
                            .text(year.toString() + "年·" + month + "月");
                    })
                    .on("mouseout", function () {
                        d3.select(this).attr("fill", function (d, i) {

                            if (parseInt(d / 12) % 2 == 0)
                                return d3.rgb(selectcolor).darker(1);
                            else
                                return d3.rgb(selectcolor).brighter(1);

                        }).attr("opacity", "0.3");
                        d3.select("#label").remove();
                    });
            }
            if (eventcategory.length != 1)
                features.append("text").style("font-size", "17px").attr("class", fontresult).text(eventcategory[j])
                    .attr("x", w / 2 - 40).attr("y", h / 2 - outerRadius - 5 - interval * j);
        }
        //year
        for (var i = 0; i < lifespan; i++) {
            //arc路径生成器
            var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius).startAngle(i * angle).endAngle((i + 1) * angle);
            xposition.push(arc.centroid()[0]);
            yposition.push(arc.centroid()[1]);
            var yearid = i + parseInt(result1);
            var arcs = features.datum(i).append("g")
                .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");
            // arcs 选择了一个分组g的选择集
            //svg中的path : 路径属性d
            arcs.append("path")
                .attr("d", arc())
                .attr("fill", selectcolor)
                .attr("stroke", "white")
                .attr("stroke-width", "1")
                .on("mouseover", function (i) {
                    d3.select(this).attr("fill", "#FFB90F");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("fill", selectcolor);
                });

            features.append("text")
                .attr("class", "engtext")
                .style("font-size", "12px")
                .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
                .attr("x", xposition[i])
                .attr("y", yposition[i])
                .text(yearid.toString());
        }

    }

};

var drawWork = function () {
    //根据dataset2 work表格计算每个年份的作品数
    var workcount = [];

    for (var i = result1; i <= result2; i++) {
        workcount.push(0);
        worklist[i - result1] = new Array();
    }

    for (var i = result1; i <= result2; i++) {
        for (var j = 0; j < dataset2.length; j++) {
            if (parseInt(dataset2[j].year) == i) {
                workcount[i - result1]++;
                worklist[i - result1].push(dataset2[j].workname);
            }
        }
    }
    //arc
    lifespan = result2 - result1 + 1;
    angle = 1.9 * Math.PI / lifespan;

    for (var i = 0; i < lifespan; i++) {
        wx.push(w / 2 + (innerRadius + 30) * Math.cos(-Math.PI / 2 + angle * (i + 0.5)));
        wy.push(h / 2 + (innerRadius + 30) * Math.sin(-Math.PI / 2 + angle * (i + 0.5)));
    }

    for (var i = 0; i < lifespan; i++) {
        var heightscale = d3.scale.linear()
                .domain([0, d3.max(workcount)])
                .range([0, 2 * interval]);
        var barheight = heightscale(workcount[i]);

        var workarc = d3.svg.arc()
                .innerRadius(outerRadius + interval * eventcategory.length + 10)
                .outerRadius(outerRadius + interval * eventcategory.length + barheight + 10)
                .startAngle(i * angle)
                .endAngle((i + 1) * angle);

        var workarcs = features.datum(i).append("g")
                .attr("id", "workarc")
                .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

        //作品直方图
        workarcs.append("path")
            .attr("d", workarc())
            .attr("fill", d3.rgb(selectcolor).darker(1))
            .attr("stroke", "white")
            .attr("stroke-width", "1")
            .style("cursor", "pointer")
            .on("mouseover", function () {
                d3.select(this).attr("fill", "#FFB90F");
                //workcount
            })
            .on("mouseout", function () {
                d3.select(this).attr("fill", d3.rgb(selectcolor).darker(1));
            })
            .on("click", function (d) {
                var str = "";
                console.log("1");
                if (worklist[d].length > 0) {
                    for (var i = 0; i < worklist[d].length; i++) {
                        str = str + "《" + worklist[d][i] + "》" + "</br>";
                    }
                }
                d3.select(this).attr("fill", "#FFB90F");
                tooltip.html(parseInt(d) + parseInt(result1) + "年" + "</br>" + str)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px")
                    .style("opacity", 1.0);
            });
    }
};

//pie of work //dataset2 work.csv
var drawPie = function () {
    var workcategory = new Array();
    var publication = new Array();

    dataset2.forEach(function (d) {
        if (publication.indexOf(d.publication) < 0)
            publication.push(d.publication);
        if (workcategory.indexOf(d.category) < 0)
            workcategory.push(d.category);
    });
    //初始化
    var categorycount = new Array();
    for (var i = 0; i < workcategory.length; i++) {
        categorycount[i] = new Array();
        for (var j = 0; j < 2; j++) {
            categorycount[i][j] = "";
        }
        categorycount[i][2] = new Array();
    }

    for (var i = 0; i < workcategory.length; i++) {
        categorycount[i][0] = workcategory[i];
        categorycount[i][1] = 0;
    }

    var publicationcount = new Array();
    for (var i = 0; i < publication.length; i++) {
        publicationcount[i] = new Array();
        for (var j = 0; j < 2; j++) {
            publicationcount[i][j] = "";
        }
        publicationcount[i][2] = new Array();
    }

    for (var i = 0; i < publication.length; i++) {
        publicationcount[i][0] = publication[i];
        publicationcount[i][1] = 0;
    }

    dataset2.forEach(function (d) {
        for (var i = 0; i < publication.length; i++) {
            if (publication[i] == d.publication) {
                publicationcount[i][1]++;
                publicationcount[i][2].push(d.workname);
            }
            if (workcategory[i] == d.category) {
                categorycount[i][1]++;
                categorycount[i][2].push(d.workname);
            }
        }
    });

    if (publication.length > 5) {
        publicationcount.sort(function (a, b) {

            a = parseInt(a[1]);
            b = parseInt(b[1]);

            if (a > b) {
                return -1;
            } else if (a == b) {
                return 0;
            } else {
                return 1;
            }
        });

        var publicationcount2 = publicationcount.slice(0, 5);
    }

    console.log(publicationcount2);
    console.log(categorycount);

    var piedata = [];
    var piedata2 = [];
    for (var i = 0; i < publicationcount2.length; i++) {
        piedata.push(publicationcount2[i][1]);
    }
    for (var i = 0; i < categorycount.length; i++) {
        piedata2.push(categorycount[i][1]);
    }

    var pie = d3.layout.pie();
    var winnerRadius = 0;
    var wouterRadius = 100;
    var wpadding = 100;
    var warc = d3.svg.arc().innerRadius(winnerRadius).outerRadius(wouterRadius);
    var warc2 = d3.svg.arc().innerRadius(winnerRadius).outerRadius(wouterRadius + 8);

    var parcs = svg2.append("g").attr("id", "publicationpie").selectAll("g")
        .data(pie(piedata))
        .enter()
        .append("g")
        .attr("transform", "translate(" + w2 / 2 + "," + (wouterRadius + wpadding) + ")");

    var warcs = svg2.append("g").attr("id", "workcategorypie").selectAll("g")
        .data(pie(piedata2))
        .enter()
        .append("g")
        .attr("transform", "translate(" + w2 / 2 + "," + (wouterRadius + wpadding + 2 * wouterRadius + 50) + ")");


    svg2.append("text")
        .text("登载杂志↓")
        .attr("class", "engtext")
        .style("font-size", "18px")
        .attr("class", fontresult)
        .attr("x", w2 / 2).attr("y", 80);

    svg2.append("text")
        .text("类别领域↓")
        .attr("class", "engtext")
        .style("font-size", "18px")
        .attr("class", fontresult)
        .attr("x", w2 / 2)
        .attr("y", 2 * wouterRadius + wpadding + 30);

    //publication
    parcs.append("path")
        .attr("fill", function (d, i) {
            return d3.rgb(selectpiecolor).brighter(i + 1);
        })
        .attr("d", function (d) {
            return warc2(d);
        })
        .attr("stroke-width", "0px");

    parcs.append("path")
        .attr("fill", function (d, i) {
            return d3.rgb(selectpiecolor)
                    .brighter(i);
        })
        .attr("d", function (d) {
            return warc(d);
        })
        .attr("stroke-width", "0px")
        .style("cursor", "pointer")
        .on("mouseover", function () {
            d3.select(this)
                .attr("stroke", "yellow")
                .attr("stroke-width", "3px");
        }).on("mouseout", function () {
            d3.select(this)
                .attr("stroke-width", "0px");
        })
        //书签 publication的list
        .on("click", function (d, i) {
            if ("#clistofwork" != undefined)
                svg2.select("#clistofwork")
                    .remove();

            if ("#plistofwork" != undefined)
                svg2.select("#plistofwork")
                    .remove();

            var plist = svg2.append("g")
                    .attr("id", "plistofwork");

            for (var j = 0; j < d3.min([12, publicationcount2[i][2].length]); j++) {
                plist.append("text")
                    .attr("class", fontresult)
                    .text("《" + publicationcount2[i][2][j] + "》")
                    .attr("x", 200)
                    .attr("y", 680 + j * 25)
                    .style("font-size", "13px");
            }
        });

    parcs.append("text")
        .attr("class", fontresult)
        .attr("font-size", "14px")
        .attr("fill", "white")
        .style("text-shadow", "2px 2px 2px rgba(0, 0, 0, 0.5)")
        .text(function (d, i) {
            return publicationcount2[i][0];
        })
        .attr("transform", function (d) {
            return "translate(" + warc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle");

    parcs.append("text")
        .attr("class", fontresult)
        .attr("font-size", "12px")
        .attr("fill", "white")
        .style("text-shadow", "2px 2px 2px rgba(0, 0, 0, 0.5)")
        .text(function (d, i) {
            return publicationcount2[i][1] + "篇";
        })
        .attr("transform", function (d) {
            return "translate(" + warc.centroid(d) + ")translate(0,15)";
        })
        .attr("text-anchor", "middle");

    //category
    warcs.append("path")
        .attr("fill", function (d, i) {
            return d3.rgb(selectpiecolor)
                    .brighter(i + 1);
        })
        .attr("d", function (d) {
            return warc2(d);
        })
        .attr("stroke-width", "0px");

    warcs.append("path")
        .attr("fill", function (d, i) {
            return d3.rgb(selectpiecolor).brighter(i);
        })
        .attr("d", function (d) {
            return warc(d);
        })
        .attr("stroke", "white")
        .attr("stroke-width", "1px")
        .style("cursor", "pointer")
        .on("mouseover", function () {
            d3.select(this)
                .attr("stroke", "yellow")
                .attr("stroke-width", "3px");
        })
        .on("mouseout", function () {
            d3.select(this)
                .attr("stroke-width", "0px");
        })
        .on("click", function (d, i) {
            if ("#clistofwork" != undefined)
                svg2.select("#clistofwork")
                    .remove();

            if ("#plistofwork" != undefined)
                svg2.select("#plistofwork")
                    .remove();

            var plist = svg2.append("g")
                    .attr("id", "clistofwork");

            for (var j = 0; j < d3.min([12, categorycount[i][2].length]); j++) {
                plist.append("text")
                    .attr("class", fontresult)
                    .text("《" + categorycount[i][2][j] + "》")
                    .attr("x", 200)
                    .attr("y", 680 + j * 25)
                    .style("font-size", "13px");
            }
        });

    warcs.append("text")
        .attr("class", fontresult)
        .attr("font-size", "14px")
        .attr("fill", "white")
        .style("text-shadow", "2px 2px 2px rgba(0, 0, 0, 0.5)")
        .text(function (d, i) {
            return categorycount[i][0];
        })
        .attr("transform", function (d) {
            return "translate(" + warc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle");

    warcs.append("text")
        .attr("class", fontresult)
        .attr("font-size", "12px")
        .attr("fill", "white")
        .style("text-shadow", "2px 2px 2px rgba(0, 0, 0, 0.5)")
        .text(function (d, i) {
            return categorycount[i][1] + "篇";
        })
        .attr("transform", function (d) {
            return "translate(" + warc.centroid(d) + ")translate(0,15)";
        })
        .attr("text-anchor", "middle");

};

function textinput2() {
    fontresult = $("#fonttext").val();
    console.log(fontresult)
    selectcolor = "#" + $("#input_color").val();
    selectmapcolor = "#" + $("#input_mapcolor").val();
    selectpiecolor = "#" + $("#input_piecolor").val();
    init();
}

function drawMap() {

    console.log("in drawMap");
    features.append("clipPath")
        .attr("id", "map")
        .append("circle")
        .attr("cx", w / 2)
        .attr("cy", h / 2)
        .attr("r", innerRadius - 10);


    d3.json("../map/china.json", function (error, root) {

        if (error)
            return console.error(error);
        //event data : dataset
        for (var i = 0; i < root.features.length; i++) {
            locationcount.push("0");
        }

        dataset.forEach(function (d) {
            for (var i = 0; i < root.features.length; i++) {
                if (d.location == root.features[i].properties.name) {
                    locationcount[i]++;
                    break;
                }
            }
        });
        rScale.domain([0, d3.max(locationcount)]);

        var a = d3.rgb(selectmapcolor).brighter(3);
        var b = d3.rgb(selectmapcolor).darker(2);

        var linear = d3.scale.linear()
            .domain([1, root.features.length])
            .range([0, 1]);
        var colorscale = d3.interpolate(a, b);

        //draw geo-path
        features.append("g")
            .attr("id", "mappath")
            .attr("clip-path", "url(#map)")
            .selectAll("path")
            .data(root.features)
            .enter()
            .append("path")
            .attr("stroke", "#ccc")
            .attr("stroke-width", 1)
            .attr("d", path)
            .attr("fill", function (d, i) {
                if (locationcount[i] == 0)
                    return colorscale(linear(i));
                else
                    return "yellow";
            });

        features.append("g")
            .attr("id", "locationcount")
            .selectAll("circle")
            .data(root.features)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return path.centroid(d)[0];
            })
            .attr("cy", function (d) {
                return path.centroid(d)[1];
            })
            .attr("r", function (d, i) {
                if (locationcount[i] != 0)
                    return rScale(locationcount[i]) + 5;
                else
                    return 0;
            })
            .attr("fill", "#ff9c00")
            .style("stroke", "#ffc119")
            .style("stroke-width", "3px");

        features.append("g")
            .attr("id", "locationcounttext")
            .attr("class", fontresult)
            .style("text-shadow", " 2px 2px 2px rgba(0, 0, 0, 0.5)")
            .selectAll("text")
            .data(root.features)
            .enter()
            .append("text")
            .text(function (d) {
                return d.properties.name;
            })
            .attr("x", function (d) {
                return path.centroid(d)[0];
            })
            .attr("y", function (d) {
                return path.centroid(d)[1];
            })
            .attr("font-size", function (d, i) {
                if (locationcount[i] != 0)
                    return rScale(locationcount[i]) + 5;
                else
                    return 0;
            });

        features.append("g")
            .attr("id", "layout")
            .attr("class", fontresult)
            .style("font-size", "22px")
            .append("text")
            .text(nameresult + "生活分布图")
            .attr("text-anchor", "middle")
            .attr("x", w / 2)
            .attr("y", h / 2 - innerRadius + 40);
    });

    drawEvent();
}

function drawEvent() {

    //draw event node d i
    var eventx = [];
    var eventy = [];

    var angle = 1.9 * Math.PI / lifespan;
    var monthangle = 1.9 * Math.PI / lifespan / 12;

    console.log(lifespan);
    console.log(angle);
    console.log(monthangle);

    console.log( result1 );
    console.log( parseInt(result1) );

    console.log(dataset);
    dataset.forEach(function (d) {
        //node of event
        var eventangle = (parseInt(d.year) - parseInt(result1)) * angle + parseInt(d.month) * monthangle - Math.PI / 2;
        eventx.push(w / 2 + (outerRadius + interval / 2 + eventcategory.indexOf(d.category) * interval) * Math.cos(eventangle));
        eventy.push(h / 2 + (outerRadius + interval / 2 + eventcategory.indexOf(d.category) * interval) * Math.sin(eventangle));

        if (d.duration == "Y") {
            d.startangle = (parseInt(d.year) - parseInt(result1)) * angle;
            d.stopangle = (parseInt(d.year2) - parseInt(result1)) * angle;
        }
    });

    console.log("-------------------------------");
    console.log(eventx);
    //draw
    features
        .append("g")
        .attr("id", "eventnode")
        .selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("class", "eventnode")
        .attr("cx", function (d, i) {
            return eventx[i];
        })
        .attr("cy", function (d, i) {
            //console.log(eventy[i]);
            return eventy[i];
        })
        .attr("r", function (d) {
            if (d.duration == "Y")
                return 6;
            else
                return 8;
        })
        .attr("fill", function (d) {
            if (d.duration == "Y")
                return "#474747";
            else
                return "#a2a2a2";
        })
        .on("mouseover", function () {
            d3.select(this)
                .attr("fill", "orange")
                .attr("r", "12");
        })
        .on("mouseout", function (d) {
            if (d.duration == "Y")
                d3.select(this)
                    .attr("fill", "#7b7b7b")
                    .attr("r", "6");
            else
                d3.select(this)
                    .attr("fill", "#a2a2a2")
                    .attr("r", "8");
        })
        .on("click", function (d, i) {
            console.log(1);

            if ("#locationcount" != undefined) {
                d3.select("#locationcount").remove();
            }

            if ("#locationcounttext" != undefined) {
                d3.select("#locationcount").remove();
            }

            if ("#highlight" != undefined) {
                d3.select("#highlight").remove();
            }

            if ("#highlight2" != undefined) {
                d3.select("#highlight2").remove();
            }

            if ("#eventdetail" != undefined) {
                d3.select("#eventdetail").remove();
            }

            if ("#eventdetail2" != undefined) {
                d3.select("#eventdetail2").remove();
            }

            if ("#eventdetail3" != undefined) {
                d3.select("#eventdetail3").remove();
            }

            if ("#location2" != undefined) {
                d3.select("#location2").remove();
            }

            //draw map node *  d  d.location
            d3.csv("../map/idofshi.csv", function (error, data2) {
                if (error)
                    return console.error(error);

                var flag = 1;

                for (var i = 0; i < data2.length; i++) {
                    //如果地点在中国省份列表内 加载相应的省份地理数据
                    if (d.location == data2[i].name) {
                        d3.json("../map/" + d.location + ".json", function (error, root2) {
                            if (error)
                                return console.error(error);

                            var flag2 = 1;

                            for (var j = 0; j < root2.length; j++) {
                                // location2 市级地点
                                if (root2[j].properties.name == d.location2) {
                                    features.append("path")
                                        .attr("id", "highlight")
                                        .datum(root2[j])
                                        .attr("stroke", "white")
                                        .attr("stroke-width", 1)
                                        .attr("d", path)
                                        .attr("fill", "#FF83FA")
                                        .attr("opacity", "0.6");

                                    //centroid = path.centroid(root2[j]);
                                    //centroid.x = centroid[0];
                                    //centroid.y = centroid[1];
                                    var cp = projection(root2[j].properties.cp);

                                    var eventdetail1 = features.append("g")
                                        .attr("id", "eventdetail");
                                    eventdetail1.append("image")
                                        .attr("class", "highlightmark")
                                        .attr("x", cp[0] - 20)
                                        .attr("y", cp[1] - 20)
                                        .attr("width", "25")
                                        .attr("height", "25")
                                        .attr("xlink:href", "img/mark.png");

                                    //background
                                    eventdetail1.append("rect")
                                        .attr("class", "eventbox")
                                        .attr("x", cp[0] + 20 - d.event.length * 6)
                                        .attr("y", cp[1] + 20)
                                        .attr("width", d.event.length * 12 + 50)
                                        .attr("height", "80")
                                        .attr("rx", "8")
                                        .attr("ry", "8");

                                    eventdetail1.append("text")
                                        .text(d.location2)
                                        .attr("x", cp[0] - 50)
                                        .attr("y", cp[1] + 50)
                                        .attr("class", fontresult)
                                        .style("font-size", "14px")
                                        .style("font-weight", "bold");

                                    eventdetail1.append("text")
                                        .attr("class", fontresult)
                                        .style("font-size", "18px")
                                        .style("text-shadow", "2px 2px 2px rgba(0, 0, 0, 0.5)")
                                        .attr("x", cp[0] + 20)
                                        .attr("y", cp[1] + 30 + 20)
                                        .text(d.title);

                                    if (d.lack == "N")
                                        eventdetail1.append("text")
                                            .attr("x", cp[0] + 120)
                                            .attr("y", cp[1] + 30 + 20)
                                            .text(d.year + "年" + d.month + "月")
                                            .attr("class", fontresult)
                                            .attr("font-size", "15px");
                                    else
                                        eventdetail1.append("text")
                                            .attr("x", cp[0] + 120)
                                            .attr("y", cp[1] + 30 + 20)
                                            .text(d.year + "年")
                                            .attr("class", fontresult)
                                            .attr("font-size", "15px");

                                    eventdetail1.append("text")
                                        .attr("x", cp[0] + 20 + 20)
                                        .attr("y", cp[1] + 60 + 20)
                                        .text(d.event)
                                        .attr("class", fontresult)
                                        .attr("font-size", "12px");

                                    flag2 = 0;
                                    break;
                                }
                            }
                            //没有找到某市或某区 则绘制该省
                            if (flag2 == 1) {
                                //d.location2
                                d3.json("../map/china.json", function (error, root3) {
                                    for (var m = 0; m < root3.features.length; m++) {
                                        if (d.location == root3.features[m].properties.name) {
                                            features.append("path")
                                                .attr("id", "highlight2")
                                                .datum(root3.features[m])
                                                .attr("stroke", "white")
                                                .attr("stroke-width", 2)
                                                .attr("d", path)
                                                .attr("fill", "#FF83FA")
                                                .attr("opacity", "0.6");

                                            centroid2 = path.centroid(root3.features[m]);
                                            centroid2.x = centroid2[0];
                                            centroid2.y = centroid2[1];

                                            var eventdetail2 = features.append("g")
                                                .attr("id", "eventdetail2");
                                            eventdetail2.append("image")
                                                .attr("class", "highlightmark")
                                                .attr("x", centroid2.x - 20)
                                                .attr("y", centroid2.y - 20)
                                                .attr("width", "25")
                                                .attr("height", "25")
                                                .attr("xlink:href", "img/mark.png");

                                            //background
                                            eventdetail2.append("rect")
                                                .attr("class", "eventbox")
                                                .attr("x", centroid2.x + 20 - d.event.length * 6)
                                                .attr("y", centroid2.y + 20)
                                                .attr("width", d.event.length * 12 + 50)
                                                .attr("height", "80")
                                                .attr("rx", "8").attr("ry", "8");

                                            eventdetail2.append("text")
                                                .text(d.location)
                                                .attr("x", centroid2.x - 50)
                                                .attr("y", centroid2.y + 50)
                                                .attr("class", fontresult)
                                                .style("font-size", "14px")
                                                .style("font-weight", "bold");

                                            eventdetail2.append("text")
                                                .attr("class", fontresult)
                                                .style("font-size", "18px")
                                                .style("text-shadow", "2px 2px 2px rgba(0, 0, 0, 0.5)")
                                                .attr("x", centroid2.x + 20)
                                                .attr("y", centroid2.y + 50)
                                                .text(d.title);

                                            if (d.lack == "N")
                                                eventdetail2.append("text")
                                                    .attr("x", 140 + centroid2.x - 20)
                                                    .attr("y", 50 + centroid2.y)
                                                    .text(d.year + "年" + d.month + "月")
                                                    .attr("class", fontresult)
                                                    .attr("font-size", "15px");
                                            else
                                                eventdetail2.append("text")
                                                    .attr("x", 140 + centroid2.x - 20)
                                                    .attr("y", 50 + centroid2.y)
                                                    .text(d.year + "年")
                                                    .attr("class", fontresult)
                                                    .attr("font-size", "15px");

                                            eventdetail2.append("text")
                                                .attr("x", 40 + centroid2.x)
                                                .attr("y", 30 + centroid2.y + 50)
                                                .text(d.event)
                                                .attr("class", fontresult)
                                                .attr("font-size", "12px");
                                        }
                                    }

                                });
                            }
                        });
                        flag = 0;
                        break;
                    }
                }
                if (flag == 1) {
                    //若地名在国外 如美国
                    var eventdetail3 = features.append("g")
                        .attr("id", "eventdetail3");

                    //background  10 cx  h-100 cy
                    eventdetail3.append("rect")
                        .attr("class", "eventbox")
                        .attr("x", w / 2 + 20 - d.event.length * 6)
                        .attr("y", h / 2 + 20)
                        .attr("width", d.event.length * 12 + 50)
                        .attr("height", "80")
                        .attr("rx", "8")
                        .attr("ry", "8");

                    eventdetail3.append("text")
                        .text(d.location)
                        .attr("x", w / 2 - 30)
                        .attr("y", h / 2 + 50)
                        .style("class", fontresult)
                        .style("font-size", "14px")
                        .style("font-weight", "bold");

                    eventdetail3.append("text")
                        .attr("class", fontresult)
                        .style("font-size", "18px")
                        .style("text-shadow", "2px 2px 2px rgba(0, 0, 0, 0.5)")
                        .attr("x", w / 2 + 20 + 20)
                        .attr("y", h / 2 + 30 + 20)
                        .text(d.title);

                    if (d.lack == "N")
                        eventdetail3.append("text")
                            .attr("x", w / 2 + 120)
                            .attr("y", h / 2 + 30 + 20)
                            .text(d.year + "年" + d.month + "月")
                            .attr("class", fontresult)
                            .attr("font-size", "15px");
                    else
                        eventdetail3.append("text")
                            .attr("x", w / 2 + 120)
                            .attr("y", h / 2 + 30 + 20)
                            .text(d.year + "年")
                            .attr("class", fontresult)
                            .attr("font-size", "15px");

                    eventdetail3.append("text")
                        .attr("x", w / 2 + 20 + 20)
                        .attr("y", h / 2 + 60 + 20)
                        .text(d.event)
                        .attr("class", fontresult)
                        .attr("font-size", "12px");
                }
            });
        });
    //draw arc of duration


    console.log("-------------------------------");
    dataset.forEach(function (d) {
        if (d.duration == "Y") {
            var durarc = d3.svg.arc()
                .innerRadius(outerRadius + eventcategory.indexOf(d.category) * interval + interval / 2 - 2)
                .outerRadius(outerRadius + eventcategory.indexOf(d.category) * interval + interval / 2 + 2)
                .startAngle(parseFloat(d.startangle))
                .endAngle(parseFloat(d.stopangle));

            var durarcs = features.datum(d).append("g")
                .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

            durarcs.append("path")
                .attr("d", durarc())
                .attr("fill", "#474747")
                .on("mouseover", function (d) {
                    d3.select(this)
                        .attr("fill", "orange");

                    durarcs.append("text")
                        .text(d.title)
                        .attr("id", "arctitle")
                        .attr("fill", "orange")
                        .attr("x", durarc.centroid()[0])
                        .attr("y", durarc.centroid()[1])
                        .attr("class", fontresult);
                })
                .on("mouseout", function (d) {
                    d3.select(this)
                        .attr("fill", "#474747");

                    if ("#arctitle" != undefined)
                        d3.select("#arctitle")
                            .remove();
                });

        }
    });

    //title
    features.append("g")
        .attr("id", "eventtitle")
        .selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .attr("class", "eventtitle")
        .attr("class", fontresult)
        .text(function (d) {
            return d.title;
        })
        .attr("x", function (d, i) {
            return eventx[i];
        })
        .attr("y", function (d, i) {
            return eventy[i];
        })
        .on("mouseover", function () {
            d3.select(this)
                .attr("fill", "orange");
        })
        .on("mouseout", function () {
            d3.select(this)
                .attr("fill", "black");
        });
}


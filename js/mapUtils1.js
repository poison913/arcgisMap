/// <reference path="E:\新建文件夹 (3)\testarcgis\testarcgis\View/proimg.html" />
/*文件说明：这是关于地图操作的全部代码*/
dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.dijit.Measurement");
dojo.require("esri.dijit.LocateButton");
dojo.require("esri.dijit.HomeButton");
dojo.require("esri.dijit.Print");
dojo.require("esri.dijit.OverviewMap");
dojo.require("esri.toolbars.draw");
dojo.require("esri.toolbars.edit");
dojo.require("esri.symbols.SimpleMarkerSymbol");
dojo.require("esri.symbols.SimpleLineSymbol");
dojo.require("esri.symbols.SimpleFillSymbol");
dojo.require("esri/request");
dojo.require("esri/tasks/GeometryService");
dojo.require("esri/tasks/BufferParameters");
dojo.require("esri.config");
dojo.require("esri/tasks/PrintTemplate");
dojo.require("esri/tasks/PrintTask");
dojo.require("esri/tasks/PrintParameters");
dojo.require("dojo/_base/array");
//dojo.provide("extras.ClusterLayer");
dojo.require("esri/Color");
dojo.require("esri/graphic");
//dojo.require("esri/symbols/SimpleMarkerSymbol");
dojo.require("esri/symbols/TextSymbol");
dojo.require("esri/layers/GraphicsLayer");
dojo.require("esri/layers/FeatureLayer");
dojo.require("esri/dijit/editing/Add");
dojo.require("esri/dijit/Scalebar");
dojo.require("esri/geometry/normalizeUtils");
var map, dynamicMapServiceLayer;
var chusshi = true;
var apiurl = "http://116.62.152.138:4000/project_gis/";//"http://localhost:8808/project_gis/";//
var arcgisurl = "http://101.71.130.148:6080/arcgis/rest/services/";//"http://122.112.235.37:6080/arcgis/rest/services/";
var currentlayer = "";
//地图定位
var mapToCenter = function () {
    //地图居中全局方法变量
    //var extent = $.cookie('extent');
    //if (extent != null) {
    //    map.setExtent(new esri.geometry.Extent(JSON.parse(extent)));
    //    $.cookie('extent', null);
    //    return;
    //}
    var CenterPoint = new esri.geometry.Point({
        latitude: 30.235,
        longitude: 120.15
    });
    map.centerAndZoom(CenterPoint, 13);

}
//底图切换
function switchBaseMap(type) {
    switch (type) {
        case 0:
            $("#Dtmap").attr('class', 'dituWH on');
            $("#Wxmap").attr('class', 'dituWH');
            ttdEMapLayer.setVisibility(true);
            ttdEMapLayerWenzi.setVisibility(true);
            ttdMapLayer.setVisibility(false);
            ttdMapLayerWenzi.setVisibility(false);
            break;
        case 1:
            $("#Dtmap").attr('class', 'dituWH');
            $("#Wxmap").attr('class', 'dituWH on');
            ttdEMapLayer.setVisibility(false);
            ttdEMapLayerWenzi.setVisibility(false);
            ttdMapLayer.setVisibility(true);
            ttdMapLayerWenzi.setVisibility(true);
            break;
    }
}
//清理地图图层
function mapclear() {
    if (map.getLayer("ProjLayer") != undefined)
        map.removeLayer(map.getLayer("ProjLayer"));
    if (map.getLayer("Projscope") != undefined)
        map.removeLayer(map.getLayer("Projscope"));
    if (map.getLayer("layerradio") != undefined)
        map.removeLayer(map.getLayer("layerradio"));
    if (map.getLayer("layerBuffer") != undefined)
        map.removeLayer(map.getLayer("layerBuffer"));
    if (map.getLayer("range") != undefined)
        map.removeLayer(map.getLayer("range"));
    if (map.getLayer("editProj") != undefined)
        map.removeLayer(map.getLayer("editProj"));
    if (heatLayer != undefined)
        map.removeLayer(heatLayer);
    if (clickGraphicsLayer != undefined)
        map.removeLayer(clickGraphicsLayer);
    map.graphics.clear();
    for (var i = 0; i < checkarray.length; i++) {
        //console.log(checkarray[i]);
        if (map.getLayer(checkarray[i]) != undefined)
            map.removeLayer(map.getLayer(checkarray[i]));
    }
    removeanalytics();
    if (divframe && divframe.iframe) {
        var api = divframe.iframe.api;
        api.close();
        divframe = null;
    }
    if (div1frame && div1frame.iframe) {
        var api = div1frame.iframe.api;
        api.close();
        div1frame = null;
    }
    if (divimg && divimg.iframe) {
        var api = divimg.iframe.api;
        api.close();
        divimg = null;
    }
    if (Drawtool) {
        Drawtool.deactivate();
    }
}
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return "";
}
//document.onkeydown = function () { 
//    if (window.event && window.event.keyCode == 123) {
//        //alert("F12被禁用");
//        event.keyCode = 0;
//        event.returnValue = false;
//    }
//    if (window.event && window.event.keyCode == 13) {
//        window.event.keyCode = 505;
//    }
//    if (window.event && window.event.keyCode == 8) {
//        alert(str + "\n请使用Del键进行字符的删除操作！");
//        window.event.returnValue = false;
//    } 
//}
//document.oncontextmenu = function (event) {
//    if (window.event) {
//        event = window.event;
//    } try {
//        var the = event.srcElement;
//        if (!((the.tagName == "INPUT" && the.type.toLowerCase() == "text") || the.tagName == "TEXTAREA")) {
//            return false;
//        }
//        return true;
//    } catch (e) {
//        return false;
//    }
//}
dojo.ready(initMap)//dojo成功加载才执行所有map相关代码
//初始化地图
function initMap() {
    if (chusshi) {//仅初始化一次 
        var popup = new esri.dijit.Popup({
            lineSymbol: new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2),
            fillSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]))
        }, dojo.create("div"));
        map = new esri.Map("MyMapDiv",
            {
                logo: false,
                sliderStyle: "small",
                sliderPosition: "top-left",
                //infoWindow: popup
            });
        ttdMapLayer = new TDTImgLayer();
        ttdMapLayerWenzi = new TDTImgWordLayer();

        ttdEMapLayer = new TDTVecLayer();
        ttdEMapLayerWenzi = new TDTEWordLayer();
        mapToCenter();//设置初次加载时的地图默认状态
    }
    else {
        map.removeLayer(ttdMapLayer);
        map.removeLayer(ttdMapLayerWenzi);
        map.removeLayer(ttdEMapLayer);
        map.removeLayer(ttdEMapLayerWenzi);
    }
    map.addLayer(ttdEMapLayer);
    map.addLayer(ttdEMapLayerWenzi);
    map.addLayer(ttdMapLayer);
    map.addLayer(ttdMapLayerWenzi);
    ttdEMapLayer.setVisibility(false);
    ttdEMapLayerWenzi.setVisibility(false);
    chusshi = false;

    esri.config.defaults.io.proxyUrl = "http://116.62.152.138:8080/gisServer/proxy";

    esri.config.defaults.io.alwaysUseProxy = true;
    esri.config.defaults.geometryService = new esri.tasks.GeometryService(arcgisurl + "/Utilities/Geometry/GeometryServer");
    //量算

    var measurement = new esri.dijit.Measurement({
        map: map,
        defaultAreaUnit: esri.Units.SQUARE_KILOMETERS,
        defaultLengthUnit: esri.Units.KILOMETERS
    }, dojo.byId("measurementDiv"));
    measurement.startup();
    //measurement.on("measure-start", function (evt) {
    //    map.graphics.clear();
    //});
    measurement.on("measure-end", function (evt) {
        //alert("111");
        if (evt.geometry.type == "polygon") {
            //var s111 = new esri.symbol.SimpleFillSymbol(
            //               esri.symbol.SimpleFillSymbol.STYLE_SOLID,
            //               new esri.symbol.SimpleLineSymbol(
            //                   esri.symbol.SimpleLineSymbol.STYLE_NULL,
            //                   new dojo.Color([255, 0, 0]),
            //                   2
            //               ),
            //               new dojo.Color([255, 255, 0, 0.5])
            //       );
            //evt.target.measureGraphic.setSymbol(s111);
            //var gr3 = new esri.Graphic(evt.geometry, s111);
            //map.graphics.add(gr3);
        }
    });
    $('#titlePane').click(function () {
        $("#measurementDiv").toggle();
    })
    var titlePane = document.getElementById("titlePane");
    titlePane.click();
    //返回主视图
    var home = new esri.dijit.HomeButton({
        map: map
    }, "HomeButton1111");
    home.startup();

    //比例尺
    var scalebar = new esri.dijit.Scalebar({
        map: map,
        // "dual" displays both miles and kilmometers
        // "english" is the default, which displays miles
        // use "metric" for kilometers
        scalebarUnit: "metric"
    });

    if (document.getElementsByClassName("esriScalebar").length > 0) {
        var scalebardiv = document.getElementsByClassName("esriScalebar")[0];
        scalebardiv.style.height = "30px";
        scalebardiv.style.width = "150px";
        scalebardiv.style.backgroundColor = "white";
        scalebardiv.style.padding = "10px";
    }

    //div显示隐藏 
    var layersfirst = true;
    $('#layers').click(function () {
        clearMeature();
        mapclear();
        mapToCenter();
        $("#layerdiv").toggle();
        $("#querydiv").hide();
        $("#analyticsdiv").hide();
        $("#staticdiv").hide();
        $("#prodetail").hide();
        if ($("#layerdiv").is(":visible") && layersfirst) {
            layersfirst = false;
            $('#ex1').slider({
                formatter: function (value) {
                    return '透明度: ' + value;
                }
            }).on('slide', function (slideEvt) {
            }).on('change', function (e) {
                if (currentlayer == "") return;
                var layer = map.getLayer(currentlayer);
                layer.setOpacity((e.value.newValue / 100));
            });
            initlayerstree();
        }
        if ($("#layerdiv").is(":visible") && !layersfirst) {
            var ck_list = $(".checkboxBtn");
            var len = ck_list.length;
            for (var i = 0; i < len; i++) {
                ck_list[i].checked = false;
            }
            var radioBtn222 = $(".radioBtn1");
            var len11 = radioBtn222.length;
            for (var i = 0; i < len11; i++) {
                radioBtn222[i].checked = false;
            }
        }
    })
    var queryfirst = true;
    $('#query').click(function () {
        clearMeature();
        mapclear();
        mapToCenter();
        $("#layerdiv").hide();
        $("#querydiv").toggle();
        $("#analyticsdiv").hide();
        $("#staticdiv").hide();
        $("#prodetail").hide();
        //if ($("#querydiv").is(":visible")) {
        //    var divChild = document.getElementById("querydiv");
        //    divChild.style.left = "200px";
        //    divChild.style.top = "150px";
        //    divChild.style.position = "absolute";
        //}
        if ($("#querydiv").is(":visible")) {
            queryfirst = false;
            query("q");
        }

    })
    $('#analytics').click(function () {
        clearMeature();
        mapclear();
        mapToCenter();
        $("#layerdiv").hide();
        $("#querydiv").hide();
        $("#staticdiv").hide();
        $("#analyticsdiv").toggle();
        $("#prodetail").hide();
    })
    var staticfirst = true;
    $('#static').click(function () {
        clearMeature();
        $("#layerdiv").hide();
        $("#querydiv").hide();
        $("#analyticsdiv").hide();
        $("#staticdiv").toggle();
        $("#prodetail").hide();
        if ($("#staticdiv").is(":visible")) {
            var divChild = document.getElementById("staticdiv");
            divChild.style.left = "200px";
            divChild.style.top = "150px";
            divChild.style.position = "absolute";
        }
        if ($("#staticdiv").is(":visible") && staticfirst) {
            staticfirst = false;
            showstatic();
        }
    })
    $('.proclose').click(function () {
        $("#prodetail").hide();
    })
    $('.proimgclose').click(function () {
        $("#proimgdiv").hide();
    })
    //test heatmap  
    //heatmap3();
    map.on("mouse-move", function (e) {
        //console.log(e.mapPoint.x);
        var pop = "经度：" + e.mapPoint.x + "<br/>纬度：" + e.mapPoint.y;
        $("#point").html(pop);
    });

    initClusterLayer();
    initheatmap();

    var id = getQueryString("id");
    if ("1" == "1") {
        clearMeature();
        mapclear();
        mapToCenter();
        $("#layerdiv").hide();
        $("#querydiv").hide();
        $("#staticdiv").hide();
        $("#analyticsdiv").show();
        $("#prodetail").hide();
    } else {
        //初始化项目
        initpro("ProjLayer");
    }

}
//清除量测功能
function clearMeature() {
    for (i = 0; i < 3; i++) {
        var a = document.getElementById("dijit_form_ToggleButton_" + i);
        if (a.parentElement.parentElement.classList.contains("dijitChecked")) {
            a.click();
        }
    }
    var s = document.getElementById("measurementDiv");
    if (s.style.display == "block") {
        s.style.display = "none"
    }
}
var heatLayer;
//var Heatmapdata = [];
//初始化地图时加载项目
function initpro(layername) {
    $.ajax({
        type: "GET",
        url: apiurl + "query_project",
        data: {
            pageSize: -1
        },
        dataType: "json",
        async: false,
        success: function (json) {
            if (json.code = 1000) {
                var multiPoint = new esri.geometry.Multipoint(map.spatialReference);
                var graphicsLayer = new esri.layers.GraphicsLayer({ id: layername });
                map.addLayer(graphicsLayer);
                var data = json.data.pGis;
                var Icon = new esri.symbol.PictureMarkerSymbol("../View/civil_engineer.png", 32, 32);
                Icon.setOffset(0, 18);
                for (var i = 0 ; i < data.length; i++) {
                    var geometry = new esri.geometry.Point(data[i].lon, data[i].lat, map.spatialReference);
                    var graphic = new esri.Graphic(geometry, Icon, data[i]);
                    //Heatmapdata.push(graphic);
                    graphicsLayer.add(graphic);
                    multiPoint.addPoint(geometry);
                }

                graphicsLayer.on("click", function (evt) {
                    if (layername == "ProjLayer") {
                        var graphic = evt["graphic"];
                        var CenterPoint = new esri.geometry.Point({
                            latitude: parseFloat(evt.graphic.geometry.y),
                            longitude: parseFloat(evt.graphic.geometry.x)
                        });
                        map.centerAndZoom(CenterPoint, 16);
                        showinfo(graphic.attributes.projectId);

                    } else if (layername == "layerBuffer") {
                        doBuffer(evt.graphic)
                    }
                    else if (layername == "range") {
                        var scope = evt.graphic.attributes.scope;
                        if (scope != "") {
                            if (map.getLayer("Projscope") != undefined)
                                map.removeLayer(map.getLayer("Projscope"));
                            var Projscope = new esri.layers.GraphicsLayer({ id: "Projscope" });
                            map.addLayer(Projscope);
                            var lineArr = new Array();
                            var scs = scope.split(';');
                            for (var i = 0 ; i < scs.length; i++) {
                                if (scs[i] == "") continue;
                                var sc = scs[i].split(',');
                                var line = new Array();
                                line[0] = parseFloat(sc[0]);
                                line[1] = parseFloat(sc[1]);
                                lineArr[i] = line;
                            }

                            var symbol24 = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1);
                            //var symbol48 = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOTDOT, new dojo.Color([255, 255, 153]), 1);
                            var geometry;
                            var graphic;
                            geometry = new esri.geometry.Polyline(lineArr)
                            graphic = new esri.Graphic(geometry, symbol24);
                            Projscope.add(graphic);
                        }
                    }
                });
                if (multiPoint.points.length == 1) {
                    var CenterPoint = multiPoint.points[0];
                    map.centerAndZoom(CenterPoint, map.getZoom() + 3);
                } else {
                    map.setExtent(multiPoint.getExtent());
                }
            } else if (json.code = 1001) {
                alert("获取信息失败");
            } else if (json.code = 1002) {
                alert("接口异常");
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });

}

//展示项目详情
function showinfo(projectCode, showpoi) {
    $.ajax({
        type: "GET",
        url: apiurl + "getproject",
        data: {
            pId: projectCode
        },
        dataType: "json",
        //async: false,
        success: function (json) {
            if (json.code = 1000) {
                if (json.data != null && json.data.project != null) {
                    $(".drag").hide();
                    $("#prodetail").show();
                    if ($("#prodetail").is(":visible")) {
                        var divChild = document.getElementById("prodetail");
                        divChild.style.left = "280px";
                        divChild.style.top = "100px";
                        divChild.style.position = "absolute";
                    }
                    $("#showimg").unbind();//解绑click事件
                    var pro = json.data.project;
                    if (showpoi == "1") {

                    }
                    $("#projectname").val(pro.name);
                    $("#unit").val(pro.unit);
                    $("#areaName").val(pro.areaName);
                    $("#address").val(pro.address);
                    if (pro.startDate.length > 0) {
                        $("#startDate").val(pro.startDate.split(' ')[0]);
                    }
                    $("#period").val(pro.period);
                    if (pro.user.length > 0) {
                        var signuser = GetUserByType(pro.user, 3);
                        var chargeuser = GetUserByType(pro.user, 1);
                        var member = GetUserByType(pro.user, 2);

                        $("#signuser").val(signuser);
                        $("#chargeuser").val(chargeuser);
                        $("#member").val(member);
                    }
                    if (pro.cameras.length > 0) {
                        $('#showimg').click(function () {
                            showimg(pro.id)
                        })
                    } else {
                        $('#showimg').click(function () {
                            alert("该项目没有图片展示");
                        })
                    }
                    if (pro.scope != "") {
                        if (map.getLayer("Projscope") != undefined)
                            map.removeLayer(map.getLayer("Projscope"));
                        var Projscope = new esri.layers.GraphicsLayer({ id: "Projscope" });
                        map.addLayer(Projscope);
                        var lineArr = new Array();
                        var scs = pro.scope.split(';');
                        for (var i = 0 ; i < scs.length; i++) {
                            if (scs[i] == "") continue;
                            var sc = scs[i].split(',');
                            var line = new Array();
                            line[0] = parseFloat(sc[0]);
                            line[1] = parseFloat(sc[1]);
                            lineArr[i] = line;
                        }

                        var symbol24 = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1);
                        //var symbol48 = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOTDOT, new dojo.Color([255, 255, 153]), 1);
                        var geometry;
                        var graphic;
                        geometry = new esri.geometry.Polyline(lineArr)
                        graphic = new esri.Graphic(geometry, symbol24);
                        Projscope.add(graphic);

                    }
                    var str = "";
                    if (pro.lat != "" && pro.lon != "" && pro.scope != "") {
                        //str += "<a href='javascript:void(0)' onclick='Location(" + row.id + "," + row.lat + "," + row.lon + ")' >定位</a>&nbsp;&nbsp;&nbsp;";
                        str += "<span style='border:1px solid #b8d8b8;padding: 5px;left: 20px;position: relative;color: #fff;background-color: #009688;cursor: pointer; font:inherit;' onclick='AddLocation(" + pro.id + ")' >更改项目中心</span>&nbsp;&nbsp;&nbsp;";
                        str += "<span  style='border:1px solid #b8d8b8;padding: 5px;margin-left: 10px;position: relative;color: #fff;background-color: #009688;cursor: pointer; font:inherit;' onclick='editscope(" + pro.id + ",\"" + pro.scope + "\",\"" + pro.lat + "\",\"" + pro.lon + "\")' >编辑项目范围</span> ";
                    } else if (pro.lat != "" && pro.lon != "" && pro.scope == "") {
                        //str += "<a href='javascript:void(0)' onclick='Location(" + row.id + "," + row.lat + "," + row.lon + ")' >定位</a>&nbsp;&nbsp;&nbsp;";
                        str += "<span style='border:1px solid #b8d8b8;padding: 5px;left: 20px;position: relative;color: #fff;background-color: #009688;cursor: pointer; font:inherit;'  onclick='AddLocation(" + pro.id + ")' >更改项目中心</span>&nbsp;&nbsp;&nbsp;";
                        str += "<span style='border:1px solid #b8d8b8;padding: 5px;margin-left: 10px;position: relative;color: #fff;background-color: #009688;cursor: pointer; font:inherit;'  onclick='Addscope1(" + pro.id + ",\"" + pro.lat + "\",\"" + pro.lon + "\")' >添加项目范围</span> ";
                    } else if (pro.lat == "" && pro.lon == "" && pro.scope != "") {
                        //str += "<a href='javascript:void(0)' onclick='statue(\"" + value + "\")' >定位</a>&nbsp;&nbsp;&nbsp;";
                        str += "<span style='border:1px solid #b8d8b8;padding: 5px;left: 20px;position: relative;color: #fff;background-color: #009688;cursor: pointer; font:inherit;'  onclick='AddLocation(" + pro.id + ")' >添加项目中心</span>&nbsp;&nbsp;&nbsp;";
                        str += "<span style='border:1px solid #b8d8b8;padding: 5px;margin-left: 10px;position: relative;color: #fff;background-color: #009688;cursor: pointer; font:inherit;'  onclick='editscope(" + pro.id + ",\"" + pro.scope + "\",\"" + pro.lat + "\",\"" + pro.lon + "\")' >编辑项目范围</span> ";
                    } else if (pro.lat == "" && pro.lon == "" && pro.scope == "") {
                        str += "<span style='border:1px solid #b8d8b8;padding: 5px;left: 20px;position: relative;color: #fff;background-color: #009688;cursor: pointer; font:inherit;'  onclick='AddLocation(" + pro.id + ")' >添加项目中心</span>&nbsp;&nbsp;&nbsp;";
                        str += "<span  style='border:1px solid #b8d8b8;padding: 5px;margin-left: 10px;position: relative;color: #fff;background-color: #009688;cursor: pointer; font:inherit;' onclick='Addscope1(" + pro.id + ",\"" + pro.lat + "\",\"" + pro.lon + "\")' >添加项目范围</span> ";
                    }
                    $("#action").empty();
                    $("#action").html(str);
                } else {
                    alert("获取信息失败");
                }
            } else if (json.code = 1001) {
                alert("获取信息失败");
            } else if (json.code = 1002) {
                alert("接口异常");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });

    //$("#pro").html(projectCode);
    //$('.pgwSlideshow').pgwSlideshow({
    //    transitionEffect: 'fading',
    //    autoSlide: true
    //});
}
function GetUserByType(user, type) {
    var userstr = "";
    for (var i = 0; i < user.length; i++) {
        if (user[i].type == type) {
            userstr += user[i].userName + "," + user[i].mobile + " ";
        }
    }
    return userstr;
}
function showimg(id) {
    if (div1frame && div1frame.iframe) {
        var api = div1frame.iframe.api;
        api.close();
        div1frame = null;
    }
    if (divframe && divframe.iframe) {
        var api = divframe.iframe.api;
        api.close();
        divframe = null;
    }
    divimg = $.dialog({
        id: "lhdg1999",
        title: "项目照片",
        content: "url:proimg.html?id=" + id,
        width: 450,
        height: 440,
        zIndex: 999999999,
        close: function () {
        }
    });
}
var divframe;
var div1frame;
var divimg;
function showdiv() {
    //$('#showdiv1').dialog('closed');
    if (div1frame && div1frame.iframe) {
        var api = div1frame.iframe.api;
        api.close();
        div1frame = null;
    }
    if (divimg && divimg.iframe) {
        var api = divimg.iframe.api;
        api.close();
        divimg = null;
    }
    divframe = $.dialog({
        id: "lhdg1999",
        title: "视频展示",
        content: "url:test.html",
        width: 450,
        height: 440,
        zIndex: 999999999,
        close: function () {

        }
    });
}
function showdiv1() {
    //$('#showdiv').dialog('closed');
    if (divframe && divframe.iframe) {
        var api = divframe.iframe.api;
        api.close();
        divframe = null;
    }
    if (divimg && divimg.iframe) {
        var api = divimg.iframe.api;
        api.close();
        divimg = null;
    }
    div1frame = $.dialog({
        id: "lhdg1999",
        title: "VR展示按钮",
        content: "url:https://720yun.com/t/6bfj5ztury3?scene_id=11571123",
        width: 650,
        height: 640,
        zIndex: 999999999,
        close: function () {
        }
    });
}
function closepro() {
    $("#prodetail").hide();
}
//div移动
$(document).ready(function () {
    var move = false;
    var _x, _y;
    $(".drag").mousedown(function (e) {
        move = true;
        _x = e.pageX - parseInt($(".drag").css("left"));
        _y = e.pageY - parseInt($(".drag").css("top"));
    });
    $(document).mousemove(function (e) {
        if (move) {
            var x = e.pageX - _x;//控件左上角到屏幕左上角的相对位置 
            var y = e.pageY - _y;
            $(".drag").css({ "top": y, "left": x });
        }
    }).mouseup(function () {
        move = false;
    });
    var move1 = false;
    var _x1, _y1;
    $(".drag1").mousedown(function (e) {
        move = true;
        _x1 = e.pageX - parseInt($(".drag1").css("left"));
        _y1 = e.pageY - parseInt($(".drag1").css("top"));
    });
    $(document).mousemove(function (e) {
        if (move) {
            var x = e.pageX - _x1;//控件左上角到屏幕左上角的相对位置 
            var y = e.pageY - _y1;
            $(".drag1").css({ "top": y, "left": x });
        }
    }).mouseup(function () {
        move1 = false;
    });
})
//打印 
function testprint() {
    var printTask = new esri.tasks.PrintTask((arcgisurl + "Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"), { mode: "async" });
    var template = new esri.tasks.PrintTemplate();

    template.layoutOptions = {
        "authorText": "制图单位",
        "copyrightText": "版权所有",
        //"legendLayers": [],
        "titleText": "标题",
        //"scalebarUnit": "Kilometers"
    };
    template.exportOptions = {
        width: 800,
        height: 600,
        dpi: Number(90)
    };
    template.format = "png32";
    template.layout = "MAP_ONLY";
    template.preserveScale = false;
    var params = new esri.tasks.PrintParameters();
    params.map = map;
    params.template = template;
    printTask.execute(params, function (evt) {
        window.open(evt.url, "_blank");
    });
}

function modelcanvasPrint() {
    $("#printModal1").modal("show");
}
function canvasPrint(name) {
    var name;
    name = $("#printname").val();
    if (name == "") {
        alert("名称不能为空");
        return;
    } else {
        $("#printModal1").modal("hide");
    }
    var targetDom = $("#MyMapDiv");
    targetDom[0].childNodes[3].childNodes[3].style.display = "none";

    //克隆截图区域
    var copyDom = targetDom.clone();
    copyDom.width(targetDom.width() + "px");
    copyDom.height(targetDom.height() + "px");
    copyDom.attr("id", "copyDom");
    //copyDom[0].style.marginTop = "100px";
    copyDom[0].style.zIndex = -999999999;
    var e = document.createElement("h2");
    e.innerText = name;
    e.style.top = "-20px"
    e.style.width = "100%"
    e.align = "center";
    e.style.position = "absolute";
    e.style.backgroundColor = "white";
    e.style.padding = "10px";
    copyDom[0].appendChild(e)
    $("body").append(copyDom);

    var pathName = document.location.pathname;
    var ctxPath = pathName.substring(1, pathName.substr(1).indexOf('/') + 1);
    html2canvas(document.getElementById("copyDom"), {
        useCORS: true,
        //imageTimeout:0 
        foreignObjectRendering: true,
        allowTaint: false,
        removeContainer: false
        //, proxy: "/" + ctxPath + "/proxy/proxyScreenShot"
    }).then(function (canvas) {
        var url = canvas.toDataURL('image/jpeg', 0.3);
        //创建下载a标签
        var a = document.createElement("a");
        a.setAttribute("id", "download");
        document.body.appendChild(a);
        //以下代码为下载此图片功能
        var triggerDownload = $("#download").attr("href", url).attr("download", "img.png");
        triggerDownload[0].click();
        //移除下载a标签
        document.body.removeChild(a);
        //克隆DOM删除
        copyDom.remove();
        targetDom[0].childNodes[3].childNodes[3].style.display = "block";
    });
}
var layertreeobj;
//图层管理
function initlayerstree() {
    $.ajax({
        type: "GET",
        url: apiurl + "queryProjectLayer",
        data: {
            //pId: projectCode
        },
        dataType: "json",
        //async: false,
        success: function (json) {
            if (json.code = 1000) {
                var data = json.data.layers;
                for (var i = 0 ; i < data.length; i++) {
                    layertree.push(data[i]);
                }
                var setting = {
                    //check: {
                    //    enable: true,
                    //    autoCheckTrigger: false,
                    //    chkradioType: "all",
                    //    chkboxType: { "Y": "", "N": "" },
                    //    chkStyle: "radio",
                    //    nocheckInherit: false,
                    //    chkDisabledInherit: false,
                    //    radioType: "all",
                    //},
                    view: {
                        showIcon: false,
                        showLine: true,
                        addDiyDom: addDiyDom
                    },
                    //async: {
                    //    enable: true,
                    //    url: "../DataServices/UserManage.ashx",//"Get_RoleInfos",
                    //    //autoParam: ["id"]
                    //    otherParam: { "type": "Get_DepartInfos" },
                    //    dataFilter: roleDataFilter

                    //},
                    data: {
                        simpleData: {
                            enable: true,
                            idKey: "id",
                            pIdKey: "pId",
                            rootPId: 0
                        }
                    },
                    callback: {
                        //onCheck: onCheck,
                        //onClick: zTreeOnClick
                    }
                };

                layertreeobj = $.fn.zTree.init($("#layertree"), setting, layertree);
            } else if (json.code = 1001) {
                alert("获取信息失败");
            } else if (json.code = 1002) {
                alert("接口异常");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });

}
function addDiyDom(treeId, treeNode) {
    var aObj = $("#" + treeNode.tId + "_a");
    if (treeNode.level == 1 && treeNode.id.toString().indexOf("2") == 0) {
        var editStr = "<input type='radio' class='radioBtn1' id='radio_" + treeNode.id + "_" + treeNode.pId + "' name='name2' onfocus='this.blur();'></input>";
        aObj.before(editStr);
        var btn = $("#radio_" + treeNode.id + "_" + treeNode.pId);
        if (btn) {
            btn.bind("click", function () { ridiocheck(treeNode, btn); });
        }
        aObj.bind("click", function () { check(treeNode, btn); });
    } else if (treeNode.level == 1 && treeNode.id.toString().indexOf("4") == 0) {
        var editStr = "<input type='checkbox' class='checkboxBtn' id='checkbox_" + treeNode.id + "_" + treeNode.pId + "' name='checkbox_" + treeNode.getParentNode().id + "_" + treeNode.pId + "' onfocus='this.blur();'></input>";
        aObj.before(editStr);
        var btn = $("#checkbox_" + treeNode.id + "_" + treeNode.pId);
        if (btn) {
            btn.bind("click", function () { checkBrand(treeNode, btn); });
        }
        aObj.bind("click", function () { check1(treeNode, btn); });
    }
    else if (treeNode.level == 1 && treeNode.id.toString().indexOf("3") == 0) {
        var stats = "";
        if (treeNode.id == 31 || treeNode.id == 32) {
            if (treeNode.id == 31) {
                stats = "checked";
            }
            var editStr = "<input type='radio' class='radioBtn222' id='radio_" + treeNode.id + "_" + treeNode.pId + "' name='namemap' " + stats + " onfocus='this.blur();'></input>";
            aObj.before(editStr);
            var btn = $("#radio_" + treeNode.id + "_" + treeNode.pId);
            if (btn) {
                btn.bind("click", function () { checkmap(treeNode, btn); });
            }
            aObj.bind("click", function () { check2(treeNode, btn); });
        } else {
            var editStr = "<input type='checkbox' checked class='radioBtn222' id='checkbox_" + treeNode.id + "_" + treeNode.pId + "' name='nameano' " + stats + " onfocus='this.blur();'></input>";
            aObj.before(editStr);
            var btn = $("#checkbox_" + treeNode.id + "_" + treeNode.pId);
            if (btn) {
                btn.bind("click", function () { Anocheckmap(treeNode, btn); });
            }
            aObj.bind("click", function () { Anocheck2(treeNode, btn); });
        }


    }
}
function check2(treeNode, btn) {
    if (!btn[0].checked) {
        btn[0].checked = true
        checkmap(treeNode, btn);
    }
}
function checkmap(treeNode, btn) {
    var type = treeNode.layerurl;
    switch (type) {
        case "0":
            ttdEMapLayer.setVisibility(true);
            ttdEMapLayerWenzi.setVisibility(true);
            ttdMapLayer.setVisibility(false);
            ttdMapLayerWenzi.setVisibility(false);
            break;
        case "1":
            ttdEMapLayer.setVisibility(false);
            ttdEMapLayerWenzi.setVisibility(false);
            ttdMapLayer.setVisibility(true);
            ttdMapLayerWenzi.setVisibility(true);
            break;
    }
    var a = document.getElementById("checkbox_33_3");
    if (!a.checked) {
        a.checked = true;
    }
}
function Anocheck2(treeNode, btn) {
    if (btn[0].checked) {
        btn[0].checked = false
    } else {
        btn[0].checked = true;
    }
    Anocheckmap(treeNode, btn)
}
function Anocheckmap(treeNode, btn) {
    var type = treeNode.layerurl;
    var namemap = document.getElementsByName('namemap');
    for (var i = 0; i < namemap.length; i++) {
        if (namemap[i].checked == true) {
            type = namemap[i].id;
        }
    }
    switch (type) {
        case "radio_32_3":
            //ttdEMapLayer.setVisibility(true);
            ttdEMapLayerWenzi.setVisibility(!ttdEMapLayerWenzi.visible);
            break;
        case "radio_31_3":
            //ttdMapLayer.setVisibility(true);
            ttdMapLayerWenzi.setVisibility(!ttdMapLayerWenzi.visible);
            break;
    }
}
function check1(treeNode, btn) {
    if (btn[0].checked) {
        btn[0].checked = false
    } else {
        btn[0].checked = true;
    }
    checkBrand(treeNode, btn)
}
var checkarray = [];
function checkBrand(treeNode, btn) {
    layertreeobj.selectNode(treeNode);
    //alert(treeNode.layerurl + btn[0].checked)
    var layerurl = treeNode.layerurl;
    var id = treeNode.id.toString();
    var checked = btn[0].checked;
    if (checked) {
        var layerradio = new esri.layers.ArcGISDynamicMapServiceLayer(layerurl, { id: id });
        layerradio.setOpacity(0.9);
        map.addLayer(layerradio);
        //mapToCenter();
        checkarray.push(id);
        currentlayer = id;
    } else {
        if (map.getLayer(id) != undefined)
            map.removeLayer(map.getLayer(id));
        var index = checkarray.indexOf(id);
        if (index > -1) {
            checkarray.splice(index, 1);
        }
        currentlayer = "";
    }
}
function check(treeNode, btn) {
    if (!btn[0].checked) {
        btn[0].checked = true
    } else {
        btn[0].checked = false;
    }
    checkAccessories(treeNode, btn)
}
function checkAccessories(treeNode, btn) {

    layertreeobj.selectNode(treeNode);
    //alert(treeNode.layerurl + btn[0].checked)
    var layerurl = arcgisurl + treeNode.layerurl;
    var checked = btn[0].checked;
    if (map.getLayer("layerradio") != undefined)
        map.removeLayer(map.getLayer("layerradio"));
    if (layerurl.length < 7) {
        alert("暂无图层数据")
    } else if (checked) {
        var layerradio = new esri.layers.ArcGISDynamicMapServiceLayer(layerurl, { id: "layerradio" });
        layerradio.setOpacity(0.9);
        map.addLayer(layerradio);
        //mapToCenter();
        currentlayer = "layerradio";
    }
}
function ridiocheck(treeNode, btn) {
    btn[0].checked = false;
}
//节点点击事件
function zTreeOnClick(event, treeId, treeNode) {
    //选中当前节点
    layertreeobj.checkNode(treeNode, true, false);

    roleid = treeNode.id;
    alert(roleid);
}

//选中事件
function onCheck(event, treeId, treeNode) {
    //treeNode.checked = true;
    //$.fn.zTree.getZTreeObj("roleTree").updateNode(treeNode);
    //var zTree = $.fn.zTree.getZTreeObj("roleTree");
    layertreeobj.selectNode(treeNode);
    layertreeobj.checkNode(treeNode, true, false);
    //触发点击事件
    zTreeOnClick(event, treeId, treeNode);
}

//项目查询以及增改项目空间信息
function query(type) {
    $('#table').bootstrapTable('destroy').bootstrapTable({
        onPageChange: function (number, size) {
            pageNumber = number;
            pageSize = size;
            pagedata();
        },
        onDblClickRow: function onDblClickRow(row) {
            if (type == "q") {
                if (row.lat != "" && row.lon != "") {
                    mapclear();
                    Location(row.id, parseFloat(row.lat), parseFloat(row.lon), row.scope);
                    if (row.scope != "") {
                        if (map.getLayer("Projscope") != undefined)
                            map.removeLayer(map.getLayer("Projscope"));
                        var Projscope = new esri.layers.GraphicsLayer({ id: "Projscope" });
                        map.addLayer(Projscope);
                        var lineArr = new Array();
                        var scs = row.scope.split(';');
                        for (var i = 0 ; i < scs.length; i++) {
                            if (scs[i] == "") continue;
                            var sc = scs[i].split(',');
                            var line = new Array();
                            line[0] = parseFloat(sc[0]);
                            line[1] = parseFloat(sc[1]);
                            lineArr[i] = line;
                        }

                        var symbol24 = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1);
                        //var symbol48 = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOTDOT, new dojo.Color([255, 255, 153]), 1);
                        var geometry;
                        var graphic;
                        geometry = new esri.geometry.Polyline(lineArr)
                        graphic = new esri.Graphic(geometry, symbol24);
                        Projscope.add(graphic);

                    }
                } else {
                    alert("该项目没有中心点");
                    mapToCenter();
                    mapclear();
                    showinfo(row.id);
                }
            } else if (type == "a") {
                if (row.lat != "" && row.lon != "") {
                    var CenterPoint = new esri.geometry.Point({
                        latitude: parseFloat(row.lat),
                        longitude: parseFloat(row.lon)
                    });
                    map.centerAndZoom(CenterPoint, 16);
                    if (row.scope != "") {
                        if (map.getLayer("Projscope") != undefined)
                            map.removeLayer(map.getLayer("Projscope"));
                        var Projscope = new esri.layers.GraphicsLayer({ id: "Projscope" });
                        map.addLayer(Projscope);
                        var lineArr = new Array();
                        var scs = row.scope.split(';');
                        for (var i = 0 ; i < scs.length; i++) {
                            if (scs[i] == "") continue;
                            var sc = scs[i].split(',');
                            var line = new Array();
                            line[0] = parseFloat(sc[0]);
                            line[1] = parseFloat(sc[1]);
                            lineArr[i] = line;
                        }

                        var symbol24 = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1);
                        //var symbol48 = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOTDOT, new dojo.Color([255, 255, 153]), 1);
                        var geometry;
                        var graphic;
                        geometry = new esri.geometry.Polyline(lineArr)
                        graphic = new esri.Graphic(geometry, symbol24);
                        Projscope.add(graphic);

                    }
                } else {
                    mapToCenter();
                    alert("该项目没有中心点")
                }
            }

        },
        //responseHandler: handler,
        //responseHandler: function (result) {
        //    return {
        //        total: result.meta.pagination.total, //总页数,前面的key必须为"total"
        //        data: result.data //行数据，前面的key要与之前设置的dataField的值一致.
        //    };
        //},
        //height: $(window)[0].outerHeight - 300, //自定义表格的高度
        cache: false,
        //dataField: "data",
        //data: datalist,
        sidePagination: 'server',//指定服务器端分页
        pagination: true,
        pageNumber: 1,
        pageSize: 10,
        pageList: [10],
        sortable: true,
        //rowStyle: function (row, index) {
        //    var style = {};
        //    style = { css: { 'height': '10px' } };
        //    return style;
        //},
        columns: [{
            field: 'id',
            title: '序号',
            width: 7,
            formatter: function (value, row, index) {
                return index + 1;
            }
        }, {
            field: 'name',
            title: '名称',
            width: 15
        }
        //, {
        //    field: 'areaName',
        //    title: '所在区',
        //    width: 10
        //}, {
        //    field: 'address',
        //    title: '地点',
        //    width: 15
        //}, {
        //    field: 'period',
        //    title: '所属时代',
        //    width: 10
        //}, {
        //    field: 'startDate',
        //    title: '建设时间',
        //    width: 15
        //}, {
        //    field: 'unit',
        //    title: '建设单位',
        //    width: 15
        //}, {
        //    field: 'id',
        //    title: '操作',
        //    width: 15,
        //    formatter: function (value, row, index) {
        //        var str = "";
        //        if (row.lat != "" && row.lon != "" && row.scope != "") {
        //            //str += "<a href='javascript:void(0)' onclick='Location(" + row.id + "," + row.lat + "," + row.lon + ")' >定位</a>&nbsp;&nbsp;&nbsp;";
        //            str += "<a href='javascript:void(0)' onclick='AddLocation(" + row.id + ")' >更改项目中心</a>&nbsp;&nbsp;&nbsp;";
        //            str += "<a href='javascript:void(0)' onclick='editscope(" + row.id +  ",\"" + row.scope + "\")' >编辑项目范围</a>&nbsp;&nbsp;&nbsp;";
        //        } else if (row.lat != "" && row.lon != "" && row.scope == "") {
        //            //str += "<a href='javascript:void(0)' onclick='Location(" + row.id + "," + row.lat + "," + row.lon + ")' >定位</a>&nbsp;&nbsp;&nbsp;";
        //            str += "<a href='javascript:void(0)' onclick='AddLocation(" + row.id + ")' >更改项目中心</a>&nbsp;&nbsp;&nbsp;";
        //            str += "<a href='javascript:void(0)' onclick='Addscope(" + row.id + ",\"" + row.lat + "\",\"" + row.lon + "\")' >添加项目范围</a>&nbsp;&nbsp;&nbsp;";
        //        } else if (row.lat == "" && row.lon == "" && row.scope != "") {
        //            //str += "<a href='javascript:void(0)' onclick='statue(\"" + value + "\")' >定位</a>&nbsp;&nbsp;&nbsp;";
        //            str += "<a href='javascript:void(0)' onclick='AddLocation(" + row.id + ")' >添加项目中心</a>&nbsp;&nbsp;&nbsp;";
        //            str += "<a href='javascript:void(0)' onclick='editscope(" + row.id + ",\"" + row.scope + "\")' >编辑项目范围</a>&nbsp;&nbsp;&nbsp;";
        //        } else if (row.lat == "" && row.lon == "" && row.scope == "") {
        //            str += "<a href='javascript:void(0)' onclick='AddLocation(" + row.id + ")' >添加项目中心</a>&nbsp;&nbsp;&nbsp;";
        //            str += "<a href='javascript:void(0)' onclick='Addscope(" + row.id + ",\"" + row.lat + "\",\"" + row.lon + "\")' >添加项目范围</a>&nbsp;&nbsp;&nbsp;";
        //        }
        //        return str;
        //    }

        //}
        ]
    });
    pagedata();
}
function pagedata() {
    var Options = $('#table').bootstrapTable('getOptions');

    $.ajax({
        type: "GET",
        url: apiurl + "query_project",
        data: {
            pageNo: Options.pageNumber,
            pageSize: Options.pageSize,
            pName: $("#proname11").val(),
            addr: $("#addr").val(),
            sDate: $("#start").val(),
            eDate: $("#end").val()
        },
        dataType: "json",
        async: false,
        success: function (json) {
            if (json.code == 1000) {
                //total = json.meta.pagination.total;
                //json.total = json.meta.pagination.total;
                $('#table').bootstrapTable('load', json.data);
            } else if (json.code == 1001) {
                json.data.rows = [];
                $('#table').bootstrapTable('load', json.data);
            } else if (json.code == 1002) {
                alert("接口异常");
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });
}
function Location(id, lat, lon, scope) {
    if (map.getLayer("ProjLayer") != undefined)
        map.removeLayer(map.getLayer("ProjLayer"));
    var graphicsLayer = new esri.layers.GraphicsLayer({ id: "ProjLayer" });
    map.addLayer(graphicsLayer);
    //var data = json.data.pGis;
    var Icon = new esri.symbol.PictureMarkerSymbol("../images/civil_engineer.png", 32, 32);
    Icon.setOffset(0, 18);
    var geometry = new esri.geometry.Point(lon, lat, map.spatialReference);
    var graphic = new esri.Graphic(geometry, Icon, { "projectId": id });
    graphicsLayer.add(graphic);
    graphicsLayer.on("click", function (result) {
        var graphic = result["graphic"];
        var projectCode = graphic.attributes.projectId;
        //alert(projectCode)
        showinfo(projectCode);
    });
    //if (scope != "") {
    //    if (map.getLayer("Projscope") != undefined)
    //        map.removeLayer(map.getLayer("Projscope"));
    //    var Projscope = new esri.layers.GraphicsLayer({ id: "Projscope" });
    //    map.addLayer(Projscope);
    //    var lineArr = new Array();
    //    var scs = scope.split(';');
    //    for (var i = 0 ; i < scs.length; i++) {
    //        if (scs[i] == "") continue;
    //        var sc = scs[i].split(',');
    //        lineArr[i] = sc;
    //    }

    //    var symbol24 = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1);
    //    //var symbol48 = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOTDOT, new dojo.Color([255, 255, 153]), 1);
    //    var geometry;
    //    var graphic;
    //    geometry = new esri.geometry.Polyline(lineArr)
    //    graphic = new esri.Graphic(geometry, symbol24);
    //    Projscope.add(graphic);

    //}
    var CenterPoint = new esri.geometry.Point({
        latitude: lat,
        longitude: lon
    });
    map.centerAndZoom(CenterPoint, 16);
    //showinfo(id)
}
var Drawtool;
var drawid = "";
function AddLocation(id) {
    drawid = id;
    $(".drag").hide();
    $("#prodetail").hide();
    Drawtool = new esri.toolbars.Draw(map);
    Drawtool.activate("point");
    Drawtool.on("draw-end", addLocationToMap);
}
function addLocationToMap(evt) {
    var symbol = new esri.symbol.SimpleMarkerSymbol();
    Drawtool.deactivate();
    //map.showZoomSlider();

    var graphic = new esri.Graphic(evt.geometry, symbol);
    map.graphics.add(graphic);
    //写入数据库
    $.ajax({
        type: "GET",
        url: apiurl + "saveOrModify",
        data: {
            pId: drawid,
            lat: evt.geometry.y,
            lon: evt.geometry.x
        },
        dataType: "json",
        async: false,
        success: function (json) {
            if (json.code = 1000) {
                alert(json.msg);
            } else if (json.code = 1001) {
                alert("添加失败");
            } else if (json.code = 1002) {
                alert("添加失败");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });
    map.graphics.clear();
    pagedata();
    //$("#querydiv").show(); 
    showinfo(drawid)
    $.ajax({
        type: "GET",
        url: apiurl + "query_project",
        data: {
            pageSize: -1
        },
        dataType: "json",
        async: false,
        success: function (json) {
            if (json.code = 1000) {
                if (map.getLayer("ProjLayer") != undefined)
                    map.removeLayer(map.getLayer("ProjLayer"));
                var graphicsLayer = new esri.layers.GraphicsLayer({ id: "ProjLayer" });
                map.addLayer(graphicsLayer);
                var data = json.data.pGis;
                var Icon = new esri.symbol.PictureMarkerSymbol("../View/civil_engineer.png", 32, 32);
                Icon.setOffset(0, 18);
                for (var i = 0 ; i < data.length; i++) {
                    var geometry = new esri.geometry.Point(data[i].lon, data[i].lat, map.spatialReference);
                    var graphic = new esri.Graphic(geometry, Icon, data[i]);
                    graphicsLayer.add(graphic);
                }

                graphicsLayer.on("click", function (evt) {
                    var graphic = evt["graphic"];
                    var CenterPoint = new esri.geometry.Point({
                        latitude: parseFloat(evt.graphic.geometry.y),
                        longitude: parseFloat(evt.graphic.geometry.x)
                    });
                    map.centerAndZoom(CenterPoint, 16);
                    showinfo(graphic.attributes.projectId);
                });
            } else if (json.code = 1001) {
                alert("获取信息失败");
            } else if (json.code = 1002) {
                alert("接口异常");
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });
    drawid = "";
}
var scopeid = "";
function Addscope1(id, lat, lon) {
    scopeid = id;
    $('#myModal').modal('show');
    //setTimeout("sadd('" + id + "','" + lat + "','" + lon + "')", 1500)
    var mapadd = document.getElementById('mapadd');
    mapadd.onclick = null;
    $('#mapadd').click(function () {
        $('#myModal').modal('hide');
        Addscope(id, lat, lon)
    })
    var txtadd = document.getElementById('txtadd');
    txtadd.onclick = null;
    $('#txtadd').click(function () {
        $('#myModal').modal('hide');
        //txtadd(id, lat, lon)
        //$("#upload").click();
        var upload = document.getElementById("upload");
        upload.click();
    })
}
/**
 * 点击触发
 */
function fileUpload_onclick() {
}
/**
 * 选中文件后触发
 * 直接前台解析txt文件。使用的是FileReader对象
 */
function fileUpload_onselect() {
    //console.log("onselect");
    //var path = $("#upload").val();//文件路径
    //console.log(path);
    var selectedFile = document.getElementById("upload").files[0];
    var name = selectedFile.name;//读取选中文件的文件名
    var size = selectedFile.size;//读取选中文件的大小
    console.log("wenjianming:" + name + "daxiao:" + size);
    var reader = new FileReader();//这是核心！！读取操作都是由它完成的
    reader.onload = function (oFREvent) {//读取完毕从中取值
        var Txt = oFREvent.target.result;
        polygon2map(Txt);
    }
    reader.readAsText(selectedFile, "UTF-8");
}
function polygon2map(txt) {
    var tatdata = JSON.parse(txt);
    var type = tatdata.type;
    var data = tatdata.data;
    if (tatdata == null || tatdata.type == null || tatdata.data == null || tatdata.type != "polygon") {
        alert("文本格式错误");
        return;
    }
    var jdata = data.split(';');
    var latlngs = [];
    for (var i = 0 ; i < jdata.length; i++) {
        if (jdata[i] == "") continue;
        var jd = jdata[i].split(',');
        var line = new Array();
        line[0] = parseFloat(jd[0]);
        line[1] = parseFloat(jd[1]);
        latlngs[i] = line;
    }
    var symbol24 = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1);
    var geometry = new esri.geometry.Polygon(latlngs)
    var graphic = new esri.Graphic(geometry, symbol24);
    map.graphics.add(graphic);
    map.setExtent(geometry.getExtent());
    //写入数据库
    $.ajax({
        type: "GET",
        url: apiurl + "saveOrModify",
        data: {
            pId: scopeid,
            scope: data
        },
        dataType: "json",
        async: false,
        success: function (json) {
            if (json.code = 1000) {
                alert(json.msg);
                $("#prodetail").hide();
            } else if (json.code = 1001) {
                alert("添加失败");
            } else if (json.code = 1002) {
                alert("添加失败");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });
}
function Addscope(id, lat, lon) {
    if (lat == "" || lon == "") {
        alert("请首先确定项目中心点");
        return;
    } else {
        if (map.getLayer("ProjLayer") != undefined)
            map.removeLayer(map.getLayer("ProjLayer"));
        var graphicsLayer = new esri.layers.GraphicsLayer({ id: "ProjLayer" });
        map.addLayer(graphicsLayer);
        //var data = json.data.pGis;
        var Icon = new esri.symbol.PictureMarkerSymbol("../images/civil_engineer.png", 32, 32);
        Icon.setOffset(0, 18);
        var geometry = new esri.geometry.Point(parseFloat(lon), parseFloat(lat), map.spatialReference);
        var graphic = new esri.Graphic(geometry, Icon, { "projectId": id });
        graphicsLayer.on("click", function (evt) {
            var graphic = evt["graphic"];
            var CenterPoint = new esri.geometry.Point({
                latitude: parseFloat(evt.graphic.geometry.y),
                longitude: parseFloat(evt.graphic.geometry.x)
            });
            map.centerAndZoom(CenterPoint, 16);
            showinfo(graphic.attributes.projectId);
        });
        graphicsLayer.add(graphic);
        var CenterPoint = new esri.geometry.Point({
            latitude: parseFloat(lat),
            longitude: parseFloat(lon)
        });
        map.centerAndZoom(CenterPoint, 16);
    }
    if (mapclick != null) {
        mapclick.remove();
        Edittool._tool = 0;
        Edittool.deactivate();
    }
    map.graphics.clear();
    drawid = id;
    $(".drag").hide();
    $("#prodetail").hide();
    Drawtool = new esri.toolbars.Draw(map);
    Drawtool.activate("polygon");
    Drawtool.on("draw-end", addscopeToMap);
}
function addscopeToMap(evt) {
    var symbol = new esri.symbol.SimpleFillSymbol();
    Drawtool.deactivate();
    //map.showZoomSlider();

    var graphic = new esri.Graphic(evt.geometry, symbol);
    map.graphics.add(graphic);
    var rings = evt.geometry.rings[0];
    var scopestr = "";
    for (var i = 0 ; i < rings.length ; i++) {
        scopestr += rings[i][0] + "," + rings[i][1] + ";";
    }
    //写入数据库
    $.ajax({
        type: "GET",
        url: apiurl + "saveOrModify",
        data: {
            pId: drawid,
            scope: scopestr
        },
        dataType: "json",
        async: false,
        success: function (json) {
            if (json.code = 1000) {
                alert(json.msg);
            } else if (json.code = 1001) {
                alert("添加失败");
            } else if (json.code = 1002) {
                alert("添加失败");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });
    map.graphics.clear();
    //$("#querydiv").show();
    //pagedata();
    showinfo(drawid);
    drawid = "";
}

var Edittool;
var editid = "";
var mapclick;
function editscope(id, scope, lat, lon) {

    editid = id;
    mapclear();
    $(".drag").hide();
    $("#prodetail").hide();
    Edittool = null;
    Edittool = new esri.toolbars.Edit(map);
    var lineArr = new Array();
    var scs = scope.split(';');
    for (var i = 0 ; i < scs.length; i++) {
        if (scs[i] == "") continue;
        var sc = scs[i].split(',');
        var line = new Array();
        line[0] = parseFloat(sc[0]);
        line[1] = parseFloat(sc[1]);
        lineArr[i] = line;
    }

    var symbol24 = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT,
    new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
    //var symbol48 = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOTDOT, new dojo.Color([255, 255, 153]), 1);
    var geometry;
    var graphic;
    var editProj = new esri.layers.GraphicsLayer({ id: "editProj" });
    geometry = new esri.geometry.Polygon(lineArr)
    graphic = new esri.Graphic(geometry, symbol24);
    editProj.add(graphic);
    map.addLayer(editProj);

    map.setExtent(geometry.getExtent());
    //map.centerAt(geometry)
    var clickfirst = true;
    editProj.on("click", function (evt) {
        if (clickfirst) {
            var options = {
                allowAddVertices: "true",
                allowDeleteVertices: "true"
                //,
                //uniformScaling: "true"
            };
            Edittool.activate(15, evt.graphic, options);
            dojo.stopEvent(evt);
            clickfirst = false;

        }
    });

    //deactivate the toolbar when you click outside a graphic
    mapclick = map.on("click", function (evt) {
        if (Edittool._tool != 0) {

            var rings = Edittool._graphic.geometry.rings[0];
            var scopestr = "";
            for (var i = 0 ; i < rings.length ; i++) {
                scopestr += rings[i][0] + "," + rings[i][1] + ";";
            }
            //写入数据库
            $.ajax({
                type: "GET",
                url: apiurl + "saveOrModify",
                data: {
                    pId: editid,
                    scope: scopestr
                },
                dataType: "json",
                async: false,
                success: function (json) {
                    if (json.code = 1000) {
                        alert(json.msg);
                        if (map.getLayer("ProjLayer") != undefined)
                            map.removeLayer(map.getLayer("ProjLayer"));
                        var graphicsLayer = new esri.layers.GraphicsLayer({ id: "ProjLayer" });
                        map.addLayer(graphicsLayer);
                        //var data = json.data.pGis;
                        var Icon = new esri.symbol.PictureMarkerSymbol("../images/civil_engineer.png", 32, 32);
                        Icon.setOffset(0, 18);
                        var geometry = new esri.geometry.Point(parseFloat(lon), parseFloat(lat), map.spatialReference);
                        var graphic = new esri.Graphic(geometry, Icon, { "projectId": id });
                        graphicsLayer.on("click", function (evt) {
                            var graphic = evt["graphic"];
                            var CenterPoint = new esri.geometry.Point({
                                latitude: parseFloat(evt.graphic.geometry.y),
                                longitude: parseFloat(evt.graphic.geometry.x)
                            });
                            map.centerAndZoom(CenterPoint, 16);
                            showinfo(graphic.attributes.projectId);
                        });
                        graphicsLayer.add(graphic);
                        var CenterPoint = new esri.geometry.Point({
                            latitude: parseFloat(lat),
                            longitude: parseFloat(lon)
                        });
                        map.centerAndZoom(CenterPoint, 16);
                    } else if (json.code = 1001) {
                        alert("添加失败");
                    } else if (json.code = 1002) {
                        alert("添加失败");
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                }
            });
            Edittool.deactivate();
            //map.graphics.clear();
            //$("#querydiv").show();
            //pagedata();
            showinfo(editid)
            editid = "";
        }
        mapclick.remove();
    });
}

//统计
function groupChange() {
    showstatic();
}
function showstatic() {
    $("#querydiv").hide();
    var group = $("#groupName").val();
    var text = $("#groupName").find("option:selected").text();
    $.ajax({
        type: "GET",
        url: apiurl + "groupCount",
        data: {
            groupName: group
        },
        dataType: "json",
        //async: false,
        success: function (json) {
            if (json.code = 1000) {
                var x = []; var y = [];
                for (var i = 0 ; i < json.data.groups.length; i++) {
                    x.push(json.data.groups[i].value);
                    y.push(json.data.groups[i].count);
                }
                $('#chart1').highcharts({
                    chart: {
                        type: 'column'
                    },
                    title: {
                        text: text + '统计'
                    },
                    credits: {
                        enabled: false
                    },
                    xAxis: {
                        type: 'category',
                        labels: {
                            rotation: -45,
                            style: {
                                fontSize: '13px',
                                fontFamily: 'Verdana, sans-serif'
                            }
                        },
                        categories: x
                    },
                    yAxis: {
                        min: 0,
                        allowDecimals: false,
                        title: {
                            text: '项目个数'
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    tooltip: {
                        pointFormat: '<b>{point.y} 个</b>'
                    },
                    series: [{
                        name: text,
                        data: y
                        //,
                        //dataLabels: {
                        //    enabled: true,
                        //    rotation: -90,
                        //    color: '#FFFFFF',
                        //    align: 'right',
                        //    format: '{point.y:.1f}', // one decimal
                        //    y: 10, // 10 pixels down from the top
                        //    style: {
                        //        fontSize: '13px',
                        //        fontFamily: 'Verdana, sans-serif'
                        //    }
                        //}
                    }
                    ]
                });
            } else if (json.code = 1001) {
                alert("获取信息失败");
            } else if (json.code = 1002) {
                alert("接口异常");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });
}
//空间分析
function heatmap1() {

    heatLayer = new HeatmapLayer({
        config: {
            "useLocalMaximum": true,
            "radius": 40,
            "gradient": {
                0.45: "rgb(000,000,255)",
                0.55: "rgb(000,255,255)",
                0.65: "rgb(000,255,000)",
                0.95: "rgb(255,255,000)",
                1.00: "rgb(255,000,000)"
            }
        },
        "map": map,
        "domNodeId": "heatLayer",
        "opacity": 0.85
    });
    map.addLayer(heatLayer);
    map.resize();
}

function heatmap2() {
    var layerDefinition = {
        "geometryType": "esriGeometryPoint",
        "fields": [{
            "name": "ID",
            "type": "esriFieldTypeInteger",
            "alias": "ID"
        }]
    }
    var featureCollection = {
        layerDefinition: layerDefinition,
        featureSet: null
    };
    //创建FeatureLayer图层
    var featureLayer = new esri.layers.FeatureLayer(featureCollection, {
        mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        outFields: ["*"],
        opacity: 1
    });

    var heatmapRenderer = new esri.renderers.HeatmapRenderer({
        colors: ["rgba(255, 0, 0, 0)", "rgb(0, 255, 0)", "rgb(255, 255, 0)", "rgb(255, 0, 0)"],
        blurRadius: 8,
        maxPixelIntensity: 230,
        minPixelIntensity: 10
    });
    //设置渲染方式
    featureLayer.setRenderer(heatmapRenderer);//heatmapRendererhtml中创建的渲染器
    map.addLayer(featureLayer);
    var heatDataUrl = "https://lxqjss.github.io/data/heatJson.json";
    $.getJSON(heatDataUrl, {}, function (data, textStatus, jqXHR) {

        for (var i = 0; i < data.heatData.length; i++) {
            var x = data.heatData[i].lng;
            var y = data.heatData[i].lat;
            var point = new esri.geometry.Point(x, y, new esri.SpatialReference({ wkid: 4326 }));//初始化起点
            featureLayer.add(new esri.Graphic(point));
        }

    });

}
function heatmap3() {
    mapclear();
    $("#querydiv").hide();
    initheatmap();
    heatLayer = new HeatmapLayer({
        config: {
            "useLocalMaximum": true,
            "radius": 40,
            "gradient": {
                0.45: "rgb(000,000,255)",
                0.55: "rgb(000,255,255)",
                0.65: "rgb(000,255,000)",
                0.95: "rgb(255,255,000)",
                1.00: "rgb(255,000,000)"
            }
        },
        "map": map,
        "domNodeId": "heatLayer",
        "opacity": 0
    }, "heatLayer");
    map.addLayer(heatLayer);
    map.resize();

    $.ajax({
        type: "GET",
        url: apiurl + "query_project",
        data: {
            pageSize: -1
        },
        dataType: "json",
        async: false,
        success: function (json) {
            if (json.code = 1000) {
                var multiPoint = new esri.geometry.Multipoint(map.spatialReference);
                var data = json.data.pGis;
                var Heatmapdata = [];
                for (var i = 0 ; i < data.length; i++) {
                    var geometry = new esri.geometry.Point(data[i].lon, data[i].lat, map.spatialReference);
                    var graphic = new esri.Graphic(geometry, null, data[i]);
                    Heatmapdata.push(graphic);
                    multiPoint.addPoint(geometry);
                }
                if (multiPoint.points.length == 1) {
                    var CenterPoint = multiPoint.points[0];
                    map.centerAndZoom(CenterPoint, map.getZoom() + 3);
                } else {
                    map.setExtent(multiPoint.getExtent());
                }
                heatLayer.setData(Heatmapdata);

            } else if (json.code = 1001) {
                alert("获取信息失败");
            } else if (json.code = 1002) {
                alert("接口异常");
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });

}
var geometryService;
var bufferDistince;
function modelbufferclick() {
    $('#bufferModal').modal('show')
}
function bufferclick() {
    $('#bufferModal').modal('hide')
    mapclear();
    $("#querydiv").hide();
    geometryService = new esri.tasks.GeometryService(arcgisurl + "/Utilities/Geometry/GeometryServer");

    var strbufferDistince = $("#bufferdistince").val();
    if (strbufferDistince == "") {
        alert("缓冲区半径不能为空");
        return;
    }
    bufferDistince = parseInt(strbufferDistince);
    if (isNaN(bufferDistince)) {
        alert("缓冲区半径必须是数字");
        return;
    }
    initpro("layerBuffer");

}

function doBuffer(graphic) {

    var params = new esri.tasks.BufferParameters();
    geometryService.on("buffer-complete", function (result) {
        // draw the buffer geometry on the map as a map graphic
        //MyMap.graphics.remove(graphic);

        map.graphics.clear();
        var symbol = new esri.symbol.SimpleFillSymbol(
            esri.symbol.SimpleFillSymbol.STYLE_NULL,
            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0]), 2), new dojo.Color([255, 255, 0, 0.25])
        );
        var bufferGeometry = result.geometries[0]
        var graphic = new esri.Graphic(bufferGeometry, symbol);
        graphic.circle = "circle";
        map.graphics.add(graphic);
        preGraphic = graphic;
        var center = graphic.geometry.getExtent().getCenter();
        //map.setExtent(graphic.geometry.getExtent().expand(2));//100%放大
        center = new esri.geometry.Point(center.x, center.y, new esri.SpatialReference({ wkid: 4326 }));
        map.centerAndZoom(center, 13);
        addanalyticslayer();
    });
    params.distances = [bufferDistince];
    params.outSpatialReference = map.spatialReference;
    params.unit = esri.tasks.GeometryService.UNIT_METER;
    params.geometries = [graphic.geometry];
    params.geodesic = true;
    geometryService.buffer(params)
}
function showBuffer(bufferedGeometries) {
    mapclear();
    var symbol = new esri.symbol.SimpleFillSymbol(
              esri.symbol.SimpleFillSymbol.STYLE_NULL,
              new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SHORTDASHDOTDOT, new dojo.Color([255, 255, 0]), 2), new dojo.Color([255, 255, 0, 0.25])
          );
    var bufferGeometry = result.geometries[0]
    var graphic = new esri.Graphic(bufferGeometry, symbol);
    graphic.circle = "circle";
    map.graphics.add(graphic);
    preGraphic = graphic;
    var center = graphic.geometry.getExtent().getCenter();
    //map.setExtent(graphic.geometry.getExtent().expand(2));//100%放大
    center = new esri.geometry.Point(center.x, center.y, new esri.SpatialReference({ wkid: 4326 }));
    map.centerAndZoom(center, 10);
}
var linebufferDistince, linegeometryService;
function modellinebufferclick() {
    $('#bufferModal1').modal('show')
}
function linebufferclick() {
    $('#bufferModal1').modal('hide');
    mapclear();
    $("#querydiv").hide();
    geometryService = new esri.tasks.GeometryService(arcgisurl + "/Utilities/Geometry/GeometryServer");
    var strbufferDistince = $("#linebufferdistince").val();
    if (strbufferDistince == "") {
        alert("缓冲区半径不能为空");
        return;
    }
    linebufferDistince = parseInt(strbufferDistince);
    if (isNaN(linebufferDistince)) {
        alert("缓冲区半径必须是数字");
        return;
    }
    Drawtool = new esri.toolbars.Draw(map);
    Drawtool.activate("polyline");
    Drawtool.on("draw-end", linebuffer);
}
function linebuffer(evt) {
    map.graphics.clear();
    var geometry = evt.geometry;
    var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 1);
    var graphic = new esri.Graphic(geometry, symbol);
    map.graphics.add(graphic);

    var params22 = new esri.tasks.BufferParameters();
    geometryService.on("buffer-complete", function (result) {
        //alert(222)
        // draw the buffer geometry on the map as a map graphic
        //MyMap.graphics.remove(graphic);

        var symbol = new esri.symbol.SimpleFillSymbol(
            esri.symbol.SimpleFillSymbol.STYLE_NULL,
            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0]), 2), new dojo.Color([255, 255, 0, 0.25])
        );
        var bufferGeometry = result.geometries[0]
        var graphic = new esri.Graphic(bufferGeometry, symbol);
        //graphic.circle = "circle";
        map.graphics.add(graphic);
        preGraphic = graphic;
        var center = graphic.geometry.getExtent().getCenter();
        //map.setExtent(graphic.geometry.getExtent().expand(2));//100%放大
        center = new esri.geometry.Point(center.x, center.y, new esri.SpatialReference({ wkid: 4326 }));
        map.centerAndZoom(center, 13);
        addanalyticslayer();
    });
    params22.distances = [linebufferDistince];
    params22.outSpatialReference = map.spatialReference;
    params22.bufferSpatialReference = new esri.SpatialReference({ wkid: 32651 });
    params22.unit = esri.tasks.GeometryService.UNIT_METER;
    require(["esri/geometry/normalizeUtils"], function (normalizeUtils) {
        normalizeUtils.normalizeCentralMeridian([geometry], geometryService).then(function (normalizedGeometries) {
            var normalizedGeometry = normalizedGeometries[0];
            if (normalizedGeometry.type === "polygon") {
                geometryService.simplify([normalizedGeometry], function (geometries) {
                    params22.geometries = geometries;
                    geometryService.buffer(params22, showlineouterBuffer);
                });
            } else {
                params22.geometries = [normalizedGeometry];
                geometryService.buffer(params22);
            }

        });
    });
    //params22.geometries = [geometry];
    ////params.geodesic = true;
    //geometryService.buffer(params22)
}
function showlineouterBuffer(bufferedGeometries) {
    alert(111)
    var symbol = new esri.symbol.SimpleFillSymbol(
       esri.symbol.SimpleFillSymbol.STYLE_SOLID,
      new esri.symbol.SimpleLineSymbol(
         esri.symbol.SimpleLineSymbol.STYLE_SOLID,
        new dojo.Color([255, 0, 0, 0.65]), 2
      ),
      new dojo.Color([255, 0, 0, 0.35])
    );

    array.forEach(bufferedGeometries, function (geometry) {
        var graphic = new Graphic(geometry, symbol);
        map.graphics.add(graphic);
    });

}


var clickGraphicsLayer;
function clusterlayer() {
    mapclear();

    $("#querydiv").hide();
    $.ajax({
        type: "GET",
        url: apiurl + "query_project",
        data: {
            pageSize: -1
        },
        dataType: "json",
        async: false,
        success: function (json) {
            if (json.code = 1000) {
                var multiPoint = new esri.geometry.Multipoint(map.spatialReference);
                var data = json.data.pGis;
                var newdata = [];
                for (var i = 0 ; i < data.length; i++) {
                    var geometry = new esri.geometry.Point(data[i].lon, data[i].lat, map.spatialReference);
                    var graphic = new esri.Graphic(geometry, null, data[i]);
                    newdata.push({
                        "x": data[i].lon,
                        "y": data[i].lat,
                        "attributes": data[i]
                    });
                    multiPoint.addPoint(geometry);
                }
                //for (var i = 0 ; i < 1000; i++) {
                //    var r = Math.random();
                //    var r1 = Math.random();
                //    var geometry = new esri.geometry.Point(120 + r, 30 + r1, map.spatialReference);
                //    var graphic = new esri.Graphic(geometry, null, data[i]);
                //    newdata.push({
                //        "x": 120 + r,
                //        "y": 30 + r1,
                //        "attributes": { projectId:64,name:"ceshi"}
                //    });
                //    multiPoint.addPoint(geometry);
                //}
                if (multiPoint.points.length == 1) {
                    var CenterPoint = multiPoint.points[0];
                    map.centerAndZoom(CenterPoint, map.getZoom() + 3);
                } else {
                    map.setExtent(multiPoint.getExtent());
                }
                var graphic_back, textgraphic;
                clickGraphicsLayer = new ClusterLayer({
                    "data": newdata,
                    "distance": 50,
                    "id": "ClusterLayer",
                    "labelColor": "#fff",
                    "labelOffset": 5,
                    "resolution": map.extent.getWidth() / map.width,
                    "maxSingles": newdata.length,
                    "singleSymbol": "#888"
                });
                clickGraphicsLayer.on("mouse-over", function (result) {
                    var graphic = result["graphic"];
                    map.setMapCursor("pointer");
                    if (graphic.attributes.clusterCount == 1) {
                        for (var i = 0, il = this._clusterData.length; i < il; i++) {
                            if (graphic.attributes.clusterId == this._clusterData[i].attributes.clusterId) {
                                var attr = this._clusterData[i];

                                var point = new esri.geometry.Point(attr.x, attr.y);
                                var text = attr["attributes"]["name"];

                                var textback = new esri.symbol.PictureMarkerSymbol('/images/textback.png', text.length * 14 + 20, 30);
                                textback.setOffset(text.length * 7 + 30, 5);
                                graphic_back = new esri.Graphic(point, textback);
                                map.graphics.add(graphic_back);

                                var font = new esri.symbol.Font("14px", esri.symbol.Font.STYLE_NORMAL, esri.symbol.Font.VARIANT_NORMAL, esri.symbol.Font.WEIGHT_NORMAL, "Microsoft YaHei").setDecoration("none");
                                var label = new esri.symbol.TextSymbol(text, font)
                                    .setColor(new dojo.Color([255, 255, 255]))
                                    .setOffset(text.length * 7 + 30, 0);
                                textgraphic = new esri.Graphic(point, label);
                                map.graphics.add(textgraphic);
                            }
                        }
                    }
                });

                clickGraphicsLayer.on("mouse-out", function (result) {
                    var graphic = result["graphic"];
                    map.setMapCursor("default");
                    if (graphic.attributes.clusterCount == 1) {
                        map.graphics.remove(graphic_back);
                        map.graphics.remove(textgraphic);
                    }
                });
                var defaultSym = new esri.symbol.SimpleMarkerSymbol().setSize(4);
                var renderer = new esri.renderer.ClassBreaksRenderer(defaultSym, "clusterCount");

                var oneIcon = new esri.symbol.PictureMarkerSymbol("../View/small.png", 32, 32);
                var multiIcon = new esri.symbol.PictureMarkerSymbol("../View/large.png", 64, 32).setOffset(-10, 10);
                renderer.addBreak(0, 2, oneIcon);
                renderer.addBreak(2, 10000, multiIcon);

                clickGraphicsLayer.setRenderer(renderer);
                map.addLayer(clickGraphicsLayer);

            } else if (json.code = 1001) {
                alert("获取信息失败");
            } else if (json.code = 1002) {
                alert("接口异常");
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });
}

function rangeanalytics() {
    mapclear();
    initpro("range");
    addanalyticslayer();
    $("#querydiv").show();
    query("a");
    var CenterPoint = new esri.geometry.Point({
        latitude: 30.235,
        longitude: 120.15
    });
    map.centerAndZoom(CenterPoint, 9);
}
function discover() {
    //removeanalytics();
    mapclear();
    map.graphics.clear();
    alert("请在地图上绘制发掘范围！！")
    Drawtool = new esri.toolbars.Draw(map);
    Drawtool.activate("polygon");
    Drawtool.on("draw-end", showdiscover);
}
function showdiscover(evt) {
    addanalyticslayer()
    //mapclear();
    var symbol = new esri.symbol.SimpleFillSymbol();
    Drawtool.deactivate();
    //map.showZoomSlider();

    var graphic = new esri.Graphic(evt.geometry, symbol);
    map.graphics.add(graphic);
}
function addanalyticslayer() {
    //行政区划
    var xzqhurl = "http://101.71.130.148:6080/arcgis/rest/services/ZTtest/HZdistrict/MapServer";
    var xzqhlayer = new esri.layers.ArcGISDynamicMapServiceLayer(xzqhurl, { id: "xzqhlayer" });
    xzqhlayer.setOpacity(0.4);
    map.addLayer(xzqhlayer);
    //建筑
    var jzurl = "http://101.71.130.148:6080/arcgis/rest/services/ZTtest/HZJZ/MapServer";
    var jzlayer = new esri.layers.ArcGISDynamicMapServiceLayer(jzurl, { id: "jzlayer" });
    //jzlayer.setOpacity(0.6);
    map.addLayer(jzlayer);
    //水系
    var sxurl = "http://101.71.130.148:6080/arcgis/rest/services/ZTtest/HZSX/MapServer";
    var sxlayer = new esri.layers.ArcGISDynamicMapServiceLayer(sxurl, { id: "sxlayer" });
    //sxlayer.setOpacity(0.6);
    map.addLayer(sxlayer);
    //道路
    var dlqhurl = "http://101.71.130.148:6080/arcgis/rest/services/ZTtest/HZroad/MapServer";
    var dllayer = new esri.layers.ArcGISDynamicMapServiceLayer(dlqhurl, { id: "dllayer" });
    //dllayer.setOpacity(0.6);
    map.addLayer(dllayer);

}
function removeanalytics() {
    if (map.getLayer("jzlayer") != undefined)
        map.removeLayer(map.getLayer("jzlayer"));
    if (map.getLayer("sxlayer") != undefined)
        map.removeLayer(map.getLayer("sxlayer"));
    if (map.getLayer("dllayer") != undefined)
        map.removeLayer(map.getLayer("dllayer"));
    if (map.getLayer("xzqhlayer") != undefined)
        map.removeLayer(map.getLayer("xzqhlayer"));
}
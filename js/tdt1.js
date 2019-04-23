//$(function () {
//    for (var i = 0; i < 8; i++) {
//        testConnection(i);
//    }
//})

//function testConnection(testID) {
//    $.ajax({
//        url: 'http://t' + testID + '.tianditu.com/img_c/wmts?SERVICE=WMTS&REQUEST=GetCapabilities',
//        type: 'GET',
//        complete: function (response) {
//            if (response.status == 200) {
//                if (serverID == undefined)
//                    serverID = testID;
//            }
//        }
//    });
//}

var serverID;
function initTianditu()
{
    if (serverID == undefined) {
        serverID = parseInt(7 * Math.random());
    }
	dojo.declare("TDTVecLayer", esri.layers.TiledMapServiceLayer, {
		constructor: function () {
		  this.spatialReference = new esri.SpatialReference({ wkid:4326 });  
		  this.initialExtent = (this.fullExtent =   
		  new esri.geometry.Extent(-180.0, -90.0, 180.0, 90.0, this.spatialReference));  
		  this.tileInfo = new esri.layers.TileInfo({  
				"rows" : 256,  
				"cols" : 256,  
				"compressionQuality" : 0,  
				"origin" : { "x" : -180,"y" : 90},  
				"spatialReference" : {"wkid" : 4326},  
				"lods": [
                    //限制缩小只能到全身级别 xlm 2016-08-26
                    { "scale": 590995197.14166909755553014475, "level": 0, "resolution": 1.40625 },
                    { "scale": 295497598.57083454877776507238, "level": 1, "resolution": 0.703125 },
                    { "scale": 147748799.28541727438888253619, "level": 2, "resolution": 0.3515625 },
                    { "scale": 73874399.642708637194441268094, "level": 3, "resolution": 0.17578125 },
                    { "scale": 36937199.821354318597220634047, "level": 4, "resolution": 0.087890625 },
                    { "scale": 18468599.910677159298610317023, "level": 5, "resolution": 0.0439453125 },
                    { "scale": 9234299.955338579649305158512, "level": 6, "resolution": 0.02197265625 },
                    { "scale": 4617149.9776692898246525792559, "level": 7, "resolution": 0.010986328125 },
                    { "scale": 2308574.9888346449123262896279, "level": 8, "resolution": 0.0054931640625 },
                    { "scale": 1154287.494417322456163144814, "level": 9, "resolution": 0.00274658203125 },
                    { "scale": 577143.74720866122808157240698, "level": 10, "resolution": 0.001373291015625 },
                    { "scale": 288571.87360433061404078620349, "level": 11, "resolution": 0.0006866455078125 },
                    { "scale": 144285.93680216530702039310175, "level": 12, "resolution": 0.00034332275390625 },
                    { "scale": 72142.968401082653510196550873, "level": 13, "resolution": 0.000171661376953125 },
                    { "scale": 36071.484200541326755098275436, "level": 14, "resolution": 0.0000858306884765625 },
                    { "scale": 18035.742100270663377549137718, "level": 15, "resolution": 0.00004291534423828125 },
                    { "scale": 9017.871050135331688774568859, "level": 16, "resolution": 0.000021457672119140625 },
                    { "scale": 4508.9355250676658443872844296, "level": 17, "resolution": 0.0000107288360595703125 }
				]
		  });  
		  this.loaded = true;  
		  this.onLoad(this); 
		},
		getTileUrl: function (level, row, col) {
		    //return "http://localhost:8808/project_gis/getVecFromUrl?serverID=" + serverID + "&level=" + level + "&row=" + row + "&col=" + col;
		    if (level <= 14)
		        return "http://116.62.152.138:8080/gisServer/proxy?http://t" + serverID + ".tianditu.gov.cn/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&STYLE=default&LAYER=vec&TILEMATRIXSET=c&TILEMATRIX=" + level + "&" + "TILEROW=" + row + "&" + "TILECOL=" + col+ "&tk=e5abca32c01cf5fa9a82cd58d677fddd";
            else
		        return "http://srv.zjditu.cn/ZJEMAP_2D/wmts?SERVICE=WMTS&Version=1.0.0&serviceMode=KVP&Request=GetTile&LAYER=chinaemap&TILEMATRIXSET=esritilematirx&TILEMATRIX=" + level + "&" + "TILEROW=" + row + "&" + "TILECOL=" + col;
		    //return "http://ditu.zj.cn/services/wmts/chinaemap?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=chinaemap&TILEMATRIXSET=esritilematirx&OUTPUTFORMAT=image/png&TILEMATRIX=" + level + "&" + "TILEROW=" + row + "&" + "TILECOL=" + col;
		}
	});
	dojo.declare("TDTImgLayer", esri.layers.TiledMapServiceLayer, {
	    constructor: function () {
	        this.spatialReference = new esri.SpatialReference({ wkid: 4326 });
	        this.initialExtent = (this.fullExtent =
            new esri.geometry.Extent(-180.0, -90.0, 180.0, 90.0, this.spatialReference));
	        this.tileInfo = new esri.layers.TileInfo({
	            "rows": 256,
	            "cols": 256,
	            "compressionQuality": 0,
	            "origin": { "x": -180, "y": 90 },
	            "spatialReference": { "wkid": 4326 },
	            "lods": [
                    { "scale": 590995197.14166909755553014475, "level": 0, "resolution": 1.40625 },
                    { "scale": 295497598.57083454877776507238, "level": 1, "resolution": 0.703125 },
                    { "scale": 147748799.28541727438888253619, "level": 2, "resolution": 0.3515625 },
                    { "scale": 73874399.642708637194441268094, "level": 3, "resolution": 0.17578125 },
                    { "scale": 36937199.821354318597220634047, "level": 4, "resolution": 0.087890625 },
                    { "scale": 18468599.910677159298610317023, "level": 5, "resolution": 0.0439453125 },
                    { "scale": 9234299.955338579649305158512, "level": 6, "resolution": 0.02197265625 },
                    { "scale": 4617149.9776692898246525792559, "level": 7, "resolution": 0.010986328125 },
                    { "scale": 2308574.9888346449123262896279, "level": 8, "resolution": 0.0054931640625 },
                    { "scale": 1154287.494417322456163144814, "level": 9, "resolution": 0.00274658203125 },
                    { "scale": 577143.74720866122808157240698, "level": 10, "resolution": 0.001373291015625 },
                    { "scale": 288571.87360433061404078620349, "level": 11, "resolution": 0.0006866455078125 },
                    { "scale": 144285.93680216530702039310175, "level": 12, "resolution": 0.00034332275390625 },
                    { "scale": 72142.968401082653510196550873, "level": 13, "resolution": 0.000171661376953125 },
                    { "scale": 36071.484200541326755098275436, "level": 14, "resolution": 0.0000858306884765625 },
                    { "scale": 18035.742100270663377549137718, "level": 15, "resolution": 0.00004291534423828125 },
                    { "scale": 9017.871050135331688774568859, "level": 16, "resolution": 0.000021457672119140625 },
                    { "scale": 4508.9355250676658443872844296, "level": 17, "resolution": 0.0000107288360595703125 }
	                //{ "scale": 2254.4677625338331, "level": 18, "resolution": 5.36441802975e-6 }
	            ]
	        });
	        this.loaded = true;
	        this.onLoad(this);
	    },
	    getTileUrl: function (level, row, col) {
	        //return "http://localhost:8808/project_gis/getImageFromUrl?serverID=" + serverID + "&level=" + level + "&row=" + row + "&col=" + col;
	        if (level <= 14)
	            return "http://116.62.152.138:8080/gisServer/proxy?http://t" + serverID + ".tianditu.gov.cn/img_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&TILEMATRIXSET=c&STYLE=default&TILEMATRIX=" + level + "&" + "TILEROW=" + row + "&" + "TILECOL=" + col+ "&tk=e5abca32c01cf5fa9a82cd58d677fddd";
	          else
	            return "http://srv.zjditu.cn/ZJDOM_2D/wmts?SERVICE=WMTS&Version=1.0.0&Request=GetTile&STYLE=default&LAYER=chinaimgmap&TILEMATRIXSET=esritilematirx&TILEMATRIX=" + level + "&" + "TILEROW=" + row + "&" + "TILECOL=" + col;
	        //return "http://ditu.zj.cn/services/wmts/chinaimgmap?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=chinaimgmap&TILEMATRIXSET=esritilematirx&TILEMATRIX=" + level + "&" + "TILEROW=" + row + "&" + "TILECOL=" + col;
	    }
	});
	//电子地图文字标注  
	dojo.declare("TDTEWordLayer", TDTVecLayer, {
	    getTileUrl: function (level, row, col) {
	        //return "http://116.62.152.138:8080/gisServer/proxy?http://localhost:8808/project_gis/getVecAnFromUrl?serverID=" + serverID + "&level=" + level + "&row=" + row + "&col=" + col; 
	        return "http://116.62.152.138:8080/gisServer/proxy?http://t" + serverID + ".tianditu.gov.cn/cva_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&STYLE=default&LAYER=cva&TILEMATRIXSET=c&TILEMATRIX=" + level + "&" + "TILEROW=" + row + "&" + "TILECOL=" + col+ "&tk=e5abca32c01cf5fa9a82cd58d677fddd";
		}
	});
     //卫星图文字标注  
	dojo.declare("TDTImgWordLayer", TDTImgLayer, {
	    getTileUrl: function (level, row, col) {
	        //return "http://116.62.152.138:8080/gisServer/proxy?http://localhost:8808/project_gis/getImageANFromUrl?serverID=" + serverID + "&level=" + level + "&row=" + row + "&col=" + col;
	        return "http://116.62.152.138:8080/gisServer/proxy?http://t" + serverID + ".tianditu.gov.cn/cia_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&STYLE=default&LAYER=cia&TILEMATRIXSET=c&TILEMATRIX=" + level + "&" + "TILEROW=" + row + "&" + "TILECOL=" + col+ "&tk=e5abca32c01cf5fa9a82cd58d677fddd";
	    }
	});
     //地形图  
	//dojo.declare("TDTTerLayer", TDTLayer2, {
	//    getTileUrl: function (level, row, col) {//wmts  
    //        return "http://t" + serverID + ".tianditu.com/ter_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&TILEMATRIXSET=c&TILEMATRIX=" + level + "&" + "TILEROW=" + row + "&" + "TILECOL=" + col;
	//    }
	//});
    // //地形图文字注记 
	//dojo.declare("TDTTerWordLayer", TDTLayer2, {
	//    getTileUrl: function (level, row, col) {//wmts  
    //        return "http://t" + serverID + ".tianditu.com/cta_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&TILEMATRIXSET=c&TILEMATRIX=" + level + "&" + "TILEROW=" + row + "&" + "TILECOL=" + col;
	//    }
	//});
}
dojo.addOnLoad(initTianditu);
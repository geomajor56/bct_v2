// google api key AIzaSyBCClRgiRpELqaFFjt1V929S6aevHJxXOQ
// AIzaSyCZCou0awDsld16RrRKjMeQN4Mx_Ue89iY
// <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"
//   type="text/javascript"></script>


var map, featureList, pointSearch = [], panelLayer;

L.MakiMarkers.accessToken = "pk.eyJ1IjoiZ2VvbWFqb3I1NiIsImEiOiJjaW9iejZ4cGYwNDc0dnpsejBmc2g0Z3QzIn0.8hKDWYbdQW7cbIE7eeu4-A";

$(window).resize(function () {
    sizeLayerControl();
});

$(document).on("click", ".feature-row", function (e) {
    $(document).off("mouseout", ".feature-row", clearHighlight);
    sidebarClick(parseInt($(this).attr("id"), 10));
});

if (!("ontouchstart" in window)) {
    $(document).on("mouseover", ".feature-row", function (e) {
        highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
    });
}


$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function () {
    $("#aboutModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#full-extent-btn").click(function () {
    map.fitBounds(boroughs.getBounds());
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#list-btn").click(function () {
    animateSidebar();
    return false;
});

$("#nav-btn").click(function () {
    $(".navbar-collapse").collapse("toggle");
    return false;
});

$("#sidebar-toggle-btn").click(function () {
    animateSidebar();
    return false;
});

$("#sidebar-hide-btn").click(function () {
    animateSidebar();
    return false;
});

function animateSidebar() {
    $("#sidebar").animate({
        width: "toggle"
    }, 350, function () {
        map.invalidateSize();
    });
}

function sizeLayerControl() {
    $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
    highlight.clearLayers();
}

function sidebarClick(id) {
    map.addLayer(pointLayer)
    var layer = points.getLayer(id);
    map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
    layer.fire("click");
    /* Hide sidebar and go to the map on small screens */
    if (document.body.clientWidth <= 767) {
        $("#sidebar").hide();
        map.invalidateSize();
    }
}

function syncSidebar() {
    /* Empty sidebar features */
    $("#feature-list tbody").empty();
    /* Loop through points layer and add only features which are in the map bounds */
    points.eachLayer(function (layer) {
        if (map.hasLayer(pointLayer)) {
            if (map.getBounds().contains(layer.getLatLng())) {
                $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"></td><td class="feature-name">' + layer.feature.properties.GRANTOR + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
            }
        }
    });

    /* Update list.js featureList */
    featureList = new List("features", {
        valueNames: ["feature-name"]
    });
    featureList.sort("feature-name", {
        order: "asc"
    });
}



/* Basemap Layers */


var google_streets = L.gridLayer.googleMutant({
    type: 'roadmap',
    });

var google_satellite = L.gridLayer.googleMutant({
    type: 'hybrid',
    });

var google_terrain = L.gridLayer.googleMutant({
    type: 'terrain',
    });

mapbox_satellite = L.tileLayer(
    'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2VvbWFqb3I1NiIsImEiOiJjaW9iejZ4cGYwNDc0dnpsejBmc2g0Z3QzIn0.8hKDWYbdQW7cbIE7eeu4-A'
);

mapbox_outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2VvbWFqb3I1NiIsImEiOiJjaW9iejZ4cGYwNDc0dnpsejBmc2g0Z3QzIn0.8hKDWYbdQW7cbIE7eeu4-A'

);


var baseLayers = {
  "Street Map": mapbox_outdoors,
  "Aerial Imagery": mapbox_satellite

};

// var layerControl = L.control.groupedLayers(baseLayers, {
//     }).addTo(map);
//


/* Overlay Layers */
var highlight = L.geoJson(null);

var brewster = L.geoJson(null, {
    style: function (feature) {
        return {
            color: "green",
            weight: 2,
            fill: false,
            opacity: 1,
            clickable: false
        };
    }
});
$.getJSON("data/brewster.geojson", function (data) {
    brewster.addData(data);
});

var highlightStyle = {
    stroke: false,
    fillColor: "#00FFFF",
    fillOpacity: 0.7,
    radius: 10
};

var greenTree = L.MakiMarkers.icon({
    icon: "park",
    color: "3F9110",
    size: "s"
});
var redTree = L.MakiMarkers.icon({
    icon: "park",
    color: "F04441",
    size: "s"
});
var blueTree = L.MakiMarkers.icon({
    icon: "park",
    color: "442DB5",
    size: "s"
});




var parcels = new L.GeoJSON.AJAX("data/parcels.geojson", {
    style: function (feature) {
        return {
            color: "red",
            weight: 2,
            fill: false,
            opacity: 1,
            clickable: false
        };
    },
});


var pointLayer = L.geoJson(null);
var points = L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
        if (feature.properties.OWNER_TYPE === "A") {
            return L.marker(latlng, {
                icon: greenTree,
                title: feature.properties.BCT,
                riseOnHover: true
            });
        } else if (feature.properties.OWNER_TYPE === "B") {
            return L.marker(latlng, {
                icon: blueTree,
                title: feature.properties.BCT,
                riseOnHover: true
            });

        } else {
            return L.marker(latlng, {
                icon: redTree,
                title: feature.properties.BCT,
                riseOnHover: true
            });
        }
    },
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.GRANTOR + "</td></tr>" + "<tr><th>Date Acquired</th><td>" + feature.properties.ACQUIRED + "</td></tr>" + "<tr><th>Habitat</th><td>" + feature.properties.HABITAT + "</td></tr>" + "<tr><th>Total Acres</th><td>" + feature.properties.TOTAL + "</td></tr>" + "<table>";
            layer.on({
                click: function (e) {
                    if (feature.properties.OWNER_TYPE === "A") {
                        ownerType = "BCT Owned Land";
                    } else if (feature.properties.OWNER_TYPE === "B") {
                        ownerType = "Conservation Restriction on Private Land";
                    } else {
                        ownerType = 'Conservation Restriction on Town Land';
                    }
                    $("#feature-title").html(feature.properties.BCT + '<h5>' + ownerType + '</h5>');
                    $("#feature-info").html(content);
                    $("#featureModal").modal("show");
                    highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                        stroke: false,
                        fillColor: "#00FFFF",
                         fillOpacity: 0.7,
                        radius: 10
                    }));
                }
            });
            $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '"><td style="vertical-align: middle;"></td><td class="feature-name">' + layer.feature.properties.GRANTOR + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
            pointSearch.push({
                name: layer.feature.properties.BCT,
                address: layer.feature.properties.GRANTOR,
                source: "Points",
                id: L.stamp(layer),
                lat: layer.feature.geometry.coordinates[1],
                lng: layer.feature.geometry.coordinates[0]
            });
        }
    }
});

$.getJSON("data/points.geojson", function (data) {
    points.addData(data);
    map.addLayer(pointLayer);
});


map = L.map("map", {
    zoom: 13,
    center: [41.74737922562798, -70.0688695],
    layers: [google_terrain, brewster, points, highlight],
    zoomControl: false,
    attributionControl: false
});
// *********************************Leaflet Plugins***************************************************************
var legend = L.control({position: 'topleft'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<img src="assets/img/newGreenTree.png">' + '     BCT Owned Land' + '&nbsp'+ '&nbsp'+
    '<img src="assets/img/newBlueTree.png">' + '     Conservation Restriction on Private Land' + '&nbsp'+ '&nbsp'+
    '<img src="assets/img/newRedTree.png">' + '     Conservation Restriction on Town Land' +'&nbsp'+ '&nbsp'

    return div;
};

legend.addTo(map);
L.control.navbar().addTo(map);

L.easyPrint({
    title: 'My awesome print button',
    position: 'topleft',
    elementsToHide: 'p, h2'
}).addTo(map);


// ************************************************************************************************

// map.on("zoomend", function (e) {
//     console.log("zowerom level is " + map.getZoom())
//     zoom = map.getZoom();
//     if (zoom <= 15) {
//         map.removeLayer(parcels);
//         // map.removeLayer(mapquestHYB);
//         // map.addLayer(pirate);
//     } else if (zoom > 14) {
//         map.addLayer(parcels);
//         // map.removeLayer(pirate);
//         // map.addLayer(mapquestHYB);
//     }
// });

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
    syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function (e) {
    highlight.clearLayers();
});



/* Attribution control */
function updateAttribution(e) {
    $.each(map._layers, function (index, layer) {
        if (layer.getAttribution) {
            $("#attribution").html((layer.getAttribution()));
        }
    });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
    position: "bottomright"
});
attributionControl.onAdd = function (map) {
    var div = L.DomUtil.create("div", "leaflet-control-attribution");
    div.innerHTML = "<strong>Developed by CapeCodGIS</strong>";
    return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
    position: "topleft"
}).addTo(map);



//
/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

// var baseLayers = {
//   "Street Map": osm,
//   "Aerial Imagery": Esri_WorldImagery,
//   "Imagery with Streets": Esri_WorldImagery
// };

var groupedOverlays = {
  "Points of Interest": {
    "<img src='assets/img/theater.png' width='24' height='28'>&nbsp;Theaters": brewster,
    "<img src='assets/img/museum.png' width='24' height='28'>&nbsp;Museums": brewster
  }
};


// var layerControl = L.control.groupedLayers(baseLayers, {
//   collapsed: notCollapsed
// }).addTo(map);
//

/* Highlight search box text on click */
$("#searchbox").click(function () {
    $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
    if (e.which == 13) {
        e.preventDefault();
    }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
    $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
    $("#loading").hide();
    sizeLayerControl();
    /* Fit map to brewster bounds */
    map.fitBounds(brewster.getBounds());
    featureList = new List("features", {valueNames: ["feature-name"]});
    featureList.sort("feature-name", {order: "asc"});


    var pointsBH = new Bloodhound({
        name: "Points",
        datumTokenizer: function (d) {
            return Bloodhound.tokenizers.whitespace(d.name);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: pointSearch,
        limit: 10
    });

    pointsBH.initialize();
    // museumsBH.initialize();
    // geonamesBH.initialize();

    /* instantiate the typeahead UI */
    $("#searchbox").typeahead({
        minLength: 3,
        highlight: true,
        hint: false
    }, {
        name: "Points",
        displayKey: "name",
        source: pointsBH.ttAdapter(),
        templates: {
            header: "<h4 class='typeahead-header'>Parcels</h4>"
        }

    }).on("typeahead:selected", function (obj, datum) {

        if (datum.source === "Points") {
            if (!map.hasLayer(theaterLayer)) {
                map.addLayer(theaterLayer);
            }
            map.setView([datum.lat, datum.lng], 17);
            if (map._layers[datum.id]) {
                map._layers[datum.id].fire("click");
            }
        }


        if ($(".navbar-collapse").height() > 50) {
            $(".navbar-collapse").collapse("hide");
        }
    }).on("typeahead:opened", function () {
        $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
        $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
    }).on("typeahead:closed", function () {
        $(".navbar-collapse.in").css("max-height", "");
        $(".navbar-collapse.in").css("height", "");
    });
    $(".twitter-typeahead").css("position", "static");
    $(".twitter-typeahead").css("display", "block");


$("#sidebar").animate({
        width: "toggle"
    }, 1500, function () {
        map.invalidateSize();
    });




});

// Leaflet patch to make layer control scrollable on touch browsers
// var container = $(".leaflet-control-layers")[0];
// if (!L.Browser.touch) {
//     L.DomEvent
//         .disableClickPropagation(container)
//         .disableScrollPropagation(container);
// } else {
//     L.DomEvent.disableClickPropagation(container);
// }

const earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

const tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(earthquakeURL, function(data) {
    console.log(data.features);
    createFeatures(data.features);
});



function createFeatures(earthquakeData) {

    function onEachFeature(feature, layer) {
        layer.bindPopup(feature.properties.place + "<hr />" + new Date(feature.properties.time));
    }

    function getColor(d) {
    return d <= 10 ? '#fcc5c0' :
           d <= 30  ? '#fa9fb5' :
           d <= 50  ? '#f768a1' :
           d <= 70  ? '#dd3497' :
           d <= 90   ? '#ae017e' :
           d > 90   ? '#7a0177' :
                      '#49006a';
    }

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            var circle = L.circle(latlng, {
                radius: feature.properties.mag * 15000,
                color: getColor(feature.geometry.coordinates[2]),
                weight: 0,
                fillOpacity: 0.50,
                fillColor: getColor(feature.geometry.coordinates[2])
            });
                return circle;
        }
    });

    createMap(earthquakes);
}

function createMap(earthquakes) {

    var lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/light-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/dark-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });

    var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/satellite-v9',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });
    
    var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/outdoors-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });

    var baseMaps = {
        "Light Map": lightmap,
        "Dark Map": darkmap,
        "Satellite": satellite,
        "Outdoors": outdoors
    };

    var tectonicPlatesLayer = new L.LayerGroup();

    d3.json(tectonicPlatesURL, function(tectonicData) {
        console.log(tectonicData.features);
        L.geoJSON(tectonicData, {
            color: "#980043",
            weight:2
        }).addTo(tectonicPlatesLayer)
    });

    var overlayMaps = {
        "Tectonic Plates":tectonicPlatesLayer,
        "Earthquakes":earthquakes
    };

    var map = L.map("mapid", {
        center: [0,0],
        zoom: 2,
        layers: [outdoors, earthquakes, tectonicPlatesLayer]
    });

    var legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "legend");

        var depths = [-10, 10, 30, 50, 70, 90];
        var colors = [
            '#fcc5c0',
            '#fa9fb5',
            '#f768a1',
            '#dd3497',
            '#ae017e',
            '#7a0177']
    

    for (var i = 0; i < depths.length; i++) {
        div.innerHTML += "<i style='background: "
            + colors[i]
            + " '></i>"
            + depths[i]
            + (depths[i + 1] ? "&ndash;" 
            + depths[i + 1] 
            + "<br />" : "+");
    }
    return div;
    };

    legend.addTo(map);

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);

    
}
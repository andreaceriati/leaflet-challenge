function createMap(earthquakeLocation) {
    // Create the tile layer that will be the background of our map.
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create a baseMaps object to hold the streetmap layer.
    let baseMaps = {
        "Street Map": streetmap
    };

    // Create an overlayMaps object to hold the bikeStations layer.
    let overlayMaps = {
        "Earthquake Location": earthquakeLocation
    };

    // Create the map object with options.
    let map = L.map("map", {
        center: [20.0, 5.0],
        zoom: 2.50,
        layers: [streetmap, earthquakeLocation]
    });

    // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);

    // Create legend control
    let legend = L.control({position: 'bottomright'});

    // Function to add legend to the map
    legend.onAdd = function (map) {
        // Create a div element for the legend with a white background
        let div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = 'white';

        // Define earthquake depth grades
        let grades = [-10, 10, 30, 50, 70, 90];
    
        // Loop through grades and add legend items
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    
        return div;
    };

    // Add legend to the map
    legend.addTo(map);
}

// Function to determine color based on earthquake depth
function getColor(d) {
    return d < 10 ? "LawnGreen" :
           d < 30 ? "PaleGreen" :
           d < 50 ? "Gold" :
           d < 70 ? "#fdb72a" :
           d < 90 ? "#fca35d" :
                    "Tomato";
}

// Function to create markers for earthquake locations
function createMarkers(response) {
    // Extract earthquake locations from response
    let locations = response.features;
    // Initialize an array to hold earthquake markers.
    let earthquakeMarkers = [];

    // Loop through locations to create markers
    for (let i = 0; i < locations.length; i++) {
        let location = locations[i];
        let depth = location.geometry.coordinates[2];
        let color = getColor(depth);

        // Create circle marker for each earthquake location
        let earthquakeMarker = L.circleMarker([location.geometry.coordinates[1], location.geometry.coordinates[0]], {
            fillOpacity: 1,
            weight: 0.5,
            color: "Black",
            fillColor: color,
            radius: location.properties.mag * 3
        }).bindPopup(`<h3>Magnitude: ${location.properties.mag}</h3><h3>Location: ${location.properties.place}</h3><h3>Depth: ${location.geometry.coordinates[2]} km</h3>`);
        
        earthquakeMarkers.push(earthquakeMarker);
    }
    //"<h3>" + location.properties.title + "</h3>"
    // Create map with earthquake markers as overlay
    createMap(L.layerGroup(earthquakeMarkers));
}

// Fetch earthquake data and create markers
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson").then(createMarkers);

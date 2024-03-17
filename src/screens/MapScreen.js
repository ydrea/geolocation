import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";

import loadGoogleMapsAPI from "./webMapComponent"; // Import the function
import fetchRouteData from "../api/GetCoords";

let MapViewMob, MarkerMob, MapViewDirectionsMob;

if (Platform.OS === "android" || Platform.OS === "ios") {
  MapViewMob = require("react-native-maps").default;
  MarkerMob = require("react-native-maps").Marker;
  MapViewDirectionsMob = require("react-native-maps-routes").default;
}
let MapView;

if (Platform.OS === "web") {
  MapView = require("@preflower/react-native-web-maps").default;
}

// Create the debounce function responsible for zoom actions
const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    try {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (typeof func == "function") {
          func(...args);
        }
      }, delay);
    } catch (error) {
      console.log("Error in debounce", error);
    }
  };
};


export default function MapScreen (){
  const [coords, setCoords] = useState([]);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [region, setRegion] = useState({
    latitude: 33.8252956,
    longitude: -117.8307728,
    latitudeDelta: 0.045,
    longitudeDelta: 0.045,
  });

  const origin = { latitude: 33.843663, longitude: -117.945171 };
  const destination = { latitude: 33.8252956, longitude: -117.8307728 };
  const waypoint = { latitude: 33.8589565, longitude: -117.9589782 };

  const debouncedOnRegionChange = useCallback(
    debounce((newRegion) => {
      if (
        !isNaN(newRegion.latitude) &&
        !isNaN(newRegion.longitude) &&
        isFinite(newRegion.latitude) &&
        isFinite(newRegion.longitude)
      ) {
        setRegion(newRegion);
      }
    }, 10),
    []
  );


  const onRegionChangeComplete = (changedRegion) => {
    console.log("Region changed:", changedRegion);
  };

  const onPress = (event) => {
    console.log("Map pressed:", event.nativeEvent.coordinate);
  };

  const onDoublePress = (event) => {
    console.log("Map double pressed:", event.nativeEvent.coordinate);
  };

  const onPanDrag = () => {
    console.log("Map panned or dragged");
  };

  useEffect(() => {
    const fetchData = async () => {
      if (Platform.OS === "web") {
        loadGoogleMapsAPI(() => {
          setGoogleMapsLoaded(true);
        });
      }

      try {
        const newCoords = await fetchRouteData(origin, waypoint, destination);
        setCoords(newCoords);
        console.log(coords);
        console.log("Origin:", origin);
console.log("Waypoint:", waypoint);
console.log("Destination:", destination);

// Verify API key
// console.log("API Key:", apiKey);

      } catch (error) {
        console.error("Error fetching COORDS", error);
        setError(true)
      }
    };

    fetchData();
  }, [origin, waypoint, destination, retryCount]);


  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error loading map. Please check your network connection and try again.</Text>
        <Button title="Retry" onPress={() => setRetryCount(retryCount + 1)} />
      </View>
    );
  }

    return (
      <View style={styles.container}>
        {googleMapsLoaded && Platform.OS === "web" ? (
          <View style={styles.container}>
            <MapView
            style={styles.map}
            initialRegion={region}
            onRegionChange={(newRegion) => {
              debouncedOnRegionChange(newRegion);
            }}
            onRegionChangeComplete={onRegionChangeComplete}
            onPress={onPress}
            onDoublePress={onDoublePress}
            onPanDrag={onPanDrag}
            zoomEnabled={true}
            zoomControlEnabled={true}
            mapType="terrain"
            showsPointsOfInterest={false}            >
              <MapView.Marker coordinate={origin} title="Origin">
                <View style={styles.markerContainer}></View>
              </MapView.Marker>

              <MapView.Marker coordinate={destination} title="Destination">
                <View style={styles.markerContainer}></View>
              </MapView.Marker>

              {coords && (
                <MapView.Polyline
                  coordinates={coords.map((coord) => ({
                    latitude: coord[0],
                    longitude: coord[1],
                  }))}
                  strokeWidth={8}
                  strokeColor="royalblue"
                  tappable={true}
                  onClick={() => {
                    this.onPolylineClicked();
                  }}
                />
              )}
            </MapView>
          </View>
        ) : Platform.OS === "android" || Platform.OS === "ios" ? (
          <View style={styles.container}>
            <MapViewMob
              style={styles.map}
              onRegionChange={(new_region) => {
                this.debouncedOnRegionChange(new_region);
              }}
            >
              <MarkerMob coordinate={origin} title="Origin">
                <View style={styles.markerContainer}></View>
              </MarkerMob>

              <MarkerMob coordinate={destination} title="Destination">
                <View style={styles.markerContainer}></View>
              </MarkerMob>

              {markers &&
                markers.map((marker, index) => (
                  <MarkerMob
                    key={index}
                    coordinate={marker.latlng}
                    title={marker.title}
                    description={marker.description}
                  />
                ))}

              {plot.draw && (
                <MapViewDirectionsMob
                  origin={origin}
                  destination={destination}
                  waypoint={plot.waypoint}
                  strokeColor={showIcon ? "red" : "royalblue"}
                  tappable={true}
                  onPress={() => {
                    this.onPolylineClicked();
                  }}
                  apikey={apiKey}
                  strokeWidth={14}
                />
              )}
            </MapViewMob>
          </View>
        ) : (
          <Text>LOADING....</Text>
        )}
      </View>
    );
  
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    borderColor: "white",
    borderWidth: 8,
    borderTopWidth: 4,
    borderBottomWidth: 4,
  },
  markerContainer: {
    width: 40,
    height: 40,
  },
  markerImage: {
    flex: 1,
    width: undefined,
    height: undefined,
  },

  rgnText: {
    fontSize: 12,
    color: "#666666",
  },
  rgnView: { flexDirection: "row", alignItems: "flex-end" },
  button: {
    backgroundColor: "orange",
    padding: 8,
    margin: 5,
    borderRadius: 5,
    alignItems: "center",
    height: 35,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

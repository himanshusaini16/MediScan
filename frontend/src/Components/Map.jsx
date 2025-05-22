import React, { useEffect, useRef, useState, useContext } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapboxExample = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const [doctorLocation, setDoctorLocation] = useState(null);
  const [docInfo, setDocInfo] = useState(null);

  const { doctors } = useContext(AppContext);
  const { docId } = useParams();

  useEffect(() => {
    const info = doctors.find((doc) => doc._id === docId);
    setDocInfo(info || null);
  }, [doctors, docId]);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!docInfo?.address) return;

      try {
        const parsedAddress =
          typeof docInfo.address === "string"
            ? JSON.parse(docInfo.address)
            : docInfo.address;

        const fullAddress = `${parsedAddress.line1}, ${parsedAddress.line2}`;
        const geoRes = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            fullAddress
          )}.json?access_token=${mapboxgl.accessToken}`
        );

        const [lng, lat] = geoRes.data.features[0].center;
        setDoctorLocation({ lat, lng });
      } catch (err) {
        console.error("Failed to fetch doctor location:", err);
      }
    };

    fetchLocation();
  }, [docInfo]);

  useEffect(() => {
    if (!doctorLocation) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [doctorLocation.lng, doctorLocation.lat],
      zoom: 12,
    });

    new mapboxgl.Marker({ color: "red" })
      .setLngLat([doctorLocation.lng, doctorLocation.lat])
      .addTo(mapRef.current);

    return () => mapRef.current?.remove();
  }, [doctorLocation]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        height: "400px",
        width: "100%",
        borderRadius: "10px",
        marginTop: "20px",
      }}
      className="map-container shadow-lg border border-blue-600 "
    />
  );
};

export default MapboxExample;

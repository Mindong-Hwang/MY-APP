"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
  const [city, setCity] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [weatherInfo, setWeatherInfo] = useState({ temperature: "", weather: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [clothingList, setClothingList] = useState([]);
  const [newClothing, setNewClothing] = useState({
    name: "",
    type: "Outer", // Default type
    minTemp: "",
    maxTemp: "",
    weather: "",
    image: "",
    description: "",
  });

  const weatherOptions = ["Sunny", "Cloudy", "Rain", "Shower", "Snow", "Pellets", "Thunder"];
  const clothingTypes = ["Outer", "Tops", "Bottoms"]; // 분류 추가

  const fetchClothingList = async () => {
    try {
      const response = await fetch(`/api/getClothing`);
      if (response.ok) {
        const data = await response.json();
        setClothingList(data);
      } else {
        console.error("Failed to fetch clothing data.");
      }
    } catch (error) {
      console.error("Error fetching clothing data:", error);
    }
  };

  useEffect(() => {
    fetchClothingList();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/recommendClothes?city=${city}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
        setWeatherInfo({ temperature: data.temperature, weather: data.weather });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch recommendations.");
      }
    } catch (error) {
      setError("An unexpected error occurred while fetching recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const handleWeatherChange = (e) => {
    const { value, checked } = e.target;
    let selectedWeather = newClothing.weather.split(",").map((w) => w.trim()).filter(Boolean);

    if (checked) {
      selectedWeather.push(value);
    } else {
      selectedWeather = selectedWeather.filter((w) => w !== value);
    }

    setNewClothing({ ...newClothing, weather: selectedWeather.join(",") });
  };

  const handleAddClothing = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/addClothing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClothing),
      });
      if (response.ok) {
        alert("Clothing added successfully!");
        setNewClothing({
          name: "",
          type: "Outer",
          minTemp: "",
          maxTemp: "",
          weather: "",
          image: "",
          description: "",
        });
        fetchClothingList();
      } else {
        console.error("Failed to add clothing.");
      }
    } catch (error) {
      console.error("Error adding clothing:", error);
    }
  };

  const handleDeleteClothing = async (id) => {
    try {
      const response = await fetch(`/api/deleteClothing?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        alert("Clothing deleted successfully!");
        fetchClothingList();
      } else {
        console.error("Failed to delete clothing.");
      }
    } catch (error) {
      console.error("Error deleting clothing:", error);
    }
  };

  // 의류 타입별 분류
  const clothingByType = {
    Outer: clothingList.filter((item) => item.type === "Outer"),
    Tops: clothingList.filter((item) => item.type === "Tops"),
    Bottoms: clothingList.filter((item) => item.type === "Bottoms"),
  };

  return (
    <main style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#4CAF50" }}>👗 My Wardrobe</h1>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Clothing List */}
        <div style={{ flex: "2", marginRight: "20px" }}>
          {Object.keys(clothingByType).map((type) => (
            <div key={type}>
              <h2>{type}</h2>
              {clothingByType[type].length > 0 ? (
                <ul>
                  {clothingByType[type].map((item) => (
                    <li key={item.id} style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: "100px", height: "100px", marginRight: "20px" }}
                      />
                      <div>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <p>
                          <strong>Temperature Range:</strong> {item.minTemp}°C - {item.maxTemp}°C
                        </p>
                        <p>
                          <strong>Weather:</strong> {item.weather}
                        </p>
                        <button
                          onClick={() => handleDeleteClothing(item.id)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#f44336",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No {type.toLowerCase()} available.</p>
              )}
            </div>
          ))}
        </div>

        {/* Add Clothing Form */}
        <div style={{ flex: "1", border: "1px solid #ccc", padding: "20px", borderRadius: "10px" }}>
          <h2>Add New Clothing</h2>
          <form onSubmit={handleAddClothing} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input
              type="text"
              placeholder="Name"
              value={newClothing.name}
              onChange={(e) => setNewClothing({ ...newClothing, name: e.target.value })}
              required
              style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <select
              value={newClothing.type}
              onChange={(e) => setNewClothing({ ...newClothing, type: e.target.value })}
              required
              style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            >
              {clothingTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div>
              <label style={{ fontWeight: "bold", marginBottom: "10px", display: "block" }}>Weather:</label>
              {weatherOptions.map((option) => (
                <div key={option} style={{ marginBottom: "5px" }}>
                  <label>
                    <input
                      type="checkbox"
                      value={option}
                      checked={newClothing.weather.split(",").map((w) => w.trim()).includes(option)}
                      onChange={handleWeatherChange}
                      style={{ marginRight: "5px" }}
                    />
                    {option}
                  </label>
                </div>
              ))}
            </div>
            <input
              type="number"
              placeholder="Min Temperature"
              value={newClothing.minTemp}
              onChange={(e) => setNewClothing({ ...newClothing, minTemp: e.target.value })}
              required
              style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <input
              type="number"
              placeholder="Max Temperature"
              value={newClothing.maxTemp}
              onChange={(e) => setNewClothing({ ...newClothing, maxTemp: e.target.value })}
              required
              style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <input
              type="text"
              placeholder="Image URL"
              value={newClothing.image}
              onChange={(e) => setNewClothing({ ...newClothing, image: e.target.value })}
              style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <textarea
              placeholder="Description"
              value={newClothing.description}
              onChange={(e) => setNewClothing({ ...newClothing, description: e.target.value })}
              required
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                resize: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Add Clothing
            </button>
          </form>
        </div>
      </div>

      <hr style={{ margin: "20px 0" }} />

      {/* Recommendation Section */}
      <h2>Weather-based Fashion Recommendations</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            padding: "10px",
            marginRight: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={fetchRecommendations}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Get Recommendations
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {weatherInfo.weather && (
        <div style={{ marginTop: "20px" }}>
          <h2>Current Weather: {weatherInfo.weather}</h2>
          <h3>Temperature: {weatherInfo.temperature}°C</h3>
        </div>
      )}

      {recommendations.length > 0 && !loading && (
        <div>
          <h2>Recommended Clothes:</h2>
          <ul>
            {recommendations.map((item) => (
              <li key={item.id} style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}>
                <img src={item.image} alt={item.name} style={{ width: "100px", height: "100px", marginRight: "20px" }} />
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length === 0 && !loading && !error && (
        <p>No clothing recommendations match the current weather conditions.</p>
      )}
    </main>
  );
}

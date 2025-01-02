"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
  const [city, setCity] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [weatherInfo, setWeatherInfo] = useState({ temperature: "", weather: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [clothingList, setClothingList] = useState([]);
  const [newClothing, setNewClothing] = useState({
    name: "",
    type: "Outer",
    minTemp: "",
    maxTemp: "",
    weather: "",
    image: "",
    description: "",
  });

  // 페이지네이션 (신발 포함)
  const [pagination, setPagination] = useState({
    Outer: { page: 1, itemsPerPage: 1 },
    Tops: { page: 1, itemsPerPage: 1 },
    Bottoms: { page: 1, itemsPerPage: 1 },
    Shoes: { page: 1, itemsPerPage: 1 },
  });

  // 날씨 / 타입 옵션
  const weatherOptions = ["Sunny", "Cloudy", "Rain", "Shower", "Snow", "Pellets", "Thunder"];
  const clothingTypes = ["Outer", "Tops", "Bottoms", "Shoes"];

  // [추가 1] 편집 모드 관리를 위한 상태
  const [editingId, setEditingId] = useState(null);
  const [editClothingData, setEditClothingData] = useState({
    id: null,
    name: "",
    type: "Outer",
    minTemp: "",
    maxTemp: "",
    weather: "",
    image: "",
    description: "",
  });

  // 옷 목록 가져오기
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

  // 날씨 기반 추천
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
        setError(errorData.error || "추천 정보를 가져오는 데 실패했습니다.");
      }
    } catch (error) {
      setError("추천 정보를 가져오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 새 옷 추가시 체크박스 (날씨)
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

  // 새 옷 추가
  const handleAddClothing = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/addClothing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClothing),
      });
      if (response.ok) {
        alert("옷이 성공적으로 추가되었습니다!");
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
        console.error("옷 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("옷 추가 중 오류가 발생했습니다:", error);
    }
  };

  // 옷 삭제
  const handleDeleteClothing = async (id) => {
    try {
      const response = await fetch(`/api/deleteClothing?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        alert("옷이 성공적으로 삭제되었습니다!");
        fetchClothingList();
      } else {
        console.error("옷 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("옷 삭제 중 오류가 발생했습니다:", error);
    }
  };

  // [추가 2] "수정" 버튼 클릭 시 - 편집 모드로 전환
  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditClothingData({ ...item }); 
    // item에는 {id, name, type, minTemp, maxTemp, weather, image, description} 등이 담겨있을 것
  };

  // [추가 3] 편집 중 체크박스(날씨) 처리
  const handleEditWeatherChange = (e) => {
    const { value, checked } = e.target;
    const currentWeather = editClothingData.weather.split(",").map((w) => w.trim()).filter(Boolean);

    let updatedWeather;
    if (checked) {
      updatedWeather = [...currentWeather, value];
    } else {
      updatedWeather = currentWeather.filter((w) => w !== value);
    }

    setEditClothingData({ ...editClothingData, weather: updatedWeather.join(",") });
  };

  // [추가 4] 변경 내용 서버로 전송(업데이트)
  const handleUpdateClothing = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/updateClothing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editClothingData),
      });

      if (response.ok) {
        alert("옷이 성공적으로 수정되었습니다!");
        setEditingId(null); 
        fetchClothingList(); // 목록 리로드
      } else {
        const data = await response.json();
        alert("수정 실패: " + (data.error || "알 수 없는 오류"));
      }
    } catch (error) {
      console.error("옷 수정 중 오류가 발생했습니다:", error);
    }
  };

  // [추가 5] 편집 취소
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // 페이지네이션
  const handlePageChange = (type, direction) => {
    setPagination((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        page: Math.max(1, prev[type].page + direction),
      },
    }));
  };

  // 타입별 분류
  const clothingByType = {
    Outer: clothingList.filter((item) => item.type === "Outer"),
    Tops: clothingList.filter((item) => item.type === "Tops"),
    Bottoms: clothingList.filter((item) => item.type === "Bottoms"),
    Shoes: clothingList.filter((item) => item.type === "Shoes"),
  };

  // 한국어 변환
  const getKoreanType = (type) => {
    switch (type) {
      case "Outer":
        return "아우터";
      case "Tops":
        return "상의";
      case "Bottoms":
        return "하의";
      case "Shoes":
        return "신발";
      default:
        return type;
    }
  };

  // 페이지네이션으로 잘라내기
  const paginatedClothing = (type) => {
    const { page, itemsPerPage } = pagination[type];
    const startIndex = (page - 1) * itemsPerPage;
    return clothingByType[type].slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = (type) => {
    const { itemsPerPage } = pagination[type];
    return Math.ceil(clothingByType[type].length / itemsPerPage);
  };

  return (
    <main
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#F9F9F9",
        color: "#333",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "#424242" }}>👗 나의 옷장</h1>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* 옷 리스트 */}
        <div style={{ flex: "2", marginRight: "20px" }}>
          {Object.keys(clothingByType).map((type) => (
            <div key={type}>
              <h2 style={{ color: "#424242" }}>{getKoreanType(type)}</h2>
              {paginatedClothing(type).length > 0 ? (
                <ul>
                  {paginatedClothing(type).map((item) => (
                    <li
                      key={item.id}
                      style={{
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#FFFFFF",
                        padding: "10px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        border: "1px solid #E0E0E0",
                      }}
                    >
                      {/* 수정 모드가 아닌 경우 */}
                      {editingId !== item.id ? (
                        <>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: "100px",
                              height: "100px",
                              marginRight: "20px",
                              borderRadius: "8px",
                            }}
                          />
                          <div>
                            <h3 style={{ color: "#333" }}>{item.name}</h3>
                            <p>{item.description}</p>
                            <p>
                              <strong>온도 범위:</strong> {item.minTemp}°C - {item.maxTemp}°C
                            </p>
                            <p>
                              <strong>날씨:</strong> {item.weather}
                            </p>
                            <button
                              onClick={() => handleDeleteClothing(item.id)}
                              style={{
                                padding: "5px 10px",
                                backgroundColor: "#B0BEC5",
                                color: "#FFF",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                marginRight: "5px",
                              }}
                            >
                              삭제
                            </button>
                            {/* [추가 6] "수정" 버튼 */}
                            <button
                              onClick={() => handleEditClick(item)}
                              style={{
                                padding: "5px 10px",
                                backgroundColor: "#8BC34A",
                                color: "#FFF",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                              }}
                            >
                              수정
                            </button>
                          </div>
                        </>
                      ) : (
                        /* 수정 모드일 때 표시되는 폼 */
                        <form onSubmit={handleUpdateClothing} style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: "20px" }}>
                            <div>
                              <img
                                src={editClothingData.image}
                                alt="Preview"
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  marginRight: "20px",
                                  borderRadius: "8px",
                                }}
                              />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <input
                                type="text"
                                value={editClothingData.name}
                                onChange={(e) =>
                                  setEditClothingData({ ...editClothingData, name: e.target.value })
                                }
                                style={{ padding: "5px" }}
                              />
                              <select
                                value={editClothingData.type}
                                onChange={(e) =>
                                  setEditClothingData({ ...editClothingData, type: e.target.value })
                                }
                                style={{ padding: "5px" }}
                              >
                                {clothingTypes.map((t) => (
                                  <option key={t} value={t}>
                                    {getKoreanType(t)}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="number"
                                value={editClothingData.minTemp}
                                onChange={(e) =>
                                  setEditClothingData({ ...editClothingData, minTemp: e.target.value })
                                }
                                style={{ padding: "5px" }}
                              />
                              <input
                                type="number"
                                value={editClothingData.maxTemp}
                                onChange={(e) =>
                                  setEditClothingData({ ...editClothingData, maxTemp: e.target.value })
                                }
                                style={{ padding: "5px" }}
                              />
                              <input
                                type="text"
                                value={editClothingData.image}
                                onChange={(e) =>
                                  setEditClothingData({ ...editClothingData, image: e.target.value })
                                }
                                style={{ padding: "5px" }}
                              />
                            </div>
                          </div>

                          {/* 날씨 체크박스 */}
                          <div style={{ marginTop: "8px" }}>
                            <label style={{ fontWeight: "bold", marginBottom: "5px", display: "block" }}>
                              날씨:
                            </label>
                            {weatherOptions.map((option) => (
                              <label key={option} style={{ marginRight: "10px" }}>
                                <input
                                  type="checkbox"
                                  value={option}
                                  checked={editClothingData.weather
                                    .split(",")
                                    .map((w) => w.trim())
                                    .includes(option)}
                                  onChange={handleEditWeatherChange}
                                />
                                {option}
                              </label>
                            ))}
                          </div>

                          {/* 설명 */}
                          <textarea
                            value={editClothingData.description}
                            onChange={(e) =>
                              setEditClothingData({ ...editClothingData, description: e.target.value })
                            }
                            style={{ marginTop: "8px", padding: "5px", width: "100%", height: "60px" }}
                          />

                          {/* 숨긴 id 필드 (또는 사용 안 해도 무방) */}
                          <input type="hidden" value={editClothingData.id} />

                          <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                            <button
                              type="submit"
                              style={{
                                padding: "5px 10px",
                                backgroundColor: "#8BC34A",
                                color: "#FFF",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                              }}
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              style={{
                                padding: "5px 10px",
                                backgroundColor: "#F44336",
                                color: "#FFF",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                              }}
                            >
                              취소
                            </button>
                          </div>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ marginLeft: "10px" }}>등록된 {getKoreanType(type)}가 없습니다.</p>
              )}
              <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", alignItems: "center" }}>
                <button
                  onClick={() => handlePageChange(type, -1)}
                  disabled={pagination[type].page === 1}
                  style={{
                    margin: "0 5px",
                    padding: "5px 10px",
                    backgroundColor: pagination[type].page === 1 ? "#CCC" : "#CFD8DC",
                    color: "#333",
                    border: "none",
                    borderRadius: "5px",
                    cursor: pagination[type].page === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  이전
                </button>
                <span style={{ margin: "0 10px" }}>
                  페이지 {pagination[type].page} / {totalPages(type)}
                </span>
                <button
                  onClick={() => handlePageChange(type, 1)}
                  disabled={pagination[type].page === totalPages(type)}
                  style={{
                    margin: "0 5px",
                    padding: "5px 10px",
                    backgroundColor:
                      pagination[type].page === totalPages(type) ? "#CCC" : "#CFD8DC",
                    color: "#333",
                    border: "none",
                    borderRadius: "5px",
                    cursor: pagination[type].page === totalPages(type) ? "not-allowed" : "pointer",
                  }}
                >
                  다음
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 옷(신발 포함) 추가 폼 */}
        <div
          style={{
            flex: "1",
            border: "1px solid #E0E0E0",
            padding: "20px",
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ color: "#424242" }}>새 옷 추가</h2>
          <form onSubmit={handleAddClothing} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input
              type="text"
              placeholder="이름"
              value={newClothing.name}
              onChange={(e) => setNewClothing({ ...newClothing, name: e.target.value })}
              required
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #E0E0E0",
              }}
            />
            <select
              value={newClothing.type}
              onChange={(e) => setNewClothing({ ...newClothing, type: e.target.value })}
              required
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #E0E0E0",
              }}
            >
              {clothingTypes.map((type) => (
                <option key={type} value={type}>
                  {getKoreanType(type)}
                </option>
              ))}
            </select>
            <div>
              <label style={{ fontWeight: "bold", marginBottom: "10px", display: "block" }}>날씨:</label>
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
              placeholder="최저 온도"
              value={newClothing.minTemp}
              onChange={(e) => setNewClothing({ ...newClothing, minTemp: e.target.value })}
              required
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #E0E0E0",
              }}
            />
            <input
              type="number"
              placeholder="최고 온도"
              value={newClothing.maxTemp}
              onChange={(e) => setNewClothing({ ...newClothing, maxTemp: e.target.value })}
              required
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #E0E0E0",
              }}
            />
            <input
              type="text"
              placeholder="이미지 URL"
              value={newClothing.image}
              onChange={(e) => setNewClothing({ ...newClothing, image: e.target.value })}
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #E0E0E0",
              }}
            />
            <textarea
              placeholder="설명"
              value={newClothing.description}
              onChange={(e) => setNewClothing({ ...newClothing, description: e.target.value })}
              required
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #E0E0E0",
                resize: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#B0BEC5",
                color: "#FFF",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              추가하기
            </button>
          </form>
        </div>
      </div>

      <hr style={{ margin: "20px 0", border: "1px solid #E0E0E0" }} />

      {/* 날씨 기반 추천 섹션 */}
      <h2 style={{ color: "#424242" }}>날씨 기반 패션 추천</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="도시를 입력하세요"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            padding: "10px",
            marginRight: "10px",
            borderRadius: "5px",
            border: "1px solid #E0E0E0",
          }}
        />
        <button
          onClick={fetchRecommendations}
          style={{
            padding: "10px 20px",
            backgroundColor: "#CFD8DC",
            color: "#333",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          추천받기
        </button>
      </div>

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {weatherInfo.weather && (
        <div style={{ marginTop: "20px" }}>
          <h2 style={{ color: "#424242" }}>현재 날씨: {weatherInfo.weather}</h2>
          <h3>기온: {weatherInfo.temperature}°C</h3>
        </div>
      )}

      {recommendations && (
        <div>
          <h2 style={{ color: "#424242" }}>추천 옷:</h2>
          {["Outer", "Tops", "Bottoms", "Shoes"].map((type) => (
            <div key={type} style={{ marginBottom: "20px" }}>
              <h3 style={{ color: "#333" }}>{getKoreanType(type)}</h3>
              {recommendations[type] ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#FFFFFF",
                    padding: "10px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    border: "1px solid #E0E0E0",
                  }}
                >
                  <img
                    src={recommendations[type].image}
                    alt={recommendations[type].name}
                    style={{
                      width: "100px",
                      height: "100px",
                      marginRight: "20px",
                      borderRadius: "8px",
                    }}
                  />
                  <div>
                    <h4 style={{ color: "#333" }}>{recommendations[type].name}</h4>
                    <p>{recommendations[type].description}</p>
                    <p>
                      <strong>온도 범위:</strong> {recommendations[type].minTemp}°C -{" "}
                      {recommendations[type].maxTemp}°C
                    </p>
                    <p>
                      <strong>날씨:</strong> {recommendations[type].weather}
                    </p>
                  </div>
                </div>
              ) : (
                <p>{getKoreanType(type)}에 대한 추천이 없습니다.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {recommendations === null && !loading && !error && (
        <p>현재 날씨 조건에 맞는 옷 추천이 없습니다.</p>
      )}
    </main>
  );
}

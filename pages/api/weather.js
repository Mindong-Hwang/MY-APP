import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { city } = req.query;

    if (!city) {
      res.status(400).json({ error: "City is required" });
      return;
    }

    try {
      // WeatherAPI 호출
      const response = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`
      );

      const weather = response.data;

      // 날씨 상태를 그룹화하는 함수
      const mapConditionToGroup = (conditionText) => {
        const condition = conditionText.toLowerCase(); // 소문자로 변환
        if (["clear", "sunny", "partly cloudy"].includes(condition)) return "Sunny";
        if (["cloudy", "overcast", "mist", "fog", "freezing fog"].includes(condition)) return "Cloudy";
        if (
          [
            "patchy rain possible",
            "patchy rain nearby", // 추가된 항목
            "light rain",
            "moderate rain",
            "heavy rain",
            "torrential rain shower",
            "patchy light drizzle",
            "light drizzle",
            "freezing drizzle",
            "heavy freezing drizzle",
          ].includes(condition)
        )
          return "Rain";
        if (
          [
            "light rain shower",
            "moderate or heavy rain shower",
            "light sleet",
            "moderate or heavy sleet",
            "light sleet showers",
            "moderate or heavy sleet showers",
          ].includes(condition)
        )
          return "Shower";
        if (
          [
            "patchy snow possible",
            "patchy light snow",
            "light snow",
            "moderate snow",
            "heavy snow",
            "patchy heavy snow",
            "blowing snow",
            "blizzard",
            "light snow showers",
            "moderate or heavy snow showers",
          ].includes(condition)
        )
          return "Snow";
        if (
          ["ice pellets", "light showers of ice pellets", "moderate or heavy showers of ice pellets"].includes(
            condition
          )
        )
          return "Pellets";
        if (
          [
            "thundery outbreaks possible",
            "patchy light rain with thunder",
            "moderate or heavy rain with thunder",
            "patchy light snow with thunder",
            "moderate or heavy snow with thunder",
          ].includes(condition)
        )
          return "Thunder";
        return conditionText; // 매칭되지 않으면 원래 값 반환
      };

      const groupedWeather = mapConditionToGroup(weather.current.condition.text);

      res.status(200).json({
        temperature: weather.current.temp_c,
        weather: groupedWeather,
      });
    } catch (error) {
      console.error("Error fetching weather data:", error.message);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { city } = req.query;

    if (!city) {
      res.status(400).json({ error: "City is required." });
      return;
    }

    try {
      // 1) 현재 날씨/온도를 가져오기
      const weatherResponse = await fetch(`http://localhost:3000/api/weather?city=${city}`);
      if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather data.");
      }
      const weatherData = await weatherResponse.json();
      const { temperature, weather } = weatherData; // 예: { temperature: 25, weather: "Cloudy" }

      // 2) "Shoes" 타입을 포함해, 각 타입별로 날씨/온도 조건에 맞는 옷(또는 신발) 조회
      const clothingByType = {
        Outer: await prisma.clothing.findMany({
          where: {
            type: "Outer",
            AND: [
              { minTemp: { lte: temperature } },
              { maxTemp: { gte: temperature } },
              { weather: { contains: weather } },
            ],
          },
        }),
        Tops: await prisma.clothing.findMany({
          where: {
            type: "Tops",
            AND: [
              { minTemp: { lte: temperature } },
              { maxTemp: { gte: temperature } },
              { weather: { contains: weather } },
            ],
          },
        }),
        Bottoms: await prisma.clothing.findMany({
          where: {
            type: "Bottoms",
            AND: [
              { minTemp: { lte: temperature } },
              { maxTemp: { gte: temperature } },
              { weather: { contains: weather } },
            ],
          },
        }),
        // -------------------------
        // 신발 항목 추가 (Shoes)
        Shoes: await prisma.clothing.findMany({
          where: {
            type: "Shoes",
            AND: [
              { minTemp: { lte: temperature } },
              { maxTemp: { gte: temperature } },
              { weather: { contains: weather } },
            ],
          },
        }),
        // -------------------------
      };

      // 3) 각 타입별로 무작위 아이템 1개씩 추천
      const recommendations = Object.entries(clothingByType).reduce((result, [type, items]) => {
        if (items.length > 0) {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          result[type] = randomItem;
        } else {
          result[type] = null;
        }
        return result;
      }, {});

      // 4) 응답
      res.status(200).json({
        temperature,
        weather,
        recommendations,
      });
    } catch (error) {
      console.error("Error fetching recommendations:", error.message);
      res.status(500).json({ error: "Failed to fetch recommendations." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

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
      // Fetch weather data
      const weatherResponse = await fetch(`http://localhost:3000/api/weather?city=${city}`);
      if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather data.");
      }
      const weatherData = await weatherResponse.json();
      const { temperature, weather } = weatherData; // `weather` is the response value to match

      // Query clothing data for each type
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
      };

      // Randomly select one item from each type
      const recommendations = Object.entries(clothingByType).reduce((result, [type, items]) => {
        if (items.length > 0) {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          result[type] = randomItem;
        } else {
          result[type] = null; // No recommendation for this type
        }
        return result;
      }, {});

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

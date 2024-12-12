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
      const { temperature, weather } = weatherData;

      // Query clothing data from the database
      const clothingData = await prisma.clothing.findMany({
        where: {
          AND: [
            { minTemp: { lte: temperature } },
            { maxTemp: { gte: temperature } },
          ],
        },
      });

      // Filter by weather condition manually
      const filteredClothing = clothingData.filter((item) =>
        item.weather.split(",").map((w) => w.trim()).includes(weather)
      );

      res.status(200).json({
        temperature,
        weather,
        recommendations: filteredClothing,
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

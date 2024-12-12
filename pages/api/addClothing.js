import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, minTemp, maxTemp, weather, image, description } = req.body;

    if (!name || !minTemp || !maxTemp || !weather || !description) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }

    try {
      const newClothing = await prisma.clothing.create({
        data: {
          name,
          minTemp: parseInt(minTemp, 10),
          maxTemp: parseInt(maxTemp, 10),
          weather,
          image: image || "/images/default.jpg", // Default image if not provided
          description,
        },
      });

      res.status(201).json(newClothing);
    } catch (error) {
      console.error("Error adding clothing:", error.message);
      res.status(500).json({ error: "Failed to add clothing." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

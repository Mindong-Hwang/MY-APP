import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const clothingData = await prisma.clothing.findMany();
      res.status(200).json(clothingData);
    } catch (error) {
      console.error("Error fetching clothing data:", error.message);
      res.status(500).json({ error: "Failed to fetch clothing data." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

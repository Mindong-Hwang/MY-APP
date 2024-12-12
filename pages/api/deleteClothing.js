import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    const { id } = req.query; // req.query로 변경

    if (!id) {
      res.status(400).json({ error: "Clothing ID is required." });
      return;
    }

    try {
      // ID를 정수로 변환
      const clothingId = parseInt(id, 10);

      if (isNaN(clothingId)) {
        res.status(400).json({ error: "Invalid ID." });
        return;
      }

      await prisma.clothing.delete({
        where: { id: clothingId },
      });

      res.status(200).json({ message: "Clothing deleted successfully." });
    } catch (error) {
      console.error("Error deleting clothing:", error.message);
      res.status(500).json({ error: "Failed to delete clothing." });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

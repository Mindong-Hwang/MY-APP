// pages/api/updateClothing.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "PUT") {
    try {
      // 요청 바디에서 업데이트할 필드를 추출합니다.
      const {
        id,          // DB에 저장된 옷의 고유 id
        name,
        type,
        minTemp,
        maxTemp,
        weather,
        image,
        description,
      } = req.body;

      // 필수값 체크 (id가 없으면 업데이트 불가)
      if (!id) {
        return res.status(400).json({ error: "ID is required to update clothing." });
      }

      // Prisma를 이용해 DB에서 해당 id 레코드를 업데이트
      const updatedClothing = await prisma.clothing.update({
        where: { id: Number(id) }, // id가 number여야 합니다.
        data: {
          name,
          type,
          minTemp,
          maxTemp,
          weather,
          image,
          description,
        },
      });

      return res.status(200).json({
        message: "Clothing item updated successfully.",
        updatedClothing,
      });
    } catch (error) {
      console.error("Error updating clothing:", error);
      return res.status(500).json({ error: "Failed to update clothing." });
    }
  } else {
    // PUT 이외의 요청은 허용하지 않습니다.
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

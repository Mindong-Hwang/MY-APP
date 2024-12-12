import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.clothing.createMany({
    data: [
      {
        name: "Winter Jacket",
        minTemp: -20,
        maxTemp: 5,
        weather: "Snow",
        image: "/images/winter_jacket.jpg",
        description: "A heavy-duty jacket for freezing temperatures and snowy days."
      },
      {
        name: "Raincoat",
        minTemp: 0,
        maxTemp: 20,
        weather: "Rain",
        image: "/images/raincoat.jpg",
        description: "A waterproof coat perfect for wet conditions."
      },
      // Add more items here...
    ]
  });
}

main()
  .then(() => console.log("Database seeded!"))
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

const categories = [
  {
    name: "Pilates",
    slug: "pilates",
    description: "Reformer pilates sessions",
    icon: "Heart",
    color: "#FF6B35",
  },
  {
    name: "Finance",
    slug: "finanzas",
    description: "Investments, financial planning, accounting, taxes",
    icon: "TrendingUp",
    color: "#00D4AA",
  },
  {
    name: "Health",
    slug: "salud",
    description: "Psychology, nutrition, life coaching, wellness",
    icon: "Heart",
    color: "#EF4444",
  },
  {
    name: "Technology",
    slug: "tecnologia",
    description: "IT, digital marketing, web development, cybersecurity",
    icon: "Cpu",
    color: "#8B5CF6",
  },
  {
    name: "Education",
    slug: "educacion",
    description: "Tutoring, professional training, languages, academic prep",
    icon: "GraduationCap",
    color: "#F59E0B",
  },
  {
    name: "Business",
    slug: "negocios",
    description: "Business consulting, entrepreneurship, management, strategy",
    icon: "Briefcase",
    color: "#1A1A2E",
  },
  {
    name: "Design",
    slug: "diseno",
    description: "Graphic design, UX/UI, branding, architecture",
    icon: "Palette",
    color: "#EC4899",
  },
  {
    name: "Engineering",
    slug: "ingenieria",
    description: "Civil, industrial, mechanical, electrical engineering",
    icon: "Wrench",
    color: "#6366F1",
  },
  {
    name: "Marketing",
    slug: "marketing",
    description: "Digital strategy, social media, SEO, advertising",
    icon: "Megaphone",
    color: "#14B8A6",
  },
  {
    name: "Human Resources",
    slug: "recursos-humanos",
    description: "Recruitment, training, labor law compliance",
    icon: "Users",
    color: "#F97316",
  },
];

async function seedCategories() {
  const { prisma } = await import("../src/lib/prisma");

  console.log("🌱 Seeding categories...\n");

  for (const category of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: category.slug } });
    if (!existing) {
      await prisma.category.create({
        data: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          color: category.color,
          isActive: true,
        },
      });
      console.log(`✅ Created: ${category.name}`);
    } else {
      console.log(`⏭️  Already exists: ${category.name}`);
    }
  }

  await prisma.$disconnect();
  console.log("\n✅ Categories seeded successfully");
}

seedCategories().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

const categories = [
  {
    name: "Pilates",
    slug: "pilates",
    description: "Mat, reformer, and private pilates sessions",
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
  // Use direct SQL connection
  const { Pool } = require("pg");
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("🌱 Seeding categories...\n");

    for (const category of categories) {
      // Check if exists
      const existing = await pool.query(
        "SELECT id FROM categories WHERE slug = $1",
        [category.slug]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          "INSERT INTO categories (id, name, slug, description, icon, color, \"isActive\", \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, true, NOW(), NOW())",
          [category.name, category.slug, category.description, category.icon, category.color]
        );
        console.log(`✅ Created: ${category.name}`);
      } else {
        console.log(`⏭️  Already exists: ${category.name}`);
      }
    }

    console.log("\n✅ Categories seeded successfully");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await pool.end();
  }
}

seedCategories();

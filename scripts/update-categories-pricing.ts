import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

const categories = [
  {
    name: "Legal",
    slug: "legal",
    description: "Lawyers, contracts, corporate law, labor law, civil law",
    icon: "Scale",
    color: "#FF6B35",
    minimumPriceCents: 50000, // $500
    feePercentage: 15,
  },
  {
    name: "Finance",
    slug: "finanzas",
    description: "Investments, financial planning, accounting, taxes",
    icon: "TrendingUp",
    color: "#00D4AA",
    minimumPriceCents: 50000, // $500
    feePercentage: 15,
  },
  {
    name: "Health",
    slug: "salud",
    description: "Psychology, nutrition, life coaching, wellness",
    icon: "Heart",
    color: "#EF4444",
    minimumPriceCents: 30000, // $300
    feePercentage: 12,
  },
  {
    name: "Technology",
    slug: "tecnologia",
    description: "IT, digital marketing, web development, cybersecurity",
    icon: "Cpu",
    color: "#8B5CF6",
    minimumPriceCents: 40000, // $400
    feePercentage: 15,
  },
  {
    name: "Education",
    slug: "educacion",
    description: "Tutoring, professional training, languages, academic prep",
    icon: "GraduationCap",
    color: "#F59E0B",
    minimumPriceCents: 25000, // $250
    feePercentage: 12,
  },
  {
    name: "Business",
    slug: "negocios",
    description: "Business consulting, entrepreneurship, management, strategy",
    icon: "Briefcase",
    color: "#1A1A2E",
    minimumPriceCents: 50000, // $500
    feePercentage: 18,
  },
  {
    name: "Design",
    slug: "diseno",
    description: "Graphic design, UX/UI, branding, architecture",
    icon: "Palette",
    color: "#EC4899",
    minimumPriceCents: 35000, // $350
    feePercentage: 15,
  },
  {
    name: "Engineering",
    slug: "ingenieria",
    description: "Civil, industrial, mechanical, electrical engineering",
    icon: "Wrench",
    color: "#6366F1",
    minimumPriceCents: 45000, // $450
    feePercentage: 15,
  },
  {
    name: "Marketing",
    slug: "marketing",
    description: "Digital strategy, social media, SEO, advertising",
    icon: "Megaphone",
    color: "#14B8A6",
    minimumPriceCents: 35000, // $350
    feePercentage: 15,
  },
  {
    name: "Human Resources",
    slug: "recursos-humanos",
    description: "Recruitment, training, labor law compliance",
    icon: "Users",
    color: "#F97316",
    minimumPriceCents: 40000, // $400
    feePercentage: 15,
  },
];

async function updateCategories() {
  const { Pool } = require("pg");
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log(" Updating categories with prices and fees...\n");

    for (const category of categories) {
      const existing = await pool.query(
        "SELECT id FROM categories WHERE slug = $1",
        [category.slug]
      );

      if (existing.rows.length > 0) {
        await pool.query(
          `UPDATE categories 
           SET "minimumPriceCents" = $1, "feePercentage" = $2, "updatedAt" = NOW()
           WHERE slug = $3`,
          [category.minimumPriceCents, category.feePercentage, category.slug]
        );
        console.log(`✅ Updated: ${category.name} - Minimum: $${category.minimumPriceCents / 100}, Fee: ${category.feePercentage}%`);
      } else {
        await pool.query(
          `INSERT INTO categories (id, name, slug, description, icon, color, "minimumPriceCents", "feePercentage", "isActive", "createdAt", "updatedAt") 
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())`,
          [category.name, category.slug, category.description, category.icon, category.color, category.minimumPriceCents, category.feePercentage]
        );
        console.log(`✅ Created: ${category.name}`);
      }
    }

    console.log("\n✅ Categories updated successfully");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await pool.end();
  }
}

updateCategories();

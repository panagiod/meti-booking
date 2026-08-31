import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

const categories = [
  {
    name: "Legal",
    slug: "legal",
    description: "Abogados, contratos, derecho corporativo, laboral, civil",
    icon: "Scale",
    color: "#FF6B35",
    minimumPriceCents: 50000, // $500
    feePercentage: 15,
  },
  {
    name: "Finanzas",
    slug: "finanzas",
    description: "Inversiones, planificación financiera, contabilidad, impuestos",
    icon: "TrendingUp",
    color: "#00D4AA",
    minimumPriceCents: 50000, // $500
    feePercentage: 15,
  },
  {
    name: "Salud",
    slug: "salud",
    description: "Psicología, nutrición, coaching de vida, bienestar",
    icon: "Heart",
    color: "#EF4444",
    minimumPriceCents: 30000, // $300
    feePercentage: 12,
  },
  {
    name: "Tecnología",
    slug: "tecnologia",
    description: "IT, marketing digital, desarrollo web, ciberseguridad",
    icon: "Cpu",
    color: "#8B5CF6",
    minimumPriceCents: 40000, // $400
    feePercentage: 15,
  },
  {
    name: "Educación",
    slug: "educacion",
    description: "Tutorías, formación profesional, idiomas, preparación académica",
    icon: "GraduationCap",
    color: "#F59E0B",
    minimumPriceCents: 25000, // $250
    feePercentage: 12,
  },
  {
    name: "Negocios",
    slug: "negocios",
    description: "Consultoría empresarial, emprendimiento, management, estrategia",
    icon: "Briefcase",
    color: "#1A1A2E",
    minimumPriceCents: 50000, // $500
    feePercentage: 18,
  },
  {
    name: "Diseño",
    slug: "diseno",
    description: "Diseño gráfico, UX/UI, branding, arquitectura",
    icon: "Palette",
    color: "#EC4899",
    minimumPriceCents: 35000, // $350
    feePercentage: 15,
  },
  {
    name: "Ingeniería",
    slug: "ingenieria",
    description: "Ingeniería civil, industrial, mecánica, electrical",
    icon: "Wrench",
    color: "#6366F1",
    minimumPriceCents: 45000, // $450
    feePercentage: 15,
  },
  {
    name: "Marketing",
    slug: "marketing",
    description: "Estrategia digital, redes sociales, SEO, publicidad",
    icon: "Megaphone",
    color: "#14B8A6",
    minimumPriceCents: 35000, // $350
    feePercentage: 15,
  },
  {
    name: "Recursos Humanos",
    slug: "recursos-humanos",
    description: "Selección de personal, capacitación, legislación laboral",
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
    console.log(" Actualizando categorías con precios y fees...\n");

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
        console.log(`✅ Actualizada: ${category.name} - Mínimo: $${category.minimumPriceCents / 100}, Fee: ${category.feePercentage}%`);
      } else {
        await pool.query(
          `INSERT INTO categories (id, name, slug, description, icon, color, "minimumPriceCents", "feePercentage", "isActive", "createdAt", "updatedAt") 
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())`,
          [category.name, category.slug, category.description, category.icon, category.color, category.minimumPriceCents, category.feePercentage]
        );
        console.log(`✅ Creada: ${category.name}`);
      }
    }

    console.log("\n✅ Categorías actualizadas correctamente");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await pool.end();
  }
}

updateCategories();

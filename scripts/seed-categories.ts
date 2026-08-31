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
  },
  {
    name: "Finanzas",
    slug: "finanzas",
    description: "Inversiones, planificación financiera, contabilidad, impuestos",
    icon: "TrendingUp",
    color: "#00D4AA",
  },
  {
    name: "Salud",
    slug: "salud",
    description: "Psicología, nutrición, coaching de vida, bienestar",
    icon: "Heart",
    color: "#EF4444",
  },
  {
    name: "Tecnología",
    slug: "tecnologia",
    description: "IT, marketing digital, desarrollo web, ciberseguridad",
    icon: "Cpu",
    color: "#8B5CF6",
  },
  {
    name: "Educación",
    slug: "educacion",
    description: "Tutorías, formación profesional, idiomas, preparación académica",
    icon: "GraduationCap",
    color: "#F59E0B",
  },
  {
    name: "Negocios",
    slug: "negocios",
    description: "Consultoría empresarial, emprendimiento, management, estrategia",
    icon: "Briefcase",
    color: "#1A1A2E",
  },
  {
    name: "Diseño",
    slug: "diseno",
    description: "Diseño gráfico, UX/UI, branding, arquitectura",
    icon: "Palette",
    color: "#EC4899",
  },
  {
    name: "Ingeniería",
    slug: "ingenieria",
    description: "Ingeniería civil, industrial, mecánica, electrical",
    icon: "Wrench",
    color: "#6366F1",
  },
  {
    name: "Marketing",
    slug: "marketing",
    description: "Estrategia digital, redes sociales, SEO, publicidad",
    icon: "Megaphone",
    color: "#14B8A6",
  },
  {
    name: "Recursos Humanos",
    slug: "recursos-humanos",
    description: "Selección de personal, capacitación, legislación laboral",
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
    console.log("🌱 Poblando categorías...\n");

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
        console.log(`✅ Creada: ${category.name}`);
      } else {
        console.log(`⏭️  Ya existe: ${category.name}`);
      }
    }

    console.log("\n✅ Categorías pobladas correctamente");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await pool.end();
  }
}

seedCategories();

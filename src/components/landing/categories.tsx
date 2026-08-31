"use client";

import Link from "next/link";
import {
  Scale,
  TrendingUp,
  Heart,
  Cpu,
  GraduationCap,
  Briefcase,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    name: "Legal",
    slug: "legal",
    icon: Scale,
    color: "var(--primary)",
    bgColor: "var(--primary-light)",
    description: "Lawyers, contracts, corporate law",
    count: 45,
  },
  {
    name: "Finance",
    slug: "finanzas",
    icon: TrendingUp,
    color: "var(--accent)",
    bgColor: "var(--accent-light)",
    description: "Investments, financial planning",
    count: 32,
  },
  {
    name: "Health",
    slug: "salud",
    icon: Heart,
    color: "var(--error)",
    bgColor: "var(--error-light)",
    description: "Psychology, nutrition, life coaching",
    count: 28,
  },
  {
    name: "Technology",
    slug: "tecnologia",
    icon: Cpu,
    color: "#8b5cf6",
    bgColor: "#ede9fe",
    description: "IT, digital marketing, development",
    count: 56,
  },
  {
    name: "Education",
    slug: "educacion",
    icon: GraduationCap,
    color: "var(--warning)",
    bgColor: "var(--warning-light)",
    description: "Tutoring, professional training",
    count: 19,
  },
  {
    name: "Business",
    slug: "negocios",
    icon: Briefcase,
    color: "var(--secondary)",
    bgColor: "rgba(26, 26, 46, 0.1)",
    description: "Business consulting, entrepreneurship",
    count: 41,
  },
];

export function Categories() {
  return (
    <section className="py-20 bg-[var(--background)]">
      <div className="container-meti">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Find the advisor you need
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Browse our categories and connect with expert professionals in
            the field you need.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={`/services?category=${category.slug}`}
              className="group"
            >
              <div
                className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: category.bgColor }}
                >
                  <category.icon
                    className="w-7 h-7"
                    style={{ color: category.color }}
                  />
                </div>
                <h3 className="font-heading font-semibold text-[var(--text-primary)] mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)] hidden md:block mb-2">
                  {category.description}
                </p>
                <p className="text-xs font-medium" style={{ color: category.color }}>
                  {category.count} advisors
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-[var(--primary)] font-semibold hover:gap-3 transition-all duration-300"
          >
            View all advisors
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * EXECLEAD.AI — Company Logo Reliability Engine
 * ----------------------------------------------
 * Resilient logo loading, validation, brand-color fallback avatars,
 * and data standardization (country, industry, company size, status).
 */

export const SUPPORTED_FORMATS = ["svg", "png", "webp", "jpg", "jpeg"];

/* ===================== BRAND COLOR GENERATION ===================== */

const BRAND_PALETTE = [
  { from: "#6366f1", to: "#4f46e5" },
  { from: "#06b6d4", to: "#0891b2" },
  { from: "#a855f7", to: "#7c3aed" },
  { from: "#10b981", to: "#059669" },
  { from: "#f59e0b", to: "#d97706" },
  { from: "#ef4444", to: "#dc2626" },
  { from: "#ec4899", to: "#db2777" },
  { from: "#3b82f6", to: "#2563eb" },
  { from: "#14b8a6", to: "#0d9488" },
  { from: "#8b5cf6", to: "#7c3aed" },
  { from: "#f97316", to: "#ea580c" },
  { from: "#84cc16", to: "#65a30d" },
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getBrandColors(name) {
  const idx = hashString(name || "?") % BRAND_PALETTE.length;
  const c = BRAND_PALETTE[idx];
  return { from: c.from, to: c.to, gradient: `linear-gradient(135deg, ${c.from}, ${c.to})` };
}

export function getCompanyInitials(name) {
  if (!name || !name.trim()) return "?";
  const words = name.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/* ===================== LOGO VALIDATION ===================== */

export function getLogoFormat(url) {
  if (!url) return null;
  const match = url.match(/\.(svg|png|webp|jpe?g)(\?|$|#)/i);
  if (!match) return null;
  const fmt = match[1].toLowerCase();
  return fmt === "jpeg" ? "jpg" : fmt;
}

export function isSupportedFormat(url) {
  return SUPPORTED_FORMATS.includes(getLogoFormat(url));
}

/**
 * Validates a logo URL by attempting to load it as an image.
 * Checks: URL exists, supported format, image loads successfully.
 * Returns { valid, status, error, format }
 *   status: "valid" | "invalid" | "missing"
 */
export function validateLogoUrl(url) {
  return new Promise((resolve) => {
    if (!url || typeof url !== "string" || url.trim() === "") {
      resolve({ valid: false, status: "missing", error: "No logo URL provided", format: null });
      return;
    }
    const format = getLogoFormat(url);
    if (!format || !SUPPORTED_FORMATS.includes(format)) {
      resolve({ valid: false, status: "invalid", error: `Unsupported format. Use: ${SUPPORTED_FORMATS.join(", ")}`, format });
      return;
    }
    const img = new Image();
    const timeout = setTimeout(() => {
      img.src = "";
      resolve({ valid: false, status: "invalid", error: "Loading timed out", format });
    }, 10000);
    img.onload = () => {
      clearTimeout(timeout);
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        resolve({ valid: false, status: "invalid", error: "Image has no dimensions", format });
      } else {
        resolve({ valid: true, status: "valid", error: null, format });
      }
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve({ valid: false, status: "invalid", error: "Failed to load image (HTTP error or CORS blocked)", format });
    };
    img.src = url;
  });
}

/**
 * Synchronous initial status assessment — used during import/create.
 * Sets "pending" for URLs that need async validation, "invalid" for
 * unsupported formats, "missing" when no URL exists.
 */
export function assessLogoStatusSync(url) {
  if (!url || !url.trim()) return { status: "missing", error: "No logo URL provided" };
  const format = getLogoFormat(url);
  if (!format || !SUPPORTED_FORMATS.includes(format)) {
    return { status: "invalid", error: `Unsupported format. Use: ${SUPPORTED_FORMATS.join(", ")}` };
  }
  return { status: "pending", error: "" };
}

/**
 * Batch-validates logos with concurrency control.
 * Calls onProgress(processed, total) as each logo is checked.
 * Returns array of { id, logo_status, logo_error, logo_validated_at }
 */
export async function batchValidateLogos(companies, onProgress, concurrency = 5) {
  const results = [];
  const withUrls = companies.filter(c => c.logo_url && c.logo_url.trim());
  const missing = companies.filter(c => !c.logo_url || !c.logo_url.trim());
  const now = new Date().toISOString();

  for (const c of missing) {
    results.push({ id: c.id, logo_status: "missing", logo_error: "No logo URL", logo_validated_at: now });
  }

  const queue = [...withUrls];
  let processed = 0;
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const company = queue.shift();
      if (!company) break;
      const result = await validateLogoUrl(company.logo_url);
      results.push({
        id: company.id,
        logo_status: result.status,
        logo_error: result.error || "",
        logo_validated_at: new Date().toISOString(),
      });
      processed++;
      onProgress?.(processed, withUrls.length);
    }
  });
  await Promise.all(workers);
  return results;
}

/* ===================== DATA STANDARDIZATION ===================== */

const COUNTRY_ALIASES = {
  "usa": "United States", "us": "United States", "united states": "United States",
  "america": "United States", "united states of america": "United States",
  "uk": "United Kingdom", "united kingdom": "United Kingdom", "england": "United Kingdom",
  "great britain": "United Kingdom", "britain": "United Kingdom",
  "uae": "United Arab Emirates", "united arab emirates": "United Arab Emirates",
  "korea": "South Korea", "south korea": "South Korea", "republic of korea": "South Korea",
  "russia": "Russia", "russian federation": "Russia",
  "india": "India", "bharat": "India",
  "germany": "Germany", "deutschland": "Germany",
  "france": "France",
  "japan": "Japan",
  "china": "China", "prc": "China", "people's republic of china": "China",
  "canada": "Canada",
  "australia": "Australia",
  "brazil": "Brazil",
  "singapore": "Singapore",
  "netherlands": "Netherlands", "holland": "Netherlands",
  "sweden": "Sweden",
  "switzerland": "Switzerland",
  "ireland": "Ireland",
  "israel": "Israel",
  "saudi arabia": "Saudi Arabia",
  "south africa": "South Africa",
  "spain": "Spain",
  "italy": "Italy",
  "mexico": "Mexico",
  "indonesia": "Indonesia",
  "new zealand": "New Zealand",
  "finland": "Finland",
  "denmark": "Denmark",
  "norway": "Norway",
  "belgium": "Belgium",
  "austria": "Austria",
  "poland": "Poland",
  "turkey": "Turkey", "türkiye": "Turkey",
  "argentina": "Argentina",
  "chile": "Chile",
  "egypt": "Egypt",
  "nigeria": "Nigeria",
  "kenya": "Kenya",
  "portugal": "Portugal",
  "greece": "Greece",
};

const INDUSTRY_ALIASES = {
  "tech": "Technology", "technology": "Technology", "it": "Technology", "software": "Technology",
  "saas": "Technology", "internet": "Technology", "ai": "Technology", "artificial intelligence": "Technology",
  "data": "Technology", "cloud": "Technology", "cybersecurity": "Technology", "semiconductor": "Technology",
  "consulting": "Consulting", "management consulting": "Consulting", "advisory": "Consulting",
  "finance": "Finance", "financial services": "Finance", "banking": "Finance", "fintech": "Finance",
  "investment": "Finance", "insurance": "Finance", "asset management": "Finance",
  "healthcare": "Healthcare", "health": "Healthcare", "pharma": "Healthcare", "pharmaceutical": "Healthcare",
  "biotech": "Healthcare", "medical": "Healthcare", "life sciences": "Healthcare", "medical devices": "Healthcare",
  "government": "Government", "public sector": "Government",
  "energy": "Energy", "oil": "Energy", "oil & gas": "Energy", "oil and gas": "Energy",
  "utilities": "Energy", "renewable energy": "Energy", "clean energy": "Energy",
  "manufacturing": "Manufacturing", "industrial": "Manufacturing", "automotive": "Manufacturing",
  "aerospace": "Manufacturing", "defense": "Manufacturing", "chemicals": "Manufacturing",
  "retail": "Retail", "e-commerce": "Retail", "ecommerce": "Retail", "consumer goods": "Retail",
  "consumer": "Retail", "fashion": "Retail", "food & beverage": "Retail",
  "telecommunications": "Telecommunications", "telecom": "Telecommunications", "media": "Telecommunications",
  "entertainment": "Telecommunications", "streaming": "Telecommunications",
  "education": "Education", "edtech": "Education", "e-learning": "Education",
  "startups": "Startups", "startup": "Startups",
  "non-profit": "Non-Profit", "nonprofit": "Non-Profit", "ngo": "Non-Profit", "charity": "Non-Profit",
  "logistics": "Manufacturing", "supply chain": "Manufacturing", "transportation": "Manufacturing",
  "real estate": "Finance", "construction": "Manufacturing",
};

export function normalizeCountry(raw) {
  if (!raw) return "";
  const key = raw.trim().toLowerCase();
  return COUNTRY_ALIASES[key] || raw.trim();
}

export function normalizeIndustry(raw) {
  if (!raw) return "";
  const key = raw.trim().toLowerCase();
  return INDUSTRY_ALIASES[key] || raw.trim();
}

export function normalizeCompanySize(raw, employeeCount) {
  const ec = typeof employeeCount === "number" ? employeeCount : parseInt(employeeCount) || 0;
  if (ec > 0) {
    if (ec <= 10) return "Startup (1-10)";
    if (ec <= 50) return "Small (11-50)";
    if (ec <= 200) return "Medium (51-200)";
    if (ec <= 1000) return "Large (201-1,000)";
    if (ec <= 10000) return "Enterprise (1K-10K)";
    return "Global (10K+)";
  }
  if (!raw) return "";
  const s = String(raw).trim().toLowerCase();
  if (/startup|1.?10/.test(s)) return "Startup (1-10)";
  if (/small|11.?50/.test(s)) return "Small (11-50)";
  if (/medium|51.?200|mid/.test(s)) return "Medium (51-200)";
  if (/large|201.?1.?000/.test(s)) return "Large (201-1,000)";
  if (/enterprise|1k|1.?000\+|10.?000/.test(s)) return "Enterprise (1K-10K)";
  if (/global|10k\+|10.?000\+/.test(s)) return "Global (10K+)";
  return String(raw).trim();
}

export function normalizeStatus(raw) {
  if (!raw) return "approved";
  const s = String(raw).trim().toLowerCase();
  if (["active", "published", "live", "approved"].includes(s)) return "approved";
  if (["pending", "review", "in review"].includes(s)) return "review";
  if (["draft", "unpublished"].includes(s)) return "draft";
  if (["archived", "inactive", "disabled"].includes(s)) return "archived";
  return "approved";
}

export function standardizeCompany(company) {
  if (!company) return company;
  return {
    ...company,
    country: normalizeCountry(company.country),
    industry: normalizeIndustry(company.industry),
    company_size: normalizeCompanySize(company.company_size, company.employee_count),
    status: normalizeStatus(company.status),
  };
}
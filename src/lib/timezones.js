// ============================================================
// IANA TIME ZONE DATABASE
// Single source of truth for all tz database identifiers.
// Offsets are computed dynamically via Intl to respect DST.
// Always store the IANA identifier — never a static UTC offset.
// ============================================================

import { COUNTRIES, getCountryByName } from "./locations";

// Full IANA timezone list (tz database), grouped by region.
export const IANA_TIMEZONES = [
  "Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers",
  "Africa/Asmara", "Africa/Bamako", "Africa/Bangui", "Africa/Banjul",
  "Africa/Bissau", "Africa/Blantyre", "Africa/Brazzaville", "Africa/Bujumbura",
  "Africa/Cairo", "Africa/Casablanca", "Africa/Ceuta", "Africa/Conakry",
  "Africa/Dakar", "Africa/Dar_es_Salaam", "Africa/Djibouti", "Africa/Douala",
  "Africa/El_Aaiun", "Africa/Freetown", "Africa/Gaborone", "Africa/Harare",
  "Africa/Johannesburg", "Africa/Juba", "Africa/Kampala", "Africa/Khartoum",
  "Africa/Kigali", "Africa/Kinshasa", "Africa/Lagos", "Africa/Libreville",
  "Africa/Lome", "Africa/Luanda", "Africa/Lubumbashi", "Africa/Lusaka",
  "Africa/Malabo", "Africa/Maputo", "Africa/Maseru", "Africa/Mbabane",
  "Africa/Mogadishu", "Africa/Monrovia", "Africa/Nairobi", "Africa/Ndjamena",
  "Africa/Niamey", "Africa/Nouakchott", "Africa/Ouagadougou", "Africa/Porto-Novo",
  "Africa/Sao_Tome", "Africa/Tripoli", "Africa/Tunis", "Africa/Windhoek",

  "America/Adak", "America/Anchorage", "America/Anguilla", "America/Antigua",
  "America/Araguaina", "America/Argentina/Buenos_Aires", "America/Argentina/Catamarca",
  "America/Argentina/Cordoba", "America/Argentina/Jujuy", "America/Argentina/La_Rioja",
  "America/Argentina/Mendoza", "America/Argentina/Rio_Gallegos", "America/Argentina/Salta",
  "America/Argentina/San_Juan", "America/Argentina/San_Luis", "America/Argentina/Tucuman",
  "America/Argentina/Ushuaia", "America/Aruba", "America/Asuncion", "America/Atikokan",
  "America/Bahia", "America/Bahia_Banderas", "America/Barbados", "America/Belem",
  "America/Belize", "America/Blanc-Sablon", "America/Boa_Vista", "America/Bogota",
  "America/Boise", "America/Cambridge_Bay", "America/Campo_Grande", "America/Cancun",
  "America/Caracas", "America/Cayenne", "America/Cayman", "America/Chicago",
  "America/Chihuahua", "America/Costa_Rica", "America/Creston", "America/Cuiaba",
  "America/Curacao", "America/Danmarkshavn", "America/Dawson", "America/Dawson_Creek",
  "America/Denver", "America/Detroit", "America/Dominica", "America/Edmonton",
  "America/Eirunepe", "America/El_Salvador", "America/Fortaleza", "America/Fort_Nelson",
  "America/Glace_Bay", "America/Godthab", "America/Goose_Bay", "America/Grand_Turk",
  "America/Grenada", "America/Guadeloupe", "America/Guatemala", "America/Guayaquil",
  "America/Guyana", "America/Halifax", "America/Havana", "America/Hermosillo",
  "America/Indiana/Indianapolis", "America/Indiana/Knox", "America/Indiana/Marengo",
  "America/Indiana/Petersburg", "America/Indiana/Tell_City", "America/Indiana/Vevay",
  "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Inuvik",
  "America/Iqaluit", "America/Jamaica", "America/Juneau", "America/Kentucky/Louisville",
  "America/Kentucky/Monticello", "America/Kralendijk", "America/La_Paz",
  "America/Lima", "America/Los_Angeles", "America/Lower_Princes", "America/Maceio",
  "America/Managua", "America/Manaus", "America/Marigot", "America/Martinique",
  "America/Matamoros", "America/Mazatlan", "America/Menominee", "America/Merida",
  "America/Metlakatla", "America/Mexico_City", "America/Miquelon", "America/Moncton",
  "America/Monterrey", "America/Montevideo", "America/Montserrat", "America/Nassau",
  "America/New_York", "America/Nipigon", "America/Nome", "America/Noronha",
  "America/North_Dakota/Beulah", "America/North_Dakota/Center", "America/North_Dakota/New_Salem",
  "America/Nuuk", "America/Ojinaga", "America/Panama", "America/Pangnirtung",
  "America/Paramaribo", "America/Phoenix", "America/Port-au-Prince", "America/Port_of_Spain",
  "America/Porto_Velho", "America/Puerto_Rico", "America/Punta_Arenas",
  "America/Rainy_River", "America/Rankin_Inlet", "America/Recife", "America/Regina",
  "America/Resolute", "America/Rio_Branco", "America/Santarem", "America/Santiago",
  "America/Santo_Domingo", "America/Sao_Paulo", "America/Scoresbysund", "America/Sitka",
  "America/St_Barthelemy", "America/St_Johns", "America/St_Kitts", "America/St_Lucia",
  "America/St_Thomas", "America/St_Vincent", "America/Swift_Current", "America/Tegucigalpa",
  "America/Thule", "America/Thunder_Bay", "America/Tijuana", "America/Toronto",
  "America/Tortola", "America/Vancouver", "America/Whitehorse", "America/Winnipeg",
  "America/Yakutat", "America/Yellowknife",

  "Antarctica/Casey", "Antarctica/Davis", "Antarctica/DumontDUrville", "Antarctica/Macquarie",
  "Antarctica/Mawson", "Antarctica/McMurdo", "Antarctica/Palmer", "Antarctica/Rothera",
  "Antarctica/Syowa", "Antarctica/Troll", "Antarctica/Vostok",

  "Asia/Aden", "Asia/Almaty", "Asia/Amman", "Asia/Anadyr", "Asia/Aqtau", "Asia/Aqtobe",
  "Asia/Ashgabat", "Asia/Atyrau", "Asia/Baghdad", "Asia/Bahrain", "Asia/Baku",
  "Asia/Bangkok", "Asia/Barnaul", "Asia/Beirut", "Asia/Bishkek", "Asia/Brunei",
  "Asia/Chita", "Asia/Choibalsan", "Asia/Colombo", "Asia/Damascus", "Asia/Dhaka",
  "Asia/Dili", "Asia/Dubai", "Asia/Dushanbe", "Asia/Famagusta", "Asia/Gaza",
  "Asia/Hebron", "Asia/Ho_Chi_Minh", "Asia/Hong_Kong", "Asia/Hovd", "Asia/Irkutsk",
  "Asia/Jakarta", "Asia/Jayapura", "Asia/Jerusalem", "Asia/Kabul", "Asia/Kaliningrad",
  "Asia/Kamchatka", "Asia/Karachi", "Asia/Kathmandu", "Asia/Khandyga", "Asia/Kolkata",
  "Asia/Krasnoyarsk", "Asia/Kuala_Lumpur", "Asia/Kuching", "Asia/Kuwait", "Asia/Macau",
  "Asia/Makassar", "Asia/Manila", "Asia/Muscat", "Asia/Nicosia", "Asia/Novokuznetsk",
  "Asia/Novosibirsk", "Asia/Omsk", "Asia/Oral", "Asia/Phnom_Penh", "Asia/Pontianak",
  "Asia/Pyongyang", "Asia/Qatar", "Asia/Qostanay", "Asia/Qyzylorda", "Asia/Riyadh",
  "Asia/Sakhalin", "Asia/Samarkand", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore",
  "Asia/Srednekolymsk", "Asia/Taipei", "Asia/Tashkent", "Asia/Tbilisi", "Asia/Tehran",
  "Asia/Thimphu", "Asia/Tokyo", "Asia/Tomsk", "Asia/Ulaanbaatar", "Asia/Urumqi",
  "Asia/Ust-Nera", "Asia/Vientiane", "Asia/Vladivostok", "Asia/Yakutsk", "Asia/Yangon",
  "Asia/Yekaterinburg", "Asia/Yerevan",

  "Atlantic/Azores", "Atlantic/Bermuda", "Atlantic/Canary", "Atlantic/Cape_Verde",
  "Atlantic/Faroe", "Atlantic/Madeira", "Atlantic/Reykjavik", "Atlantic/South_Georgia",
  "Atlantic/St_Helena", "Atlantic/Stanley",

  "Australia/Adelaide", "Australia/Brisbane", "Australia/Broken_Hill", "Australia/Darwin",
  "Australia/Eucla", "Australia/Hobart", "Australia/Lindeman", "Australia/Lord_Howe",
  "Australia/Melbourne", "Australia/Perth", "Australia/Sydney",

  "Europe/Amsterdam", "Europe/Andorra", "Europe/Astrakhan", "Europe/Athens",
  "Europe/Belgrade", "Europe/Berlin", "Europe/Bratislava", "Europe/Brussels",
  "Europe/Bucharest", "Europe/Budapest", "Europe/Busingen", "Europe/Chisinau",
  "Europe/Copenhagen", "Europe/Dublin", "Europe/Gibraltar", "Europe/Guernsey",
  "Europe/Helsinki", "Europe/Isle_of_Man", "Europe/Istanbul", "Europe/Jersey",
  "Europe/Kaliningrad", "Europe/Kiev", "Europe/Kirov", "Europe/Lisbon",
  "Europe/Ljubljana", "Europe/London", "Europe/Luxembourg", "Europe/Madrid",
  "Europe/Malta", "Europe/Mariehamn", "Europe/Minsk", "Europe/Monaco",
  "Europe/Moscow", "Europe/Oslo", "Europe/Paris", "Europe/Podgorica",
  "Europe/Prague", "Europe/Riga", "Europe/Rome", "Europe/Samara",
  "Europe/San_Marino", "Europe/Sarajevo", "Europe/Saratov", "Europe/Simferopol",
  "Europe/Skopje", "Europe/Sofia", "Europe/Stockholm", "Europe/Tallinn",
  "Europe/Tirane", "Europe/Ulyanovsk", "Europe/Uzhgorod", "Europe/Vaduz",
  "Europe/Vatican", "Europe/Vienna", "Europe/Vilnius", "Europe/Volgograd",
  "Europe/Warsaw", "Europe/Zagreb", "Europe/Zaporozhye", "Europe/Zurich",

  "Indian/Antananarivo", "Indian/Chagos", "Indian/Christmas", "Indian/Cocos",
  "Indian/Comoro", "Indian/Kerguelen", "Indian/Mahe", "Indian/Maldives",
  "Indian/Mauritius", "Indian/Mayotte", "Indian/Reunion",

  "Pacific/Apia", "Pacific/Auckland", "Pacific/Bougainville", "Pacific/Chatham",
  "Pacific/Chuuk", "Pacific/Easter", "Pacific/Efate", "Pacific/Enderbury",
  "Pacific/Fakaofo", "Pacific/Fiji", "Pacific/Funafuti", "Pacific/Galapagos",
  "Pacific/Gambier", "Pacific/Guadalcanal", "Pacific/Guam", "Pacific/Honolulu",
  "Pacific/Kiritimati", "Pacific/Kosrae", "Pacific/Kwajalein", "Pacific/Majuro",
  "Pacific/Marquesas", "Pacific/Midway", "Pacific/Nauru", "Pacific/Niue",
  "Pacific/Norfolk", "Pacific/Noumea", "Pacific/Pago_Pago", "Pacific/Palau",
  "Pacific/Pitcairn", "Pacific/Pohnpei", "Pacific/Port_Moresby", "Pacific/Rarotonga",
  "Pacific/Saipan", "Pacific/Tahiti", "Pacific/Tarawa", "Pacific/Tongatapu",
  "Pacific/Wake", "Pacific/Wallis",

  "UTC",
];

// Map IANA timezone → country code for flag display.
const tzToCountry = new Map();
for (const c of COUNTRIES) {
  for (const tz of c.timezones) {
    if (!tzToCountry.has(tz)) tzToCountry.set(tz, c);
  }
}

function flagEmoji(code) {
  if (!code || code.length !== 2) return "🏳️";
  return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

/**
 * Compute the current UTC offset (including DST) for an IANA timezone.
 * Returns minutes offset from UTC (e.g. +480 for UTC+8, -300 for UTC-5).
 */
export function getOffsetMinutes(tz, date = new Date()) {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    const parts = dtf.formatToParts(date);
    const map = {};
    for (const p of parts) map[p.type] = p.value;
    const asUTC = Date.UTC(
      parseInt(map.year), parseInt(map.month) - 1, parseInt(map.day),
      parseInt(map.hour === "24" ? "0" : map.hour), parseInt(map.minute), parseInt(map.second)
    );
    return Math.round((asUTC - date.getTime()) / 60000);
  } catch {
    return 0;
  }
}

/**
 * Format offset as "UTC+08:00", "UTC−05:00", "UTC±00:00".
 * Uses the proper minus sign (U+2212) for negative offsets.
 */
export function formatOffset(minutes) {
  const sign = minutes > 0 ? "+" : minutes < 0 ? "−" : "±";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getOffsetLabel(tz, date = new Date()) {
  return formatOffset(getOffsetMinutes(tz, date));
}

/**
 * Extract the city/region name from an IANA identifier.
 * "Asia/Manila" → "Manila", "America/Argentina/Buenos_Aires" → "Buenos Aires"
 */
export function getCity(tz) {
  const parts = tz.split("/");
  const last = parts[parts.length - 1].replace(/_/g, " ");
  return last;
}

export function getRegion(tz) {
  return tz.split("/")[0];
}

/**
 * Get the flag for a timezone based on its country.
 */
export function getTimezoneFlag(tz) {
  const country = tzToCountry.get(tz);
  return country ? flagEmoji(country.code) : "🌍";
}

export function getTimezoneCountry(tz) {
  return tzToCountry.get(tz) || null;
}

/**
 * Build the display label for a timezone.
 * "🇵🇭 Asia/Manila (UTC+08:00)"
 */
export function getTimezoneLabel(tz, date = new Date()) {
  return `${getTimezoneFlag(tz)} ${tz} (${getOffsetLabel(tz, date)})`;
}

/**
 * Get timezones for a given country name.
 */
export function getTimezonesForCountry(countryName) {
  const country = getCountryByName(countryName);
  return country?.timezones || [];
}

/**
 * Auto-detect the user's browser timezone via Intl.
 * Falls back to UTC if detection fails.
 */
export function detectBrowserTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && IANA_TIMEZONES.includes(tz)) return tz;
    return tz || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Check if a timezone currently observes DST.
 */
export function observesDST(tz, date = new Date()) {
  const jan = new Date(date.getFullYear(), 0, 15);
  const jul = new Date(date.getFullYear(), 6, 15);
  const janOffset = getOffsetMinutes(tz, jan);
  const julOffset = getOffsetMinutes(tz, jul);
  const currentOffset = getOffsetMinutes(tz, date);
  return Math.max(janOffset, julOffset) !== Math.min(janOffset, julOffset) && currentOffset === Math.max(janOffset, julOffset);
}

/**
 * Get the suggested timezone for a country.
 * Returns the first timezone, or the most common one.
 */
export function getSuggestedTimezone(countryName) {
  const tzs = getTimezonesForCountry(countryName);
  return tzs[0] || null;
}

/**
 * Sorted list of all timezones with metadata for rendering.
 */
export function getAllTimezones(date = new Date()) {
  return IANA_TIMEZONES.map((tz) => ({
    id: tz,
    city: getCity(tz),
    region: getRegion(tz),
    flag: getTimezoneFlag(tz),
    offset: getOffsetMinutes(tz, date),
    offsetLabel: getOffsetLabel(tz, date),
    label: getTimezoneLabel(tz, date),
  })).sort((a, b) => a.offset - b.offset || a.city.localeCompare(b.city));
}
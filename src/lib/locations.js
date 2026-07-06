// ============================================================
// GLOBAL LOCATION REFERENCE TABLE
// Single source of truth for all ISO 3166-1 countries.
// Includes dial codes (E.164), currencies (ISO 4217),
// IANA time zones, and tax rates (billing-compatible).
// Do not hardcode country values in components — import from here.
// ============================================================

function flag(code) {
  if (!code || code.length !== 2) return "🏳️";
  return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export const COUNTRIES = [
  { code: "AF", name: "Afghanistan", dialCode: "+93", currency: "AFN", timezones: ["Asia/Kabul"] },
  { code: "AL", name: "Albania", dialCode: "+355", currency: "ALL", timezones: ["Europe/Tirane"] },
  { code: "DZ", name: "Algeria", dialCode: "+213", currency: "DZD", timezones: ["Africa/Algiers"] },
  { code: "AD", name: "Andorra", dialCode: "+376", currency: "EUR", timezones: ["Europe/Andorra"] },
  { code: "AO", name: "Angola", dialCode: "+244", currency: "AOA", timezones: ["Africa/Luanda"] },
  { code: "AG", name: "Antigua and Barbuda", dialCode: "+1", currency: "XCD", timezones: ["America/Antigua"] },
  { code: "AR", name: "Argentina", dialCode: "+54", currency: "ARS", timezones: ["America/Argentina/Buenos_Aires"] },
  { code: "AM", name: "Armenia", dialCode: "+374", currency: "AMD", timezones: ["Asia/Yerevan"] },
  { code: "AU", name: "Australia", dialCode: "+61", currency: "AUD", timezones: ["Australia/Sydney", "Australia/Perth", "Australia/Adelaide", "Australia/Brisbane", "Australia/Darwin", "Australia/Hobart"] },
  { code: "AT", name: "Austria", dialCode: "+43", currency: "EUR", timezones: ["Europe/Vienna"], taxRate: 0.2 },
  { code: "AZ", name: "Azerbaijan", dialCode: "+994", currency: "AZN", timezones: ["Asia/Baku"] },
  { code: "BS", name: "Bahamas", dialCode: "+1", currency: "BSD", timezones: ["America/Nassau"] },
  { code: "BH", name: "Bahrain", dialCode: "+973", currency: "BHD", timezones: ["Asia/Bahrain"] },
  { code: "BD", name: "Bangladesh", dialCode: "+880", currency: "BDT", timezones: ["Asia/Dhaka"] },
  { code: "BB", name: "Barbados", dialCode: "+1", currency: "BBD", timezones: ["America/Barbados"] },
  { code: "BY", name: "Belarus", dialCode: "+375", currency: "BYN", timezones: ["Europe/Minsk"] },
  { code: "BE", name: "Belgium", dialCode: "+32", currency: "EUR", timezones: ["Europe/Brussels"], taxRate: 0.21 },
  { code: "BZ", name: "Belize", dialCode: "+501", currency: "BZD", timezones: ["America/Belize"] },
  { code: "BJ", name: "Benin", dialCode: "+229", currency: "XOF", timezones: ["Africa/Porto-Novo"] },
  { code: "BT", name: "Bhutan", dialCode: "+975", currency: "BTN", timezones: ["Asia/Thimphu"] },
  { code: "BO", name: "Bolivia", dialCode: "+591", currency: "BOB", timezones: ["America/La_Paz"] },
  { code: "BA", name: "Bosnia and Herzegovina", dialCode: "+387", currency: "BAM", timezones: ["Europe/Sarajevo"] },
  { code: "BW", name: "Botswana", dialCode: "+267", currency: "BWP", timezones: ["Africa/Gaborone"] },
  { code: "BR", name: "Brazil", dialCode: "+55", currency: "BRL", timezones: ["America/Sao_Paulo", "America/Manaus", "America/Fortaleza"], taxRate: 0.17 },
  { code: "BN", name: "Brunei", dialCode: "+673", currency: "BND", timezones: ["Asia/Brunei"] },
  { code: "BG", name: "Bulgaria", dialCode: "+359", currency: "BGN", timezones: ["Europe/Sofia"] },
  { code: "BF", name: "Burkina Faso", dialCode: "+226", currency: "XOF", timezones: ["Africa/Ouagadougou"] },
  { code: "BI", name: "Burundi", dialCode: "+257", currency: "BIF", timezones: ["Africa/Bujumbura"] },
  { code: "KH", name: "Cambodia", dialCode: "+855", currency: "KHR", timezones: ["Asia/Phnom_Penh"] },
  { code: "CM", name: "Cameroon", dialCode: "+237", currency: "XAF", timezones: ["Africa/Douala"] },
  { code: "CA", name: "Canada", dialCode: "+1", currency: "CAD", timezones: ["America/Toronto", "America/Vancouver", "America/Edmonton", "America/Winnipeg", "America/Halifax", "America/St_Johns"], taxRate: 0.05 },
  { code: "CV", name: "Cape Verde", dialCode: "+238", currency: "CVE", timezones: ["Atlantic/Cape_Verde"] },
  { code: "CF", name: "Central African Republic", dialCode: "+236", currency: "XAF", timezones: ["Africa/Bangui"] },
  { code: "TD", name: "Chad", dialCode: "+235", currency: "XAF", timezones: ["Africa/Ndjamena"] },
  { code: "CL", name: "Chile", dialCode: "+56", currency: "CLP", timezones: ["America/Santiago", "America/Punta_Arenas"] },
  { code: "CN", name: "China", dialCode: "+86", currency: "CNY", timezones: ["Asia/Shanghai", "Asia/Urumqi"] },
  { code: "CO", name: "Colombia", dialCode: "+57", currency: "COP", timezones: ["America/Bogota"] },
  { code: "KM", name: "Comoros", dialCode: "+269", currency: "KMF", timezones: ["Indian/Comoro"] },
  { code: "CG", name: "Congo", dialCode: "+242", currency: "XAF", timezones: ["Africa/Brazzaville"] },
  { code: "CD", name: "Congo (DRC)", dialCode: "+243", currency: "CDF", timezones: ["Africa/Kinshasa", "Africa/Lubumbashi"] },
  { code: "CR", name: "Costa Rica", dialCode: "+506", currency: "CRC", timezones: ["America/Costa_Rica"] },
  { code: "CI", name: "Côte d'Ivoire", dialCode: "+225", currency: "XOF", timezones: ["Africa/Abidjan"] },
  { code: "HR", name: "Croatia", dialCode: "+385", currency: "EUR", timezones: ["Europe/Zagreb"] },
  { code: "CU", name: "Cuba", dialCode: "+53", currency: "CUP", timezones: ["America/Havana"] },
  { code: "CY", name: "Cyprus", dialCode: "+357", currency: "EUR", timezones: ["Asia/Nicosia"] },
  { code: "CZ", name: "Czech Republic", dialCode: "+420", currency: "CZK", timezones: ["Europe/Prague"] },
  { code: "DK", name: "Denmark", dialCode: "+45", currency: "DKK", timezones: ["Europe/Copenhagen"] },
  { code: "DJ", name: "Djibouti", dialCode: "+253", currency: "DJF", timezones: ["Africa/Djibouti"] },
  { code: "DM", name: "Dominica", dialCode: "+1", currency: "XCD", timezones: ["America/Dominica"] },
  { code: "DO", name: "Dominican Republic", dialCode: "+1", currency: "DOP", timezones: ["America/Santo_Domingo"] },
  { code: "EC", name: "Ecuador", dialCode: "+593", currency: "USD", timezones: ["America/Guayaquil"] },
  { code: "EG", name: "Egypt", dialCode: "+20", currency: "EGP", timezones: ["Africa/Cairo"] },
  { code: "SV", name: "El Salvador", dialCode: "+503", currency: "USD", timezones: ["America/El_Salvador"] },
  { code: "GQ", name: "Equatorial Guinea", dialCode: "+240", currency: "XAF", timezones: ["Africa/Malabo"] },
  { code: "ER", name: "Eritrea", dialCode: "+291", currency: "ERN", timezones: ["Africa/Asmara"] },
  { code: "EE", name: "Estonia", dialCode: "+372", currency: "EUR", timezones: ["Europe/Tallinn"] },
  { code: "SZ", name: "Eswatini", dialCode: "+268", currency: "SZL", timezones: ["Africa/Mbabane"] },
  { code: "ET", name: "Ethiopia", dialCode: "+251", currency: "ETB", timezones: ["Africa/Addis_Ababa"] },
  { code: "FJ", name: "Fiji", dialCode: "+679", currency: "FJD", timezones: ["Pacific/Fiji"] },
  { code: "FI", name: "Finland", dialCode: "+358", currency: "EUR", timezones: ["Europe/Helsinki"] },
  { code: "FR", name: "France", dialCode: "+33", currency: "EUR", timezones: ["Europe/Paris"], taxRate: 0.2 },
  { code: "GA", name: "Gabon", dialCode: "+241", currency: "XAF", timezones: ["Africa/Libreville"] },
  { code: "GM", name: "Gambia", dialCode: "+220", currency: "GMD", timezones: ["Africa/Banjul"] },
  { code: "GE", name: "Georgia", dialCode: "+995", currency: "GEL", timezones: ["Asia/Tbilisi"] },
  { code: "DE", name: "Germany", dialCode: "+49", currency: "EUR", timezones: ["Europe/Berlin"], taxRate: 0.19 },
  { code: "GH", name: "Ghana", dialCode: "+233", currency: "GHS", timezones: ["Africa/Accra"] },
  { code: "GR", name: "Greece", dialCode: "+30", currency: "EUR", timezones: ["Europe/Athens"] },
  { code: "GD", name: "Grenada", dialCode: "+1", currency: "XCD", timezones: ["America/Grenada"] },
  { code: "GT", name: "Guatemala", dialCode: "+502", currency: "GTQ", timezones: ["America/Guatemala"] },
  { code: "GN", name: "Guinea", dialCode: "+224", currency: "GNF", timezones: ["Africa/Conakry"] },
  { code: "GW", name: "Guinea-Bissau", dialCode: "+245", currency: "XOF", timezones: ["Africa/Bissau"] },
  { code: "GY", name: "Guyana", dialCode: "+592", currency: "GYD", timezones: ["America/Guyana"] },
  { code: "HT", name: "Haiti", dialCode: "+509", currency: "HTG", timezones: ["America/Port-au-Prince"] },
  { code: "HN", name: "Honduras", dialCode: "+504", currency: "HNL", timezones: ["America/Tegucigalpa"] },
  { code: "HK", name: "Hong Kong SAR", dialCode: "+852", currency: "HKD", timezones: ["Asia/Hong_Kong"] },
  { code: "HU", name: "Hungary", dialCode: "+36", currency: "HUF", timezones: ["Europe/Budapest"] },
  { code: "IS", name: "Iceland", dialCode: "+354", currency: "ISK", timezones: ["Atlantic/Reykjavik"] },
  { code: "IN", name: "India", dialCode: "+91", currency: "INR", timezones: ["Asia/Kolkata"], taxRate: 0.18 },
  { code: "ID", name: "Indonesia", dialCode: "+62", currency: "IDR", timezones: ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"] },
  { code: "IR", name: "Iran", dialCode: "+98", currency: "IRR", timezones: ["Asia/Tehran"] },
  { code: "IQ", name: "Iraq", dialCode: "+964", currency: "IQD", timezones: ["Asia/Baghdad"] },
  { code: "IE", name: "Ireland", dialCode: "+353", currency: "EUR", timezones: ["Europe/Dublin"] },
  { code: "IL", name: "Israel", dialCode: "+972", currency: "ILS", timezones: ["Asia/Jerusalem"] },
  { code: "IT", name: "Italy", dialCode: "+39", currency: "EUR", timezones: ["Europe/Rome"], taxRate: 0.22 },
  { code: "JM", name: "Jamaica", dialCode: "+1", currency: "JMD", timezones: ["America/Jamaica"] },
  { code: "JP", name: "Japan", dialCode: "+81", currency: "JPY", timezones: ["Asia/Tokyo"], taxRate: 0.1 },
  { code: "JO", name: "Jordan", dialCode: "+962", currency: "JOD", timezones: ["Asia/Amman"] },
  { code: "KZ", name: "Kazakhstan", dialCode: "+7", currency: "KZT", timezones: ["Asia/Almaty", "Asia/Aqtobe"] },
  { code: "KE", name: "Kenya", dialCode: "+254", currency: "KES", timezones: ["Africa/Nairobi"] },
  { code: "KI", name: "Kiribati", dialCode: "+686", currency: "AUD", timezones: ["Pacific/Tarawa"] },
  { code: "KP", name: "North Korea", dialCode: "+850", currency: "KPW", timezones: ["Asia/Pyongyang"] },
  { code: "KR", name: "South Korea", dialCode: "+82", currency: "KRW", timezones: ["Asia/Seoul"] },
  { code: "KW", name: "Kuwait", dialCode: "+965", currency: "KWD", timezones: ["Asia/Kuwait"] },
  { code: "KG", name: "Kyrgyzstan", dialCode: "+996", currency: "KGS", timezones: ["Asia/Bishkek"] },
  { code: "LA", name: "Laos", dialCode: "+856", currency: "LAK", timezones: ["Asia/Vientiane"] },
  { code: "LV", name: "Latvia", dialCode: "+371", currency: "EUR", timezones: ["Europe/Riga"] },
  { code: "LB", name: "Lebanon", dialCode: "+961", currency: "LBP", timezones: ["Asia/Beirut"] },
  { code: "LS", name: "Lesotho", dialCode: "+266", currency: "LSL", timezones: ["Africa/Maseru"] },
  { code: "LR", name: "Liberia", dialCode: "+231", currency: "LRD", timezones: ["Africa/Monrovia"] },
  { code: "LY", name: "Libya", dialCode: "+218", currency: "LYD", timezones: ["Africa/Tripoli"] },
  { code: "LI", name: "Liechtenstein", dialCode: "+423", currency: "CHF", timezones: ["Europe/Vaduz"] },
  { code: "LT", name: "Lithuania", dialCode: "+370", currency: "EUR", timezones: ["Europe/Vilnius"] },
  { code: "LU", name: "Luxembourg", dialCode: "+352", currency: "EUR", timezones: ["Europe/Luxembourg"] },
  { code: "MO", name: "Macao SAR", dialCode: "+853", currency: "MOP", timezones: ["Asia/Macau"] },
  { code: "MG", name: "Madagascar", dialCode: "+261", currency: "MGA", timezones: ["Indian/Antananarivo"] },
  { code: "MW", name: "Malawi", dialCode: "+265", currency: "MWK", timezones: ["Africa/Blantyre"] },
  { code: "MY", name: "Malaysia", dialCode: "+60", currency: "MYR", timezones: ["Asia/Kuala_Lumpur", "Asia/Kuching"] },
  { code: "MV", name: "Maldives", dialCode: "+960", currency: "MVR", timezones: ["Indian/Maldives"] },
  { code: "ML", name: "Mali", dialCode: "+223", currency: "XOF", timezones: ["Africa/Bamako"] },
  { code: "MT", name: "Malta", dialCode: "+356", currency: "EUR", timezones: ["Europe/Malta"] },
  { code: "MH", name: "Marshall Islands", dialCode: "+692", currency: "USD", timezones: ["Pacific/Majuro"] },
  { code: "MR", name: "Mauritania", dialCode: "+222", currency: "MRU", timezones: ["Africa/Nouakchott"] },
  { code: "MU", name: "Mauritius", dialCode: "+230", currency: "MUR", timezones: ["Indian/Mauritius"] },
  { code: "MX", name: "Mexico", dialCode: "+52", currency: "MXN", timezones: ["America/Mexico_City", "America/Tijuana", "America/Monterrey"], taxRate: 0.16 },
  { code: "FM", name: "Micronesia", dialCode: "+691", currency: "USD", timezones: ["Pacific/Pohnpei"] },
  { code: "MD", name: "Moldova", dialCode: "+373", currency: "MDL", timezones: ["Europe/Chisinau"] },
  { code: "MC", name: "Monaco", dialCode: "+377", currency: "EUR", timezones: ["Europe/Monaco"] },
  { code: "MN", name: "Mongolia", dialCode: "+976", currency: "MNT", timezones: ["Asia/Ulaanbaatar", "Asia/Hovd"] },
  { code: "ME", name: "Montenegro", dialCode: "+382", currency: "EUR", timezones: ["Europe/Podgorica"] },
  { code: "MA", name: "Morocco", dialCode: "+212", currency: "MAD", timezones: ["Africa/Casablanca"] },
  { code: "MZ", name: "Mozambique", dialCode: "+258", currency: "MZN", timezones: ["Africa/Maputo"] },
  { code: "MM", name: "Myanmar", dialCode: "+95", currency: "MMK", timezones: ["Asia/Yangon"] },
  { code: "NA", name: "Namibia", dialCode: "+264", currency: "NAD", timezones: ["Africa/Windhoek"] },
  { code: "NR", name: "Nauru", dialCode: "+674", currency: "AUD", timezones: ["Pacific/Nauru"] },
  { code: "NP", name: "Nepal", dialCode: "+977", currency: "NPR", timezones: ["Asia/Kathmandu"] },
  { code: "NL", name: "Netherlands", dialCode: "+31", currency: "EUR", timezones: ["Europe/Amsterdam"], taxRate: 0.21 },
  { code: "NZ", name: "New Zealand", dialCode: "+64", currency: "NZD", timezones: ["Pacific/Auckland", "Pacific/Chatham"] },
  { code: "NI", name: "Nicaragua", dialCode: "+505", currency: "NIO", timezones: ["America/Managua"] },
  { code: "NE", name: "Niger", dialCode: "+227", currency: "XOF", timezones: ["Africa/Niamey"] },
  { code: "NG", name: "Nigeria", dialCode: "+234", currency: "NGN", timezones: ["Africa/Lagos"] },
  { code: "MK", name: "North Macedonia", dialCode: "+389", currency: "MKD", timezones: ["Europe/Skopje"] },
  { code: "NO", name: "Norway", dialCode: "+47", currency: "NOK", timezones: ["Europe/Oslo"] },
  { code: "OM", name: "Oman", dialCode: "+968", currency: "OMR", timezones: ["Asia/Muscat"] },
  { code: "PK", name: "Pakistan", dialCode: "+92", currency: "PKR", timezones: ["Asia/Karachi"] },
  { code: "PW", name: "Palau", dialCode: "+680", currency: "USD", timezones: ["Pacific/Palau"] },
  { code: "PS", name: "Palestine", dialCode: "+970", currency: "ILS", timezones: ["Asia/Gaza", "Asia/Hebron"] },
  { code: "PA", name: "Panama", dialCode: "+507", currency: "USD", timezones: ["America/Panama"] },
  { code: "PG", name: "Papua New Guinea", dialCode: "+675", currency: "PGK", timezones: ["Pacific/Port_Moresby"] },
  { code: "PY", name: "Paraguay", dialCode: "+595", currency: "PYG", timezones: ["America/Asuncion"] },
  { code: "PE", name: "Peru", dialCode: "+51", currency: "PEN", timezones: ["America/Lima"] },
  { code: "PH", name: "Philippines", dialCode: "+63", currency: "PHP", timezones: ["Asia/Manila"] },
  { code: "PL", name: "Poland", dialCode: "+48", currency: "PLN", timezones: ["Europe/Warsaw"] },
  { code: "PT", name: "Portugal", dialCode: "+351", currency: "EUR", timezones: ["Europe/Lisbon", "Atlantic/Madeira", "Atlantic/Azores"] },
  { code: "QA", name: "Qatar", dialCode: "+974", currency: "QAR", timezones: ["Asia/Qatar"] },
  { code: "RO", name: "Romania", dialCode: "+40", currency: "RON", timezones: ["Europe/Bucharest"] },
  { code: "RU", name: "Russia", dialCode: "+7", currency: "RUB", timezones: ["Europe/Moscow", "Asia/Vladivostok", "Asia/Yekaterinburg", "Asia/Novosibirsk", "Europe/Kaliningrad"] },
  { code: "RW", name: "Rwanda", dialCode: "+250", currency: "RWF", timezones: ["Africa/Kigali"] },
  { code: "KN", name: "Saint Kitts and Nevis", dialCode: "+1", currency: "XCD", timezones: ["America/St_Kitts"] },
  { code: "LC", name: "Saint Lucia", dialCode: "+1", currency: "XCD", timezones: ["America/St_Lucia"] },
  { code: "VC", name: "Saint Vincent and the Grenadines", dialCode: "+1", currency: "XCD", timezones: ["America/St_Vincent"] },
  { code: "WS", name: "Samoa", dialCode: "+685", currency: "WST", timezones: ["Pacific/Apia"] },
  { code: "SM", name: "San Marino", dialCode: "+378", currency: "EUR", timezones: ["Europe/San_Marino"] },
  { code: "ST", name: "São Tomé and Príncipe", dialCode: "+239", currency: "STP", timezones: ["Africa/Sao_Tome"] },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", currency: "SAR", timezones: ["Asia/Riyadh"] },
  { code: "SN", name: "Senegal", dialCode: "+221", currency: "XOF", timezones: ["Africa/Dakar"] },
  { code: "RS", name: "Serbia", dialCode: "+381", currency: "RSD", timezones: ["Europe/Belgrade"] },
  { code: "SC", name: "Seychelles", dialCode: "+248", currency: "SCR", timezones: ["Indian/Mahe"] },
  { code: "SL", name: "Sierra Leone", dialCode: "+232", currency: "SLL", timezones: ["Africa/Freetown"] },
  { code: "SG", name: "Singapore", dialCode: "+65", currency: "SGD", timezones: ["Asia/Singapore"], taxRate: 0.08 },
  { code: "SK", name: "Slovakia", dialCode: "+421", currency: "EUR", timezones: ["Europe/Bratislava"] },
  { code: "SI", name: "Slovenia", dialCode: "+386", currency: "EUR", timezones: ["Europe/Ljubljana"] },
  { code: "SB", name: "Solomon Islands", dialCode: "+677", currency: "SBD", timezones: ["Pacific/Guadalcanal"] },
  { code: "SO", name: "Somalia", dialCode: "+252", currency: "SOS", timezones: ["Africa/Mogadishu"] },
  { code: "ZA", name: "South Africa", dialCode: "+27", currency: "ZAR", timezones: ["Africa/Johannesburg"] },
  { code: "SS", name: "South Sudan", dialCode: "+211", currency: "SSP", timezones: ["Africa/Juba"] },
  { code: "ES", name: "Spain", dialCode: "+34", currency: "EUR", timezones: ["Europe/Madrid", "Atlantic/Canary"], taxRate: 0.21 },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", currency: "LKR", timezones: ["Asia/Colombo"] },
  { code: "SD", name: "Sudan", dialCode: "+249", currency: "SDG", timezones: ["Africa/Khartoum"] },
  { code: "SR", name: "Suriname", dialCode: "+597", currency: "SRD", timezones: ["America/Paramaribo"] },
  { code: "SE", name: "Sweden", dialCode: "+46", currency: "SEK", timezones: ["Europe/Stockholm"] },
  { code: "CH", name: "Switzerland", dialCode: "+41", currency: "CHF", timezones: ["Europe/Zurich"] },
  { code: "SY", name: "Syria", dialCode: "+963", currency: "SYP", timezones: ["Asia/Damascus"] },
  { code: "TW", name: "Taiwan", dialCode: "+886", currency: "TWD", timezones: ["Asia/Taipei"] },
  { code: "TJ", name: "Tajikistan", dialCode: "+992", currency: "TJS", timezones: ["Asia/Dushanbe"] },
  { code: "TZ", name: "Tanzania", dialCode: "+255", currency: "TZS", timezones: ["Africa/Dar_es_Salaam"] },
  { code: "TH", name: "Thailand", dialCode: "+66", currency: "THB", timezones: ["Asia/Bangkok"] },
  { code: "TL", name: "Timor-Leste", dialCode: "+670", currency: "USD", timezones: ["Asia/Dili"] },
  { code: "TG", name: "Togo", dialCode: "+228", currency: "XOF", timezones: ["Africa/Lome"] },
  { code: "TO", name: "Tonga", dialCode: "+676", currency: "TOP", timezones: ["Pacific/Tongatapu"] },
  { code: "TT", name: "Trinidad and Tobago", dialCode: "+1", currency: "TTD", timezones: ["America/Port_of_Spain"] },
  { code: "TN", name: "Tunisia", dialCode: "+216", currency: "TND", timezones: ["Africa/Tunis"] },
  { code: "TR", name: "Türkiye", dialCode: "+90", currency: "TRY", timezones: ["Europe/Istanbul"] },
  { code: "TM", name: "Turkmenistan", dialCode: "+993", currency: "TMT", timezones: ["Asia/Ashgabat"] },
  { code: "TV", name: "Tuvalu", dialCode: "+688", currency: "AUD", timezones: ["Pacific/Funafuti"] },
  { code: "UG", name: "Uganda", dialCode: "+256", currency: "UGX", timezones: ["Africa/Kampala"] },
  { code: "UA", name: "Ukraine", dialCode: "+380", currency: "UAH", timezones: ["Europe/Kyiv"] },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", currency: "AED", timezones: ["Asia/Dubai"], taxRate: 0.05 },
  { code: "GB", name: "United Kingdom", dialCode: "+44", currency: "GBP", timezones: ["Europe/London"], taxRate: 0.2 },
  { code: "US", name: "United States", dialCode: "+1", currency: "USD", timezones: ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu"] },
  { code: "UY", name: "Uruguay", dialCode: "+598", currency: "UYU", timezones: ["America/Montevideo"] },
  { code: "UZ", name: "Uzbekistan", dialCode: "+998", currency: "UZS", timezones: ["Asia/Tashkent"] },
  { code: "VU", name: "Vanuatu", dialCode: "+678", currency: "VUV", timezones: ["Pacific/Efate"] },
  { code: "VA", name: "Vatican City", dialCode: "+379", currency: "EUR", timezones: ["Europe/Vatican"] },
  { code: "VE", name: "Venezuela", dialCode: "+58", currency: "VES", timezones: ["America/Caracas"] },
  { code: "VN", name: "Vietnam", dialCode: "+84", currency: "VND", timezones: ["Asia/Ho_Chi_Minh"] },
  { code: "YE", name: "Yemen", dialCode: "+967", currency: "YER", timezones: ["Asia/Aden"] },
  { code: "ZM", name: "Zambia", dialCode: "+260", currency: "ZMW", timezones: ["Africa/Lusaka"] },
  { code: "ZW", name: "Zimbabwe", dialCode: "+263", currency: "ZWL", timezones: ["Africa/Harare"] },
].map((c) => ({ ...c, taxRate: c.taxRate ?? 0, flag: flag(c.code) }));

// Commonly used countries pinned to the top of the dropdown.
export const PINNED_COUNTRIES = ["PH", "SG", "US", "GB"];

const byName = new Map(COUNTRIES.map((c) => [c.name.toLowerCase(), c]));
const byCode = new Map(COUNTRIES.map((c) => [c.code, c]));

export function getCountryByName(name) {
  if (!name) return null;
  return byName.get(name.toLowerCase()) || null;
}

export function getCountryByCode(code) {
  if (!code) return null;
  return byCode.get(code.toUpperCase()) || null;
}

export function getDialCode(name) {
  return getCountryByName(name)?.dialCode || "";
}

export function getTimezones(name) {
  return getCountryByName(name)?.timezones || [];
}

export function getSortedCountries() {
  const pinned = PINNED_COUNTRIES.map((code) => getCountryByCode(code)).filter(Boolean);
  const rest = COUNTRIES.filter((c) => !PINNED_COUNTRIES.includes(c.code)).sort((a, b) => a.name.localeCompare(b.name));
  return { pinned, rest, all: [...pinned, ...rest] };
}

export function timezoneLabel(tz) {
  const parts = tz.split("/");
  const city = parts[parts.length - 1].replace(/_/g, " ");
  return `${city} (${tz})`;
}
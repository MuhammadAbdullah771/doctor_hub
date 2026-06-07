/** Valid Pakistan cities for filters and normalization */
export const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Hyderabad',
  'Sialkot',
  'Gujranwala',
] as const

/** Maps legacy Indian city names to Pakistan equivalents */
export const INDIAN_TO_PAKISTAN_CITY: Record<string, string> = {
  mumbai: 'Karachi',
  chennai: 'Karachi',
  hyderabad: 'Karachi',
  kolkata: 'Karachi',
  calcutta: 'Karachi',
  ahmedabad: 'Karachi',
  surat: 'Karachi',
  pune: 'Lahore',
  kochi: 'Karachi',
  nagpur: 'Karachi',
  indore: 'Karachi',
  bhopal: 'Karachi',
  jaipur: 'Karachi',
  lucknow: 'Karachi',
  kanpur: 'Karachi',
  patna: 'Karachi',
  delhi: 'Lahore',
  'new delhi': 'Lahore',
  gurgaon: 'Lahore',
  gurugram: 'Lahore',
  noida: 'Lahore',
  faridabad: 'Lahore',
  chandigarh: 'Lahore',
  amritsar: 'Lahore',
  bangalore: 'Islamabad',
  bengaluru: 'Islamabad',
  mysore: 'Islamabad',
  mysuru: 'Islamabad',
  coimbatore: 'Islamabad',
  mangalore: 'Islamabad',
}

export function normalizePakistanCity(city: string | null | undefined): string {
  if (!city?.trim()) return ''
  const key = city.trim().toLowerCase()
  return INDIAN_TO_PAKISTAN_CITY[key] ?? city.trim()
}

export function isPakistanCity(city: string): boolean {
  const normalized = normalizePakistanCity(city)
  return PAKISTAN_CITIES.some((c) => c.toLowerCase() === normalized.toLowerCase())
}

export function mergePakistanCityOptions(dbCities: string[]): string[] {
  const normalized = dbCities.map(normalizePakistanCity).filter(Boolean)
  const merged = new Set<string>([...PAKISTAN_CITIES, ...normalized])
  return [...merged].sort((a, b) => a.localeCompare(b))
}

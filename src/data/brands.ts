export interface Brand {
  id: string;
  name: string;
  count: number;
}

export const CATEGORY_BRANDS_MAP: Record<string, { name: string; baseCount: number }[]> = {
  // Electronic Components
  "electronic-components": [
    { name: "Prayog India", baseCount: 15 },
    { name: "Texas Instruments", baseCount: 12 },
    { name: "STMicroelectronics", baseCount: 12 },
    { name: "Microchip", baseCount: 9 },
    { name: "Vishay", baseCount: 8 },
    { name: "Panasonic", baseCount: 7 },
    { name: "Murata", baseCount: 6 },
    { name: "DFRobot", baseCount: 8 },
  ],
  // Robotics & DIY Kits
  robotics: [
    { name: "Prayog India", baseCount: 16 },
    { name: "Dilay-Bot", baseCount: 6 },
    { name: "Pololu", baseCount: 8 },
    { name: "RoboRacer", baseCount: 4 },
    { name: "Waveshare", baseCount: 9 },
    { name: "Arduino", baseCount: 6 },
    { name: "Makeblock", baseCount: 5 },
  ],
  // Development Boards / Microcontrollers
  "development-boards": [
    { name: "Arduino", baseCount: 18 },
    { name: "Raspberry Pi", baseCount: 14 },
    { name: "Espressif", baseCount: 22 },
    { name: "NVIDIA", baseCount: 6 },
    { name: "STMicroelectronics", baseCount: 10 },
    { name: "Seeed Studio", baseCount: 8 },
    { name: "BeagleBoard", baseCount: 4 },
    { name: "Prayog India", baseCount: 12 },
  ],
  // Drones & UAV Parts
  "drone-technology": [
    { name: "Pixhawk", baseCount: 10 },
    { name: "Holybro", baseCount: 8 },
    { name: "FlySky", baseCount: 8 },
    { name: "BetaFPV", baseCount: 6 },
    { name: "T-Motor", baseCount: 9 },
    { name: "EMAX", baseCount: 7 },
    { name: "DJI", baseCount: 5 },
    { name: "Prayog India", baseCount: 11 },
  ],
  // Sensors & IoT
  "sensors-iot": [
    { name: "Bosch", baseCount: 12 },
    { name: "InvenSense", baseCount: 6 },
    { name: "Benewake", baseCount: 5 },
    { name: "Espressif", baseCount: 14 },
    { name: "Omron", baseCount: 7 },
    { name: "Honeywell", baseCount: 5 },
    { name: "Seeed Studio", baseCount: 8 },
    { name: "Prayog India", baseCount: 15 },
  ],
  // Batteries & Power Supplies
  "batteries-power": [
    { name: "Orange", baseCount: 12 },
    { name: "Samsung", baseCount: 8 },
    { name: "Panasonic", baseCount: 9 },
    { name: "LiitoKala", baseCount: 7 },
    { name: "Mean Well", baseCount: 6 },
    { name: "Prayog India", baseCount: 10 },
  ],
  // Mechanical & Hardware / Steppers
  "mechanical-hardware": [
    { name: "NEMA", baseCount: 10 },
    { name: "StepperOnline", baseCount: 8 },
    { name: "Misumi", baseCount: 5 },
    { name: "Prayog India", baseCount: 14 },
  ],
  // Educational & STEM Kits
  "educational-stem-kits": [
    { name: "Prayog India", baseCount: 18 },
    { name: "LEGO Education", baseCount: 6 },
    { name: "Makeblock", baseCount: 8 },
    { name: "Atal Tinkering Lab (ATL)", baseCount: 5 },
    { name: "STEM Lab", baseCount: 7 },
  ],
  // Industrial Automation
  "industrial-automation": [
    { name: "Siemens", baseCount: 9 },
    { name: "Schneider Electric", baseCount: 7 },
    { name: "Omron", baseCount: 11 },
    { name: "Delta", baseCount: 6 },
    { name: "Prayog India", baseCount: 8 },
  ],
};

export const BRANDS_DATA: Brand[] = [
  { id: "b-arduino", name: "Arduino", count: 18 },
  { id: "b-raspberry", name: "Raspberry Pi", count: 14 },
  { id: "b-nvidia", name: "NVIDIA", count: 6 },
  { id: "b-espressif", name: "Espressif", count: 22 },
  { id: "b-pixhawk", name: "Pixhawk", count: 10 },
  { id: "b-prayog", name: "Prayog India", count: 15 },
  { id: "b-stm", name: "STMicroelectronics", count: 12 },
  { id: "b-flysky", name: "FlySky", count: 8 },
];

export function normalizeCategoryKey(cat?: string | null): string | null {
  if (!cat) return null;
  const c = cat.toLowerCase().trim();
  if (c.includes("electronic") || c.includes("component")) return "electronic-components";
  if (c.includes("robot")) return "robotics";
  if (c.includes("dev") || c.includes("arduino") || c.includes("microcontroller") || c.includes("single board"))
    return "development-boards";
  if (c.includes("drone") || c.includes("uav")) return "drone-technology";
  if (c.includes("sensor") || c.includes("iot") || c.includes("wireless")) return "sensors-iot";
  if (c.includes("batter") || c.includes("power")) return "batteries-power";
  if (c.includes("mechanic") || c.includes("hardware") || c.includes("motor") || c.includes("stepper"))
    return "mechanical-hardware";
  if (c.includes("stem") || c.includes("edu")) return "educational-stem-kits";
  if (c.includes("industrial") || c.includes("automation")) return "industrial-automation";
  return "electronic-components";
}

export function getBrandsForCategory(
  selectedCategory?: string | null,
  rawProducts?: Array<{ name: string; brand?: string; category?: string }>,
): Brand[] {
  const normKey = normalizeCategoryKey(selectedCategory);

  if (!normKey) {
    // Return all unique brands aggregated
    const brandMap = new Map<string, number>();
    Object.values(CATEGORY_BRANDS_MAP).forEach((list) => {
      list.forEach((b) => {
        brandMap.set(b.name, Math.max(brandMap.get(b.name) || 0, b.baseCount));
      });
    });

    return Array.from(brandMap.entries())
      .map(([name, count]) => ({
        id: `b-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  const categoryBrands = CATEGORY_BRANDS_MAP[normKey] || [];

  return categoryBrands
    .map((b) => {
      let count = b.baseCount;
      if (rawProducts && rawProducts.length > 0) {
        const dynamicCount = rawProducts.filter((p) => {
          const pName = (p.name || "").toLowerCase();
          const pBrand = (p.brand || "").toLowerCase();
          const bLower = b.name.toLowerCase();
          return pBrand === bLower || pBrand.includes(bLower) || pName.includes(bLower);
        }).length;
        if (dynamicCount > 0) {
          count = dynamicCount;
        }
      }

      return {
        id: `b-${b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: b.name,
        count,
      };
    })
    .sort((a, b) => b.count - a.count);
}

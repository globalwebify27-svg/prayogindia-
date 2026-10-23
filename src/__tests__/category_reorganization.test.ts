import { describe, it, expect } from "vitest";
import { CATEGORIES_DATA, matchCategory, matchSubcategory, getCategoryBySlug } from "../data/categories";
import { CATEGORIES_HIERARCHY, PARENT_CATEGORIES } from "../data/categoriesHierarchy";
import { CATEGORIES } from "../data/mockData";

describe("Prayog India 9-Domain Target Category Structure Verification", () => {
  const EXPECTED_PARENTS = [
    "Electronic Components",
    "Robotics",
    "Development Boards",
    "Drone Technology",
    "Sensors & IoT",
    "Batteries & Power",
    "Mechanical & Hardware",
    "Educational & STEM Kits",
    "Industrial Automation",
  ];

  const EXPECTED_TAXONOMY: Record<string, string[]> = {
    "Electronic Components": [
      "Resistors",
      "Capacitors",
      "ICs",
      "LEDs",
      "Relays",
      "Connectors",
    ],
    "Robotics": [
      "Robot Kits",
      "Robotics Accessories",
      "Motors & Drivers",
      "Wheels",
      "Controllers",
    ],
    "Development Boards": [
      "Arduino",
      "Raspberry Pi",
      "Other Development Boards",
    ],
    "Drone Technology": [
      "Flight Controllers",
      "Motors",
      "ESC",
      "GPS Modules",
      "Propellers",
      "Batteries",
      "Cameras",
    ],
    "Sensors & IoT": [
      "Sensors & Modules",
      "IoT Products",
    ],
    "Batteries & Power": [
      "Batteries",
    ],
    "Mechanical & Hardware": [
      "Mechanical Products",
      "Hardware",
      "3D Accessories",
    ],
    "Educational & STEM Kits": [
      "STEM Kits",
      "Educational Kits",
      "Educational Toys",
      "Project Kits",
    ],
    "Industrial Automation": [
      "Industrial Automation Products",
    ],
  };

  it("should have exactly 9 canonical parent categories in CATEGORIES_DATA", () => {
    expect(CATEGORIES_DATA.length).toBe(9);
    const names = CATEGORIES_DATA.map((c) => c.name);
    expect(names).toEqual(EXPECTED_PARENTS);
  });

  it("should have exactly 9 canonical parent categories in CATEGORIES_HIERARCHY", () => {
    expect(CATEGORIES_HIERARCHY.length).toBe(9);
    expect(PARENT_CATEGORIES.length).toBe(9);
    const names = CATEGORIES_HIERARCHY.map((c) => c.name);
    expect(names).toEqual(EXPECTED_PARENTS);
  });

  it("should have exactly 9 categories in mockData CATEGORIES array", () => {
    expect(CATEGORIES.length).toBe(9);
    const names = CATEGORIES.map((c) => c.name);
    expect(names).toEqual(EXPECTED_PARENTS);
  });

  it("should have exactly 32 subcategories matching target taxonomy in CATEGORIES_DATA", () => {
    let totalSubcategories = 0;

    for (const parent of CATEGORIES_DATA) {
      const expectedSubs = EXPECTED_TAXONOMY[parent.name];
      expect(expectedSubs).toBeDefined();

      const actualSubs = parent.subcategories.map((s) => s.name);
      expect(actualSubs).toEqual(expectedSubs);
      totalSubcategories += parent.subcategories.length;
    }

    expect(totalSubcategories).toBe(32);
  });

  it("should have exactly 32 subcategories matching target taxonomy in CATEGORIES_HIERARCHY", () => {
    let totalSubcategories = 0;

    for (const parent of CATEGORIES_HIERARCHY) {
      const expectedSubs = EXPECTED_TAXONOMY[parent.name];
      expect(expectedSubs).toBeDefined();

      const actualSubs = (parent.children || []).map((s) => s.name);
      expect(actualSubs).toEqual(expectedSubs);
      totalSubcategories += (parent.children || []).length;
    }

    expect(totalSubcategories).toBe(32);
  });

  it("should support slugAlias and legacy URL routes seamlessly", () => {
    // Development boards legacy paths
    const arduino = getCategoryBySlug("arduino");
    expect(arduino).toBeDefined();
    expect(arduino?.name).toBe("Development Boards");

    const raspberryPi = getCategoryBySlug("raspberry-pi");
    expect(raspberryPi).toBeDefined();
    expect(raspberryPi?.name).toBe("Development Boards");

    // Sensors legacy paths
    const sensors = getCategoryBySlug("sensors-modules");
    expect(sensors).toBeDefined();
    expect(sensors?.name).toBe("Sensors & IoT");

    // STEM legacy paths
    const stem = getCategoryBySlug("stem-kits");
    expect(stem).toBeDefined();
    expect(stem?.name).toBe("Educational & STEM Kits");
  });

  it("should correctly handle dual Batteries subcategories", () => {
    const droneCat = getCategoryBySlug("drone-technology");
    expect(droneCat).toBeDefined();
    const droneBatterySub = droneCat?.subcategories.find((s) => matchSubcategory(s, "batteries"));
    expect(droneBatterySub).toBeDefined();
    expect(droneBatterySub?.name).toBe("Batteries");

    const powerCat = getCategoryBySlug("batteries-power");
    expect(powerCat).toBeDefined();
    const powerBatterySub = powerCat?.subcategories.find((s) => matchSubcategory(s, "batteries"));
    expect(powerBatterySub).toBeDefined();
    expect(powerBatterySub?.name).toBe("Batteries");
  });
});

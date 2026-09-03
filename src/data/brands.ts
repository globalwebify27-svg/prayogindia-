export interface Brand {
  id: string;
  name: string;
  count: number;
}

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

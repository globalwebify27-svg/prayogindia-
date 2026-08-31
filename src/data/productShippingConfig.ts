export type ShippingTagType = 
  | 'Standard Product' 
  | 'Battery Product' 
  | 'Fragile Product' 
  | 'Heavy Product' 
  | 'Oversized Product';

export interface ProductShippingConfig {
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  gstPercent: 18 | 12 | 5 | 28 | 0;
  
  // Allowed Freight Modes
  allowedFreightModes: {
    airFreight: boolean;
    surfaceFreight: boolean;
    localPickup: boolean;
  };
  
  // Shipping Classification Tags
  shippingTag: ShippingTagType;
  
  // Dangerous Goods & Handling Attributes
  isHazardousItem: boolean;
  isBatteryProduct: boolean;
  isFragileItem: boolean;
  isDangerousGoods: boolean;
}

export const DEFAULT_PRODUCT_SHIPPING_CONFIG: ProductShippingConfig = {
  weightGrams: 250,
  lengthCm: 15,
  widthCm: 10,
  heightCm: 5,
  gstPercent: 18,
  allowedFreightModes: {
    airFreight: true,
    surfaceFreight: true,
    localPickup: true,
  },
  shippingTag: 'Standard Product',
  isHazardousItem: false,
  isBatteryProduct: false,
  isFragileItem: false,
  isDangerousGoods: false,
};

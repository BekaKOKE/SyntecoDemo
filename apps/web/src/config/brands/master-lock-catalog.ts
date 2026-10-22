import type { BrandCatalogCategory } from './types';

/**
 * Master Lock product grouping.
 *
 * Source: official Master Lock all-products listing at
 * https://www.masterlock.com/search/all-products?term=&page=1&ajax=1&sortBy=price&sortByOrder=DESC&pageSize=2447.
 * The site does not expose a separate taxonomy page; these groups come from
 * data-product-primary-category and data-product-secondary-category attributes
 * on the 2,447 official product cards.
 */

function sub(name: string, url: string, thumbnailUrl: string, productCount: number) {
  return { name, url, thumbnailUrl, productCount };
}

export const masterLockCatalog: BrandCatalogCategory[] = [
  {
    name: "Padlocks",
    slug: "padlocks",
    iconName: "lock",
    subcategories: [
      sub("Solid Body Padlocks", "https://www.masterlock.com/products/product/A802LHCNKA", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_A802LHC.jpg", 819),
      sub("Laminated Padlocks", "https://www.masterlock.com/products/product/5SSQLJ", "https://cdn.masterlock.com/product/285/5SSQLJ.jpg", 253),
      sub("Padlocks", "https://www.masterlock.com/products/product/6727", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_38919_6727.jpg", 13),
    ],
  },
  {
    name: "Lockout Tagout",
    slug: "lockout-tagout",
    iconName: "lock",
    subcategories: [
      sub("Lockout Padlocks & Accessories", "https://www.masterlock.com/products/product/S30COVERS", "https://cdn.masterlock.com/product/285/4314882_S30COVERS_lg_FR.jpg", 534),
      sub("Lockout Kits & Stations", "https://www.masterlock.com/products/product/1484BP410ES", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_1484BP410ES_w_labels.jpg", 57),
      sub("Electrical Lockout", "https://www.masterlock.com/products/product/453XL", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_453XL.jpg", 22),
      sub("Valve Lockouts", "https://www.masterlock.com/products/product/485", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_485.jpg", 16),
      sub("Lockout Hasps", "https://www.masterlock.com/products/product/427", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_427.jpg", 14),
      sub("Group Lock Boxes & Permit Stations", "https://www.masterlock.com/products/product/S3500", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_S3500.jpg", 12),
      sub("Cable Lockout", "https://www.masterlock.com/products/product/S856", "https://cdn.masterlock.com/masterlock/static/img/icon-baby-lock.svg", 6),
      sub("Blind Flange Lockout", "https://www.masterlock.com/products/product/S3924", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_S3924.jpg", 3),
      sub("Pneumatic Lockout", "https://www.masterlock.com/products/product/S3900", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_S3900.jpg", 1),
    ],
  },
  {
    name: "Door Hardware",
    slug: "door-hardware",
    iconName: "wrench",
    subcategories: [
      sub("Residential Door Hardware", "https://www.masterlock.com/products/product/HDLWLLH0612PKA4W", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_HDLWLLH0612PKA4W.jpg", 152),
      sub("Exterior Doors", "https://www.masterlock.com/products/product/BAO0115T", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_BAO0115T.jpg", 28),
      sub("Entry Door", "https://www.masterlock.com/products/product/DSO0712P", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_DSO0712P.jpg", 10),
      sub("Interior Doors", "https://www.masterlock.com/products/product/BCCO0615", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_BCCO0615.jpg", 9),
      sub("Commercial Door Hardware", "https://www.masterlock.com/products/product/DSCHDD10B", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_DSCHDD10B.jpg", 5),
      sub("Door Hardware", "https://www.masterlock.com/products/product/TUCO0603T", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_TUCO0603T.jpg", 5),
    ],
  },
  {
    name: "Combination Locks",
    slug: "combination-locks",
    iconName: "lock",
    subcategories: [
      sub("Set Your Own Combination", "https://www.masterlock.com/products/product/174SSD", "https://cdn.masterlock.com/product/285/MLCOM_PROD_174SSD_01_Hero.jpg", 57),
      sub("Preset Combination", "https://www.masterlock.com/products/product/2010", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_2010.jpg", 42),
      sub("Built-In", "https://www.masterlock.com/products/product/1630", "https://cdn.masterlock.com/masterlock/static/img/icon-baby-lock.svg", 1),
      sub("Combination Locks", "https://www.masterlock.com/products/product/620DAST", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_38235_620DAST.jpg", 1),
    ],
  },
  {
    name: "Residential Door Hardware",
    slug: "residential-door-hardware",
    iconName: "wrench",
    subcategories: [
      sub("Exterior Doors", "https://www.masterlock.com/products/product/HDLWLRH0612PKA4WK", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_HDLWLRH0612PKA4WK.jpg", 47),
      sub("Interior Doors", "https://www.masterlock.com/products/product/RL0212PKA4", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_RL0212PKA4.jpg", 39),
      sub("Residential Door Hardware", "https://www.masterlock.com/products/product/RL0112PKA4S", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_RL0112PKA4S.jpg", 9),
    ],
  },
  {
    name: "Built-In Locker Locks, Combination Locks",
    slug: "built-in-locker-locks-combination-locks",
    iconName: "lock",
    subcategories: [
      sub("Built-In, Combination Locks", "https://www.masterlock.com/products/product/3670", "https://cdn.masterlock.com/masterlock/static/img/icon-baby-lock.svg", 62),
    ],
  },
  {
    name: "Commercial Door Hardware",
    slug: "commercial-door-hardware",
    iconName: "wrench",
    subcategories: [
      sub("Interior Doors", "https://www.masterlock.com/products/product/SLCHSR10B", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_SLCHSR10B.jpg", 37),
      sub("Commercial Door Hardware", "https://www.masterlock.com/products/product/SLCHKE10B", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_SLCHKE10B.jpg", 3),
    ],
  },
  {
    name: "Chain & Cable Locks",
    slug: "chain-and-cable-locks",
    iconName: "lock",
    subcategories: [
      sub("Keyed Locks", "https://www.masterlock.com/products/product/8418TCAMODNA", "https://cdn.masterlock.com/product/285/8418TCAMODNA_1_hero.jpg", 17),
      sub("Combination Locks", "https://www.masterlock.com/products/product/M175XDLF", "https://cdn.masterlock.com/product/285/MLCOM_PROD_M175XDLF_01_Hero.jpg", 7),
      sub("Looped-end Cables", "https://www.masterlock.com/products/product/72DPF", "https://cdn.masterlock.com/product/285/MLCOM_PROD_72DPF_01_Hero.jpg", 4),
    ],
  },
  {
    name: "Government",
    slug: "government",
    iconName: "package",
    subcategories: [
      sub("Padlocks", "https://www.masterlock.com/products/product/A5200GLSHNKA", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_A5200GLSHN.jpg", 28),
    ],
  },
  {
    name: "Trailers & Towing",
    slug: "trailers-and-towing",
    iconName: "lock",
    subcategories: [
      sub("Trailer Coupler Locks", "https://www.masterlock.com/products/product/387KA", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_387.jpg", 11),
      sub("Coupler Latch & Receiver Locks", "https://www.masterlock.com/products/product/1479TAT", "https://cdn.masterlock.com/product/285/1479TAT.jpg", 6),
      sub("Coupler Latch & Receiver Locks, Receiver & Trailer Coupler Latch Lock Sets", "https://www.masterlock.com/products/product/3794DAT", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_3794DAT.jpg", 3),
      sub("Receiver Pins & Clips", "https://www.masterlock.com/products/product/1465DAT", "https://cdn.masterlock.com/masterlock/static/img/icon-baby-lock.svg", 2),
      sub("Receiver & Trailer Coupler Latch Lock Sets", "https://www.masterlock.com/products/product/1481DAT", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_1481DAT.jpg", 1),
    ],
  },
  {
    name: "Accessories for Locks & Keys",
    slug: "accessories-for-locks-and-keys",
    iconName: "lock",
    subcategories: [
      sub("Hasps & Hasp Locks", "https://www.masterlock.com/products/product/770LHC", "https://cdn.masterlock.com/product/285/770LHC.jpg", 14),
      sub("Rekeying Kits", "https://www.masterlock.com/products/product/291", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_291.jpg", 3),
      sub("Accessories for Locks & Keys", "https://www.masterlock.com/products/product/7117D", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_38078_7117D.jpg", 2),
      sub("Key Cabinets", "https://www.masterlock.com/products/product/7130", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_7130.jpg", 1),
      sub("Planograms & Wall Displays", "https://www.masterlock.com/products/product/1315", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_1315.jpg", 1),
    ],
  },
  {
    name: "Lock Boxes & Safes, Lock Boxes",
    slug: "lock-boxes-and-safes-lock-boxes",
    iconName: "lock",
    subcategories: [
      sub("Portable Lock Boxes", "https://www.masterlock.com/products/product/5482D", "https://cdn.masterlock.com/masterlock/static/img/icon-baby-lock.svg", 9),
      sub("Wall Mount Lock Boxes", "https://www.masterlock.com/products/product/5425D", "https://cdn.masterlock.com/product/285/MLCOM_PROD_5425D_01_Hero.jpg", 5),
    ],
  },
  {
    name: "Entry Door",
    slug: "entry-door",
    iconName: "wrench",
    subcategories: [
      sub("Entry Door", "https://www.masterlock.com/products/product/WL0115", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_WL0115.jpg", 10),
    ],
  },
  {
    name: "Built-In Locker Locks",
    slug: "built-in-locker-locks",
    iconName: "lock",
    subcategories: [
      sub("Keyed Locks", "https://www.masterlock.com/products/product/1790MKADA", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_37355_1790MKADA.jpg", 9),
    ],
  },
  {
    name: "Gun Locks",
    slug: "gun-locks",
    iconName: "lock",
    subcategories: [
      sub("Cable Locks", "https://www.masterlock.com/products/product/107KADSPT", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_107DSPT.jpg", 4),
      sub("Trigger Locks", "https://www.masterlock.com/products/product/90TRISPT", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_90TRISPT.jpg", 4),
    ],
  },
  {
    name: "Bed and Bathroom Door",
    slug: "bed-and-bathroom-door",
    iconName: "wrench",
    subcategories: [
      sub("Bed and Bathroom Door", "https://www.masterlock.com/products/product/WL0312P", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_WL0312P.jpg", 7),
    ],
  },
  {
    name: "Hall and Closet Door",
    slug: "hall-and-closet-door",
    iconName: "wrench",
    subcategories: [
      sub("Hall and Closet Door", "https://www.masterlock.com/products/product/WL0412P", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_WL0412P.jpg", 7),
    ],
  },
  {
    name: "Safes",
    slug: "safes",
    iconName: "lock",
    subcategories: [
      sub("Safes", "https://www.masterlock.com/products/product/STW205GYCML", "https://cdn.masterlock.com/masterlock/static/img/icon-baby-lock.svg", 7),
    ],
  },
  {
    name: "Other Products",
    slug: "other-products",
    iconName: "package",
    subcategories: [
      sub("Other Products", "https://www.masterlock.com/products/product/DCB-12ML", "https://cdn.masterlock.com/product/285/DCB-12_SS-ML_knockout.png", 6),
    ],
  },
  {
    name: "U-Locks",
    slug: "u-locks",
    iconName: "lock",
    subcategories: [
      sub("U-Locks", "https://www.masterlock.com/products/product/8333EC", "https://cdn.masterlock.com/product/285/8333EC_ML_knockout_1.png", 6),
    ],
  },
  {
    name: "Padlocks, Bluetooth & Electronic Locks",
    slug: "padlocks-bluetooth-and-electronic-locks",
    iconName: "lock",
    subcategories: [
      sub("Padlocks", "https://www.masterlock.com/products/product/6400SHENT", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_6400SHENT.jpg", 5),
    ],
  },
  {
    name: "Lock Boxes & Safes, Safes",
    slug: "lock-boxes-and-safes-safes",
    iconName: "lock",
    subcategories: [
      sub("Safes", "https://www.masterlock.com/products/product/P008EML", "https://cdn.masterlock.com/masterlock/static/img/icon-baby-lock.svg", 4),
    ],
  },
  {
    name: "Lock Boxes & Safes, Lock Boxes, Bluetooth & Electronic Locks",
    slug: "lock-boxes-and-safes-lock-boxes-bluetooth-and-electronic-locks",
    iconName: "lock",
    subcategories: [
      sub("Portable Lock Boxes, Lock Boxes", "https://www.masterlock.com/products/product/5440EC", "https://cdn.masterlock.com/masterlock/static/img/icon-baby-lock.svg", 1),
      sub("Wall Mount Lock Boxes, Lock Boxes", "https://www.masterlock.com/products/product/5441EC", "https://cdn.masterlock.com/product/285/MLCOM_PROD_5441EC_01_Hero.jpg", 1),
    ],
  },
  {
    name: "Bluetooth & Electronic Locks",
    slug: "bluetooth-and-electronic-locks",
    iconName: "lock",
    subcategories: [
      sub("Bluetooth & Electronic Locks", "https://www.masterlock.com/products/product/6440ENT", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_6440ENT.jpg", 1),
    ],
  },
  {
    name: "Door Hardware, Bluetooth & Electronic Locks",
    slug: "door-hardware-bluetooth-and-electronic-locks",
    iconName: "lock",
    subcategories: [
      sub("Door Hardware, Bluetooth & Electronic Locks", "https://www.masterlock.com/products/product/D100001BLEEC", "https://cdn.masterlock.com/product/285/D1000_ML_knockout_1.png", 1),
    ],
  },
  {
    name: "Hasps & Hasp Locks",
    slug: "hasps-and-hasp-locks",
    iconName: "lock",
    subcategories: [
      sub("Hasps & Hasp Locks", "https://www.masterlock.com/products/product/M736XKAD", "https://cdn.masterlock.com/product/285/MLCOM_PROD_M736XKAD_01_Hero.jpg", 1),
    ],
  },
  {
    name: "Lock Boxes",
    slug: "lock-boxes",
    iconName: "lock",
    subcategories: [
      sub("Lock Boxes", "https://www.masterlock.com/products/product/5490D", "https://cdn.masterlock.com/product/285/5490D_01_Hero.jpg", 1),
    ],
  },
  {
    name: "Lock Boxes & Safes",
    slug: "lock-boxes-and-safes",
    iconName: "lock",
    subcategories: [
      sub("Wall Mount Lock Boxes", "https://www.masterlock.com/products/product/7123D", "https://cdn.masterlock.com/product/285/MLCOM_PRODUCT_7123D.jpg", 1),
    ],
  },
];

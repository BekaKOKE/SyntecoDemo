import type { BrandCatalogCategory, BrandProduct } from './types';
import { pipArmProtection } from './pip-products/arm-protection';
import { pipColdStress } from './pip-products/cold-stress';
import { pipControlledEnvironment } from './pip-products/controlled-environment';
import { pipElectricalSafety } from './pip-products/electrical-safety';
import { pipEmergencyResponder } from './pip-products/emergency-responder';
import { pipErgonomics } from './pip-products/ergonomics';
import { pipEyeProtection } from './pip-products/eye-protection';
import { pipFallProtection } from './pip-products/fall-protection';
import { pipFirstAid } from './pip-products/first-aid';
import { pipFootProtection } from './pip-products/foot-protection';
import { pipHandProtection } from './pip-products/hand-protection';
import { pipHeadProtection } from './pip-products/head-protection';
import { pipHearingProtection } from './pip-products/hearing-protection';
import { pipHeatStress } from './pip-products/heat-stress';
import { pipProtectiveClothing } from './pip-products/protective-clothing';
import { pipRespiratoryProtection } from './pip-products/respiratory-protection';
import { pipWarningBeacons } from './pip-products/warning-beacons';
import { pipWeldingProtection } from './pip-products/welding-protection';
import { pipWorkwear } from './pip-products/workwear';

/**
 * PIP (Protective Industrial Products) product taxonomy.
 *
 * Mirrors the manufacturer's catalog at https://us.pipglobal.com/en/products/.
 * Each subcategory links to the corresponding page on the official PIP site
 * (opens in a new tab). URLs follow PIP's convention:
 *
 *   https://us.pipglobal.com/en/products/?scID={category}&ccID={subcategory}
 *
 * `scID` = super-category id, `ccID` = child category id.
 *
 * Source: verified scID/ccID pairs collected from us.pipglobal.com.
 */

const PIP_BASE = 'https://us.pipglobal.com/en/products/';

/** Build a PIP subcategory URL from scID + ccID. */
function pipUrl(scID: number, ccID: number): string {
  return `${PIP_BASE}?scID=${scID}&ccID=${ccID}`;
}

/** PIP product thumbnail CDN (open). */
function pipThumb(ccID: number): string {
  return `https://us.pipglobal.com/archive/products/th/${ccID}.png`;
}

function sub(name: string, scID: number, ccID: number) {
  const products: BrandProduct[] | undefined = PRODUCTS[String(ccID)];
  return {
    name,
    url: pipUrl(scID, ccID),
    thumbnailUrl: pipThumb(ccID),
    ...(products ? { products, productCount: products.length } : {}),
  };
}

/**
 * Subcategories we have mirrored product-by-product, keyed by PIP ccID.
 * A subcategory listed here renders an in-site product grid instead of
 * linking straight out to the manufacturer. Extend this as more categories
 * are scraped.
 */
const PRODUCTS: Record<string, BrandProduct[]> = {
  ...pipArmProtection,
  ...pipColdStress,
  ...pipControlledEnvironment,
  ...pipElectricalSafety,
  ...pipEmergencyResponder,
  ...pipErgonomics,
  ...pipEyeProtection,
  ...pipFallProtection,
  ...pipFirstAid,
  ...pipFootProtection,
  ...pipHandProtection,
  ...pipHeadProtection,
  ...pipHearingProtection,
  ...pipHeatStress,
  ...pipProtectiveClothing,
  ...pipRespiratoryProtection,
  ...pipWarningBeacons,
  ...pipWeldingProtection,
  ...pipWorkwear,
};

export const pipCatalog: BrandCatalogCategory[] = [
  {
    name: 'Arm Protection',
    slug: 'arm-protection',
    iconName: 'shield',
    description: 'Sleeves and arm guards that extend hand protection up the forearm.',
    descriptionRu: 'Кожаные и текстильные нарукавники, удлиняющие защиту рук до предплечья.',
    subcategories: [
      sub('Cut Resistant Sleeve', 2575, 11622),
      sub('General Duty Sleeve', 2575, 11666),
      sub('Metal Mesh Sleeves', 2575, 11725),
    ],
  },
  {
    name: 'Cold Stress',
    slug: 'cold-stress',
    iconName: 'shield',
    description: 'Heated apparel and warming gear for cold-environment work.',
    descriptionRu: 'Согревающая одежда с подогревом для работы в холодных условиях.',
    subcategories: [
      sub('Heated Apparel', 2581, 11712),
      sub('Warming', 2581, 11662),
    ],
  },
  {
    name: 'Controlled Environment',
    slug: 'controlled-environment',
    iconName: 'lock',
    description: 'Cleanroom-grade gloves, apparel and accessories for sterile environments.',
    descriptionRu: 'Перчатки, одежда и аксессуары чистых помещений для стерильных сред.',
    subcategories: [
      sub('CE Apron', 2561, 11588),
      sub('CE Finger Cots', 2561, 11686),
      sub('CE Gloves', 2561, 11553),
      sub('CE Masks', 2561, 11730),
      sub('CE Supplies', 2561, 11548),
      sub('Reusable Clothing', 2561, 11697),
    ],
  },
  {
    name: 'Electrical Safety',
    slug: 'electrical-safety',
    iconName: 'warning',
    description: 'Arc-rated kits, insulating gloves, blankets and sleeves (Salisbury).',
    descriptionRu: 'Комплекты для защиты от дуги, диэлектрические перчатки, blanketы и нарукавники (Salisbury).',
    subcategories: [
      sub('Arc Accessories', 2565, 11640),
      sub('Arc Clothing', 2565, 11642),
      sub('Arc Protection Kits', 2565, 11644),
      sub('Electrical Glove Protection', 2565, 11624),
      sub('Electrical Safety Accessories', 2565, 11648),
      sub('Insulating Blankets', 2565, 11698),
      sub('Insulating Glove Kit', 2565, 11649),
      sub('Insulating Gloves', 2565, 11620),
      sub('Insulating Sleeves', 2565, 11670),
    ],
  },
  {
    name: 'Emergency Responder',
    slug: 'emergency-responder',
    iconName: 'shield',
    description: 'Fire & rescue gloves and goggles for first responders.',
    descriptionRu: 'Перчатки и очки для пожарных расчётов и спасателей.',
    subcategories: [
      sub('Fire and Rescue Gloves', 2578, 11636),
      sub('Fire and Rescue Goggle', 2578, 11635),
    ],
  },
  {
    name: 'Ergonomics',
    slug: 'ergonomics',
    iconName: 'wrench',
    description: 'Ergonomic supports and knee protection to reduce strain injuries.',
    descriptionRu: 'Эргономичные пояса и защита коленей для снижения травм от перенапряжения.',
    subcategories: [
      sub('Ergonomic Supports', 2564, 11614),
      sub('Knee Protection', 2564, 11564),
    ],
  },
  {
    name: 'Eye Protection',
    slug: 'eye-protection',
    iconName: 'shield',
    description: 'Safety glasses, goggles and face protection (Bouton® line).',
    descriptionRu: 'Защитные очки, маски и щитки для лица (линейка Bouton®).',
    subcategories: [
      sub('Eyewear Accessories', 2562, 11557),
      sub('Face Protection', 2562, 11611),
      sub('Safety Glasses', 2562, 11613),
      sub('Safety Goggles', 2562, 11554),
    ],
  },
  {
    name: 'Fall Protection',
    slug: 'fall-protection',
    iconName: 'shield',
    description: 'Full fall-protection program — harnesses, SRLs, lanyards, lifelines and kits.',
    descriptionRu: 'Полная программа защиты от падения — привязи, блокирующие устройства, стропы, леера и комплекты.',
    subcategories: [
      sub('Accessories', 2584, 11679),
      sub('Anchorage Connectors', 2584, 11678),
      sub('Body Belts', 2584, 11779),
      sub('Connecting Devices', 2584, 11681),
      sub('Descent and Confined Spaces', 2584, 11788),
      sub('Fall Protection Kits', 2584, 11739),
      sub('Harnesses', 2584, 11785),
      sub('Horizontal Lifelines', 2584, 11810),
      sub('Lanyard — Energy Absorbing', 2584, 11784),
      sub('Lanyard — Positioning', 2584, 11783),
      sub('Rope and Grabs', 2584, 11786),
      sub('Self-Retracting Lifelines (SRL)', 2584, 11782),
      sub('Tool Tethering', 2584, 11693),
      sub('Vertical Lifelines', 2584, 11814),
    ],
  },
  {
    name: 'First Aid',
    slug: 'first-aid',
    iconName: 'shield',
    description: 'Eyewash stations and job-site first aid kits.',
    descriptionRu: 'Станции промывания глаз и аптечки первой помощи для стройплощадок.',
    subcategories: [
      sub('Eyewash', 2570, 11687),
      sub('First Aid Kit', 2570, 11582),
    ],
  },
  {
    name: 'Foot Protection',
    slug: 'foot-protection',
    iconName: 'shield',
    description: 'Over-shoe/over-sock boots, safety footwear and work shoes.',
    descriptionRu: 'Боты поверх обуви, безопасная рабочая обувь и ботинки.',
    subcategories: [
      sub('Over-the-Shoe Boots', 2586, 11794),
      sub('Over-the-Sock Boots', 2586, 11793),
      sub('Safety Footwear', 2586, 11823),
      sub('Work Boots', 2586, 11829),
      sub('Work Shoes', 2586, 11830),
      sub('Work Trainers', 2586, 11828),
    ],
  },
  {
    name: 'Hand Protection',
    slug: 'hand-protection',
    iconName: 'package',
    description: 'The broadest PIP line — gloves for every hazard and task.',
    descriptionRu: 'Самая широкая линейка PIP — перчатки для любых задач и рисков.',
    subcategories: [
      sub('Chemical Resistant', 2560, 11559),
      sub('Cut Resistant Gloves', 2560, 11570),
      sub('Disposable Gloves', 2560, 11547),
      sub('Extended Use Disposable Gloves', 2560, 11731),
      sub('Fabric Work Gloves', 2560, 11552),
      sub('General Purpose Gloves — Coated', 2560, 11549),
      sub('General Purpose Gloves — Uncoated', 2560, 11550),
      sub('High Performance Gloves', 2560, 11581),
      sub('Leather Drivers', 2560, 11573),
      sub('Leather Palm Gloves', 2560, 11621),
      sub('Metal Mesh Gloves', 2560, 11724),
      sub('Parade Gloves', 2560, 11568),
      sub('Protection From Cold', 2560, 11587),
      sub('Protection From Heat', 2560, 11578),
    ],
  },
  {
    name: 'Head Protection',
    slug: 'head-protection',
    iconName: 'shield',
    description: 'Hard hats, Type II safety helmets, bump caps and winter liners.',
    descriptionRu: 'Каски, шлемы Type II, противоударные шапки и зимние подшлемники.',
    subcategories: [
      sub('Accessories', 2569, 11721),
      sub('Bump Caps', 2569, 11576),
      sub('FR Hoods', 2569, 11652),
      sub('Go-To-Work Kits', 2569, 11645),
      sub('Hard Hats', 2569, 11575),
      sub('Safety Helmets', 2569, 11738),
      sub('Winter Caps & Liners', 2569, 11628),
    ],
  },
  {
    name: 'Hearing Protection',
    slug: 'hearing-protection',
    iconName: 'shield',
    description: 'Ear muffs and ear plugs for noise-induced hearing loss prevention.',
    descriptionRu: 'Беруши и наушники для защиты от шума и предотвращения потери слуха.',
    subcategories: [
      sub('Ear Muffs', 2568, 11574),
      sub('Ear Plugs', 2568, 11598),
    ],
  },
  {
    name: 'Heat Stress',
    slug: 'heat-stress',
    iconName: 'warning',
    description: 'Cooling apparel, hydration and sun protection for hot environments.',
    descriptionRu: 'Охлаждающая одежда, гидратация и защита от солнца для жарких условий.',
    subcategories: [
      sub('Absorptive', 2574, 11655),
      sub('Evaporative Cooling', 2574, 11616),
      sub('Hydration', 2574, 11736),
      sub('Phase Change Cooling', 2574, 11627),
      sub('Sun Protection', 2574, 11656),
    ],
  },
  {
    name: 'Protective Clothing',
    slug: 'protective-clothing',
    iconName: 'shield',
    description: 'Apparel for every hazard — FR, disposable, cut resistant, hi-vis, rain.',
    descriptionRu: 'Одежда для любых условий — огнестойкая, одноразовая, от порезов, сигнальная, от дождя.',
    subcategories: [
      sub('Accessories', 2563, 11716),
      sub('Aprons', 2563, 11560),
      sub('Chemical Resistant Clothing', 2563, 11821),
      sub('Cold Weather Wear', 2563, 11742),
      sub('Cut Resistant Wear', 2563, 11654),
      sub('Disposable Clothing', 2563, 11561),
      sub('FR Clothing', 2563, 11566),
      sub('Face Covers', 2563, 11734),
      sub('Hi-Vis Apparel', 2563, 11629),
      sub('Hi-Vis Cold Gear', 2563, 11711),
      sub('Hi-Vis Rainwear', 2563, 11752),
      sub('Hoods & Paint Caps', 2563, 11740),
      sub('Metal Mesh Clothing', 2563, 11723),
      sub('Rainwear', 2563, 11558),
    ],
  },
  {
    name: 'Respiratory Protection',
    slug: 'respiratory-protection',
    iconName: 'shield',
    description: 'Disposable masks, reusable facepieces, supplied air and escape solutions.',
    descriptionRu: 'Одноразовые маски, многоразовые полумаски, подача воздуха и средства экстренной эвакуации.',
    subcategories: [
      sub('Disposable Masks', 2566, 11571),
      sub('Escape Solutions', 2566, 11818),
      sub('Reusable Facepieces', 2566, 11668),
      sub('Supplied Air Respirators', 2566, 11819),
    ],
  },
  {
    name: 'Warning Beacons',
    slug: 'warning-beacons',
    iconName: 'warning',
    description: 'E-Flare beacons for traffic and hazard signaling.',
    descriptionRu: 'Сигнальные маячки E-Flare для регулирования движения и предупреждения об опасности.',
    subcategories: [
      sub('E-Flare Beacon', 2567, 11601),
    ],
  },
  {
    name: 'Welding Protection',
    slug: 'welding-protection',
    iconName: 'warning',
    description: 'FR clothing, hand and head protection and accessories for welders.',
    descriptionRu: 'Огнестойкая одежда, защита рук и головы, аксессуары для сварщиков.',
    subcategories: [
      sub('FR Clothing', 2585, 11701),
      sub('Hand Protection', 2585, 11703),
      sub('Head Protection', 2585, 11747),
      sub('Welding Accessory', 2585, 11709),
    ],
  },
  {
    name: 'Workwear',
    slug: 'workwear',
    iconName: 'shield',
    description: 'Work apparel built for durability and comfort on the job.',
    descriptionRu: 'Рабочая одежда, созданная для долговечности и комфорта на рабочем месте.',
    subcategories: [
      sub('Work Apparel', 2588, 11757),
    ],
  },
];

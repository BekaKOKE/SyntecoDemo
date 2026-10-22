import type { BrandCatalogCategory } from './types';

/**
 * ANSUL product and solution groups from the official manufacturer pages.
 * Source: https://www.ansul.com/foam-concentrates-and-equipment
 */
export const ansulCatalog: BrandCatalogCategory[] = [
  {
    name: 'Foam Concentrates & Equipment',
    slug: 'foam-concentrates-and-equipment',
    iconName: 'package',
    descriptionRu: 'Пенные концентраты, агенты и оборудование для их подачи',
    subcategories: [
      {
        name: 'Foam Concentrates and Agents',
        url: 'https://www.ansul.com/foam-concentrates-and-equipment/foam-concentrates-and-agents',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/product-images/firefighting-foam-concentrates-and-equipment/foam-concentrates-and-agents/non-fluorinated-foam-can.jpg?la=en&h=200&w=320&hash=68378353100E2F7B86AD244475092945',
      },
      {
        name: 'Foam Hardware',
        url: 'https://www.ansul.com/foam-concentrates-and-equipment/foam-hardware',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/product-images/firefighting-foam-concentrates-and-equipment/foam-hardware/red-foam-system-unit.jpg?la=en&h=200&w=320&hash=C6732C580BFE29349361F3DB88168FA6',
      },
    ],
  },
  {
    name: 'Industrial Systems',
    slug: 'industrial-systems',
    iconName: 'warning',
    descriptionRu: 'Стационарные системы тушения сложных промышленных рисков',
    subcategories: [
      {
        name: 'Large Dry Chemical',
        url: 'https://www.ansul.com/industrial-fire-supression-systems/dry-chemical-fire-suppression-system',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/product-images/industrial-systems/two-extinguishers-near-wall.jpg?la=en&h=200&w=320&hash=F532541C686CBD3237C788175E065EC4',
      },
    ],
  },
  {
    name: 'Gaseous Suppression Systems',
    slug: 'gaseous-suppression-systems',
    iconName: 'shield',
    descriptionRu: 'Газовое пожаротушение, обнаружение и управление',
    subcategories: [
      {
        name: 'Halocarbon Systems',
        url: 'https://www.ansul.com/gaseous-suppression-agent-releasing/halocarbon-fire-suppression-systems',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/product-images/transparent-images/row-of-fire-extinguishers-closeup.png?la=en&h=200&w=320&hash=AD9B188E43115185DCED445B47561550',
      },
      {
        name: 'Inert Gas Systems',
        url: 'https://www.ansul.com/gaseous-suppression-agent-releasing/inert-gas-fire-suppression-systems',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/product-images/transparent-images/rows-of-fire-extinguishers-arranged-together.png?la=en&h=200&w=320&hash=7EA88783724A7D51DCC3FB410039A565',
      },
      {
        name: 'Carbon Dioxide Systems',
        url: 'https://www.ansul.com/gaseous-suppression-agent-releasing/carbon-dioxide-fire-suppression-systems',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/product-images/gas-suppression/water-mist-fire-suppression-system.jpg?la=en&h=200&w=320&hash=2DD68F8B1D6629447325369A25D61225',
      },
      {
        name: 'Detection and Control Solutions',
        url: 'https://www.ansul.com/gaseous-suppression-agent-releasing/detection-and-control-solutions',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/product-images/gas-suppression/lithium-ion-risk-prevention-panels.jpg?la=en&h=200&w=320&hash=D5716A69F186D5D2F0BB6620B97CADC7',
      },
      {
        name: 'Acoustic Nozzles',
        url: 'https://www.ansul.com/gaseous-suppression-agent-releasing/acoustic-nozzles',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/product-images/gas-suppression/fsp_commercialproductdetail_product_acoustic_nozzle.png?la=en&h=200&w=320&hash=CA75E1D02F3F74E386FD927D19F7BBA0',
      },
    ],
  },
  {
    name: 'Portable Fire Extinguishers & Spill Control',
    slug: 'portable-fire-extinguishers-and-spill-control',
    iconName: 'warning',
    descriptionRu: 'Переносные огнетушители и локализация опасных разливов',
    subcategories: [
      {
        name: 'SENTRY Fire Extinguishers',
        url: 'https://www.ansul.com/portable-fire-extinguishers-and-spill-control-products/sentry-fire-extinguishers',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/portable-fire-extinguishers-and-spill-control-products/sentry-fire-extinguishers.jpg?la=en&h=690&w=867&hash=DD3704B8403A8DE562EF1C9B98E31236',
      },
      {
        name: 'RED LINE Fire Extinguishers',
        url: 'https://www.ansul.com/portable-fire-extinguishers-and-spill-control-products/redline-fire-extinguishers',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/portable-fire-extinguishers-and-spill-control-products/red-line-fire-extinguishers.jpg?la=en&h=690&w=867&hash=977C34399EA0FDBB8879AAD25CCFD776',
      },
      {
        name: 'Restaurant Fire Extinguishers',
        url: 'https://www.ansul.com/portable-fire-extinguishers-and-spill-control-products/restaurant-fire-extinguishers',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/portable-fire-extinguishers-and-spill-control-products/restaurant-fire-extingusihers.jpg?la=en&h=690&w=867&hash=3706EEE82C41A49DCB4528EE7E0C128D',
      },
      {
        name: 'Hazardous Spill Control Products',
        url: 'https://www.ansul.com/portable-fire-extinguishers-and-spill-control-products/hazardous-spill-control-products',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/portable-fire-extinguishers-and-spill-control-products/hazardous-spill-control-products.jpg?la=en&h=690&w=867&hash=9D19937F251480A1285ADACB897F1453',
      },
    ],
  },
  {
    name: 'Restaurant Systems',
    slug: 'restaurant-systems',
    iconName: 'shield',
    descriptionRu: 'Автоматическое пожаротушение профессиональных кухонь',
    subcategories: [
      {
        name: 'PIRANHA Dual Agent Restaurant Fire Suppression System',
        url: 'https://www.ansul.com/restaurant-systems/piranha-dual-agent-restaurant-fire-suppression-system',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/imagery-revisions/piranha-dual-agent-restaurant-fire-suppression-system.jpg?la=en&h=752&w=1053&hash=6A6D839D0FB05697F1B09540597892EC',
      },
      {
        name: 'R-102 Restaurant Fire Suppression System',
        url: 'https://www.ansul.com/restaurant-systems/r-102-restaurant-fire-suppression-system',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/imagery-revisions/r-102_restaurant_fire_suppression_system.jpg?la=en&h=752&w=1053&hash=6251838A9157301E05728FA20D93D4FB',
      },
      {
        name: 'K-Guard Fire Extinguisher',
        url: 'https://www.ansul.com/portable-fire-extinguishers-and-spill-control-products/restaurant-fire-extinguisher/kguard_fire_extinguisher_fsp/k-guard-fire-extinguisher',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/imagery-revisions/k-guard-fire-extinguisher.jpg?la=en&h=752&w=1053&hash=6A51EA62E8972A5CE8196E42118E2FFE',
      },
    ],
  },
  {
    name: 'Vehicle Systems',
    slug: 'vehicle-systems',
    iconName: 'wrench',
    descriptionRu: 'Обнаружение и тушение пожаров на тяжелой и специальной технике',
    subcategories: [
      {
        name: 'Detection and Actuation Systems',
        url: 'https://www.ansul.com/vehicle-fire-protection-systems/fire-detection-and-actuation-system',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/vehicle-fire-protection-systems/detection-and-actuation-systems-thumbnail.jpg?h=366&iar=0&w=490&hash=EDAC9AB4204640FE6022F140F96DBB4D',
      },
      {
        name: 'Vehicle Fire Suppression Systems',
        url: 'https://www.ansul.com/vehicle-fire-protection-systems/vehicle-fire-suppression-systems',
        thumbnailUrl:
          'https://www.ansul.com/-/media/project/jci-global/fire-suppression/ansul/united-states-ansul/vehicle-fire-protection-systems/vehicle-fire-suppression-systems-thumbnail.jpg?h=366&iar=0&w=490&hash=C80A135AD511AC6F123F276EF875CB10',
      },
    ],
  },
];

import type { BrandCatalogCategory } from './types';

/**
 * Honeywell product taxonomy.
 *
 * Source: automation.honeywell.com (the consolidated Honeywell product
 * portal — covers Process Automation, Sensing, PPE, Productivity, Thermal,
 * Smart Energy and Warehouse Automation in one place).
 *
 * 9 top-level categories, each linking to the corresponding page on the
 * official Honeywell site (opens in a new tab). Thumbnail images are hosted
 * on Honeywell's Scene7 / EDAM CDNs; a few are sourced from related
 * manufacturer catalogs (PIP) where Honeywell imagery was unavailable.
 */

const A = 'https://automation.honeywell.com/us/en/products';
const P = 'https://process.honeywell.com/us/en/products';

function sub(name: string, url: string, thumbnailUrl?: string) {
  return { name, url, thumbnailUrl };
}

export const honeywellCatalog: BrandCatalogCategory[] = [
  {
    name: 'Detection, Measurement and Control',
    slug: 'detection-measurement-control',
    iconName: 'warning',
    description: 'Drives, field instruments, gas detection, HMI, SCADA and terminals.',
    descriptionRu: 'Драйвы, полевые приборы, газоанализаторы, HMI, SCADA и клеммные соединения.',
    subcategories: [
      sub('Drives', `${P}/process-automation/drives`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-drives-category-image'),
      sub('Field Instruments', `${P}/field-instruments`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-smartline-multivarible-category-image'),
      sub('Gas & Flame Detection', `${A}/sensing-solutions/gas-and-flame-detection`, 'https://honeywell.scene7.com/is/image/Honeywell65/hon-ia-pmc-respiratory-scba-test-bench-tile-9'),
      sub('Gas Measurement, Control & Analysis', `${P}/gas`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-gas-transmission-category-image1'),
      sub('Human Machine Interface (HMI)', `${P}/control-and-supervisory-systems/human-machine-interfaces-hmi`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-experion-panel-pc-image'),
      sub('Marine', `${P}/marine`, 'https://honeywell.scene7.com/is/image/Honeywell65/SmartLine%20Temperature%20Transmitter%20STT850%20Image'),
      sub('Modular Controllers', `${P}/control-and-supervisory-systems/modular-controllers`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-controledge-hc900-image'),
      sub('Modular Systems Remote IO', `${P}/control-and-supervisory-systems/modular-systems-remote-io`, 'https://honeywell.scene7.com/is/image/Honeywell65/hon-ia-pas-ce-iox-io-module-series-primary-image'),
      sub('Process Instruments', `${P}/process-instruments`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-controllers-and-programmers-category-image'),
      sub('SCADA', `${P}/control-and-supervisory-systems/scada/experion-hs`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-experionhs-image'),
      sub('Terminals', `${P}/terminals`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-loading-category-image'),
    ],
  },
  {
    name: 'More Products',
    slug: 'more-products',
    iconName: 'package',
    description: 'Asset tracking and search & rescue solutions.',
    descriptionRu: 'Отслеживание активов и решения для поиска и спасения.',
    subcategories: [
      sub('Asset Tracking and Monitoring', `${A}/more-products/asset-tracking`, 'https://consyst.biz/wp-content/uploads/2022/02/ASSET-TRACKING-MONITORING-1.jpg'),
      sub('Search & Rescue', `${A}/more-products/search-and-rescue`, 'https://upload.wikimedia.org/wikipedia/commons/2/22/Canada_Search_and_Rescue.jpg'),
    ],
  },
  {
    name: 'Personal Protective Equipment',
    slug: 'personal-protective-equipment',
    iconName: 'shield',
    description: 'Head-to-toe PPE — electrical, eye, face, fall, hand, head, hearing, respiratory, apparel, footwear, first aid.',
    descriptionRu: 'СИЗ с головы до ног — от электрической безопасности до защиты глаз, лица, головы, слуха, органов дыхания, одежды и обуви.',
    subcategories: [
      sub('Electrical Safety', `${A}/personal-protective-equipment/electrical-safety`, 'https://preview1.assetsadobe.com/is/image/Honeywell65/hon-ia-ppe-pro-wear-plus-category-tile-6'),
      sub('Eye Protection', `${A}/personal-protective-equipment/eye-protection`, 'https://us.pipglobal.com/archive/pim/300/36/250-40-0016-Front%20Angle-NEW2.jpg'),
      sub('Face Protection', `${A}/personal-protective-equipment/face-protection`, 'https://us.pipglobal.com/archive/pim/300/11/280-HP1491FS.jpg'),
      sub('Fall Protection', `${A}/personal-protective-equipment/fall-protection`, 'https://us.pipglobal.com/archive/pim/300/49/H7IC1A1-front.jpg'),
      sub('First Aid', `${A}/personal-protective-equipment/first-aid`, 'https://us.pipglobal.com/archive/pim/300/33/299-13285---F.jpg'),
      sub('Hand Protection', `${A}/personal-protective-equipment/hand-protection`, 'https://us.pipglobal.com/archive/pim/300/1/34-874---UP.jpg'),
      sub('Head Protection', `${A}/personal-protective-equipment/head-protection`, 'https://us.pipglobal.com/archive/pim/300/14/280-HP1491RVM-01---FL.jpg'),
      sub('Hearing Protection', `${A}/personal-protective-equipment/hearing-protection`, 'https://us.pipglobal.com/archive/pim/300/10/263-V3FB.jpg'),
      sub('Protective Apparel', `${A}/personal-protective-equipment/protective-apparel`, 'https://s7d1.scene7.com/is/image/Honeywell65/sps-his-reusable-776-x-666-3-tile'),
      sub('Protective Footwear', `${A}/personal-protective-equipment/protective-footwear`, 'https://honeywell.scene7.com/is/image/Honeywell65/hon-ia-ppe-mts-range-hro-category-tile'),
      sub('Respiratory', `${A}/personal-protective-equipment/respiratory`, 'https://us.pipglobal.com/archive/pim/300/42/PIP_cq5dam.web.1280.1280_1.jpg'),
    ],
  },
  {
    name: 'Process Solutions',
    slug: 'process-solutions',
    iconName: 'wrench',
    description: 'Control systems, field instruments, gas, marine, wireless and turbomachinery automation.',
    descriptionRu: 'Системы управления, полевые приборы, газовое оборудование, морские и беспроводные решения, автоматизация турбомашин.',
    subcategories: [
      sub('Control & Supervisory Systems', `${P}/control-and-supervisory-systems`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-hmi-category-image'),
      sub('Field Instruments', `${P}/field-instruments`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-temperature-transmitters-category-image'),
      sub('Gas', `${P}/gas`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-gas-regulators-category-image1'),
      sub('Marine', `${P}/marine`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-marine-portable-sampling-category-image'),
      sub('Process Instruments', `${P}/process-instruments`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-controllers-and-programmers-category-image'),
      sub('Terminals', `${P}/terminals`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-loading-category-image'),
      sub('Wireless', `${P}/wireless`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-onewireless-category-image'),
      sub('Turbomachinery Automation Systems', `${P}/turbomachinery-automation-systems`, 'https://honeywell.scene7.com/is/image/Honeywell65/hon-ccc-control-software-category-image'),
    ],
  },
  {
    name: 'Productivity Solutions',
    slug: 'productivity-solutions',
    iconName: 'package',
    description: 'Barcode scanners, scan engines, mobile computers, printers, software and voice solutions.',
    descriptionRu: 'Сканеры штрих-кодов, мобильные компьютеры, принтеры этикеток, ПО и голосовые решения для склада.',
    subcategories: [
      sub('Barcode Scan Engines & Modules', `${A}/productivity-solutions/barcode-scan-engines-and-modules`, 'https://honeywell.scene7.com/is/image/Honeywell65/sps-pss-1d-barcode-scan-engines2-hero-tile-9'),
      sub('Barcode Scanners', `${A}/productivity-solutions/barcode-scanners`, 'https://honeywell.scene7.com/is/image/Honeywell65/hon-ia-pss-xenonultra1960-tile-776x666-9'),
      sub('Device Software', `${A}/productivity-solutions/device-software`, 'https://honeywell.scene7.com/is/image/Honeywell65/hon-ia-pss-ct30xp-hc-tile-776x666-9'),
      sub('Mobile Computers', `${A}/productivity-solutions/mobile-computers`, 'https://s7d1.scene7.com/is/image/Honeywell65/sps-ppr-vehicle-mounted-computers-category-tile-9'),
      sub('Printers', `${A}/productivity-solutions/printers`, 'https://honeywell.scene7.com/is/image/Honeywell65/hon-ia-pss-m-industrial-printer-thumnai-picture-776-9'),
      sub('Services', `${A}/productivity-solutions/services`, 'https://honeywell.scene7.com/is/image/Honeywell65/hon-ia-pss-services-tile-776x666-9'),
      sub('Voice Automated Solutions', `${A}/productivity-solutions/voice-automated-solutions`, 'https://honeywell.scene7.com/is/image/Honeywell65/hon-ia-pss-voice-devices-tile-776x666-9'),
    ],
  },
  {
    name: 'Sensing Solutions',
    slug: 'sensing-solutions',
    iconName: 'wrench',
    description: 'Sensors, switches & controls, gas & flame detection, test & measurement, intelligent life care.',
    descriptionRu: 'Датчики, переключатели и системы управления, обнаружение газа и пламени, измерительные приборы.',
    subcategories: [
      sub('Gas & Flame Detection', `${A}/sensing-solutions/gas-and-flame-detection`, 'https://s7d1.scene7.com/is/image/Honeywell65/Touchpoint_Plus_Controller_1'),
      sub('Intelligent Life Care', `${A}/sensing-solutions/intelligent-life-care`, 'https://honeywell.scene7.com/is/image/Honeywell65/sps-sst-call-systems-tile-4'),
      sub('Sensors', `${A}/sensing-solutions/sensors`, 'https://honeywell.scene7.com/is/image/Honeywell65/sps-siot-sensors-humidity-with-temparature-sensors-humidity-thermal-heaters-hero-tile-9'),
      sub('Switches & Controls', `${A}/sensing-solutions/switches-and-controls`, 'https://honeywell.scene7.com/is/image/Honeywell65/sps-ast-switches-keyswitch-hero-tile-9'),
      sub('Test & Measurement', `${A}/sensing-solutions/test-and-measurement`, 'https://honeywell.scene7.com/is/image/Honeywell65/sps-siot-pressure-transducers-hero-tile-9'),
    ],
  },
  {
    name: 'Smart Energy',
    slug: 'smart-energy',
    iconName: 'warning',
    description: 'Gas, water and electricity smart-grid solutions.',
    descriptionRu: 'Решения для «умных сетей» газа, воды и электроэнергии.',
    subcategories: [
      sub('Gas', `${P}/utilities/gas`, 'https://honeywell.scene7.com/is/image/Honeywell65/Cat-LabMeterParts'),
      sub('Water', `${A}/smart-energy/water`, 'https://honeywell.scene7.com/is/image/Honeywell65/Merlin-Clip-On'),
      sub('Electricity', `${P}/utilities/electricity`, 'https://honeywell.scene7.com/is/image/Honeywell65/A4CI'),
    ],
  },
  {
    name: 'Thermal Solutions',
    slug: 'thermal-solutions',
    iconName: 'warning',
    description: 'Burner management, burners, heat exchangers and fuel/air delivery.',
    descriptionRu: 'Системы управления горелками, теплообменники и подача топливно-воздушной смеси.',
    subcategories: [
      sub('Burner Management Systems', `${P}/thermal-solutions/burner-management-systems`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-flamedetectors-category-image'),
      sub('Burners & Heat Exchangers', `${P}/thermal-solutions/burners-and-heat-exchangers`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-sr-burners-category-image-1'),
      sub('Fuel & Air Delivery', `${P}/thermal-solutions/fuel-and-air-delivery`, 'https://honeywell.scene7.com/is/image/Honeywell65/pmt-hps-re-var-r-var-f'),
      sub('DG Smart Pressure Sensor', 'https://process.honeywell.com/us/en/hts/dg-smart-pressure-sensor', 'https://process.honeywell.com/content/dam/automation/en/campaigns/hts/dg-smart-gauge-pressor-sensor/images/hon-ia-hts-dg-smart-sensor.png'),
    ],
  },
  {
    name: 'Warehouse Automation',
    slug: 'warehouse-automation',
    iconName: 'package',
    description: 'Warehouse solutions by strategy, function and technology, plus Transnorm conveyor systems.',
    descriptionRu: 'Складские решения — по стратегии, функциям и технологиям, плюс конвейерные системы Transnorm.',
    subcategories: [
      sub('Solutions by Strategy', `${A}/warehouse-automation/solutions-by-strategy`, 'https://honeywell.scene7.com/is/image/honeywell/sps-igs-micro-fulfillment-centers-hero-icon:3-2-list?wid=712&hei=475&dpr=off'),
      sub('Solutions by Function', `${A}/warehouse-automation/solutions-by-function`, 'https://honeywell.scene7.com/is/image/honeywell/sps-igs-inbound-handling-feature-image1:1-1-square?wid=474&hei=474&dpr=off'),
      sub('Solutions by Technology', `${A}/warehouse-automation/solutions-by-technology`, 'https://honeywell.scene7.com/is/image/honeywell/hon-ia-igs-transnorm-landing-page-hero-image-1:3-2-list?wid=712&hei=475&dpr=off'),
      sub('Transnorm Conveyor and Sortation Systems', `${A}/warehouse-automation/transnorm`, 'https://honeywell.scene7.com/is/image/honeywell/hon-ia-igs-transnorm-page:2-1-article?wid=720&hei=360&dpr=off'),
    ],
  },
];

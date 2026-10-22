import type { BrandCatalogCategory } from './types';

/**
 * uvex safety product catalog, mirroring the official manufacturer taxonomy.
 * Source: https://www.uvex-safety.com/en/products/
 *
 * Structure follows the official "Products" mega-menu: eight main product
 * groups, each with its real sub-product pages. Every card links directly to
 * the matching official uvex page and uses an official uvex CDN image
 * (product-family thumbnail where available, otherwise the official
 * product-group hero image — same convention as the 3M catalog).
 */

// ── Official product-group hero images (used as parent-category fallback) ──
const HERO_HELMETS =
  'https://d3rbxgeqn1ye9j.cloudfront.net/images/OOq9suJ6RVBoMZxkq8X9fgiunrJCqOB0OgeNRyLw2h8/w:1920/h:1670/fn:Y3NtX3V2ZXgtc2NodXR6aGVsbWUta29wZnNjaHV0ei1wc2EtZGVza3RvcF83OTg2ZWYzZjJk:t/cb:a60ebe0cb19af42ea36dec74834ec6d19bed01e2/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS9Qcm9kdWN0X0dyb3Vwcy9Qcm9kdWt0aGF1cHRrYXRlZ29yaWVuL3V2ZXgtc2NodXR6aGVsbWUta29wZnNjaHV0ei1wc2EtZGVza3RvcC5qcGc_MTc3ODIyNTc4OQ';
const HERO_GLASSES =
  'https://d3rbxgeqn1ye9j.cloudfront.net/images/JQf3SgaL5CnNx1Eu7ItlByLttdQajv3P0bBntdSX4hY/w:1920/h:1670/fn:Y3NtX3V2ZXgtc2NodXR6YnJpbGxlbi1hdWdlbnNjaHV0ei1wc2EtZGVza3RvcF9hOWE2YmQxMGY2:t/cb:e80dc660ce60ef49756d8c2bdb0c34d66a07c58b/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS9Qcm9kdWN0X0dyb3Vwcy9Qcm9kdWt0aGF1cHRrYXRlZ29yaWVuL3V2ZXgtc2NodXR6YnJpbGxlbi1hdWdlbnNjaHV0ei1wc2EtZGVza3RvcC5qcGc_MTc3ODIyNTc4OQ';
const HERO_HEARING =
  'https://d3rbxgeqn1ye9j.cloudfront.net/images/9-TYLXx3GlAHkVBBq0CTaiFsCDf1El29u1ZWgCwoQas/w:1920/h:1217/fn:Y3NtX3V2ZXgtc2FmZXR5LWdlaG9lcnNjaHV0ei1lYXJwbHVncy1lYXJtdWZmc18yOWRiOWEzMGIy:t/cb:0d8b122befdb8ff6736d7bac060b44fbd60c42c8/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS9GaWx0ZXJzZWl0ZW4vR2Vob2Vyc2NodXR6L3V2ZXgtc2FmZXR5LWdlaG9lcnNjaHV0ei1lYXJwbHVncy1lYXJtdWZmcy5qcGc_MTc0OTAzNzg2Mw';
const HERO_RESPIRATORY =
  'https://d3rbxgeqn1ye9j.cloudfront.net/images/dOmGzzo0rDMTY3nZB1tSoCZurUWkcrTgaK6scjtvKmY/w:1920/h:1670/fn:Y3NtX3V2ZXgtYXRlbXNjaHV0em1hc2tlbi1wc2EtZGVza3RvcF8zNDE5YWVkYThk:t/cb:c0af4ebc94cab257e90775d202cd6a829cbd76e8/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS9Qcm9kdWN0X0dyb3Vwcy9Qcm9kdWt0aGF1cHRrYXRlZ29yaWVuL3V2ZXgtYXRlbXNjaHV0em1hc2tlbi1wc2EtZGVza3RvcC5qcGc_MTc3ODIyNTc4OQ';
const HERO_GLOVES =
  'https://d3rbxgeqn1ye9j.cloudfront.net/images/nImajcU2Q0vhVYRx7INOnoRlW_jz9aKRv_-EZGRndZg/w:1920/h:1670/fn:Y3NtX3V2ZXgtc2NodXR6aGFuZHNjaHVoZS1oYW5kc2NodXR6LXBzYS1kZXNrdG9wXzlhMGE5Y2ZkY2E:t/cb:c3fe4202a89ce7130ba1226bb169eae57bd85891/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS9Qcm9kdWN0X0dyb3Vwcy9Qcm9kdWt0aGF1cHRrYXRlZ29yaWVuL3V2ZXgtc2NodXR6aGFuZHNjaHVoZS1oYW5kc2NodXR6LXBzYS1kZXNrdG9wLmpwZz8xNzc4MjI1Nzg5';
const HERO_FOOTWEAR =
  'https://d3rbxgeqn1ye9j.cloudfront.net/images/nddxcpAcftZ4SNC9_xKP9oXnFR1XkyarY5vyXWcdyxY/w:1920/h:1217/fn:Y3NtX3V2ZXgtc2ljaGVyaGVpdHNzY2h1aGUtc2NodXR6a2xhc3Nlbi1zMS1zMi1zM18zMzQwYWE0ODFh:t/cb:836d0a5161cf3e3bbd85ad19221eca8197c1bc2f/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS9GaWx0ZXJzZWl0ZW4vU2ljaGVyaGVpdHNzY2h1aGUvdXZleC1zaWNoZXJoZWl0c3NjaHVoZS1zY2h1dHprbGFzc2VuLXMxLXMyLXMzLmpwZz8xNzUwMjQzNzE1';
const HERO_CLOTHING =
  'https://d3rbxgeqn1ye9j.cloudfront.net/images/gUHEIGsMSMPnJklPz3qlwIfJHVzTIY5qC7YaxmhnzW0/w:1920/h:1670/fn:Y3NtX3V2ZXgtd29ya3dlYXItc2NodXR6a2xlaWR1bmctcHNhLWRlc2t0b3BfZDZlOTkzMzYxNw:t/cb:ea8f9982baf1654d3b942f3cf81f3045573f8dbd/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS9Qcm9kdWN0X0dyb3Vwcy9Qcm9kdWt0aGF1cHRrYXRlZ29yaWVuL3V2ZXgtd29ya3dlYXItc2NodXR6a2xlaWR1bmctcHNhLWRlc2t0b3AuanBnPzE3NzgyMzQ2MTY';

export const uvexCatalog: BrandCatalogCategory[] = [
  {
    name: 'Safety helmets',
    slug: 'safety-helmets',
    iconName: 'shield',
    descriptionRu: 'Промышленные и защитные каски, каскетки и аксессуары для защиты головы',
    subcategories: [
      {
        name: 'Safety helmets',
        url: 'https://www.uvex-safety.com/en/products/safety-helmets/',
        thumbnailUrl: HERO_HELMETS,
      },
      {
        name: 'Bump caps',
        url: 'https://www.uvex-safety.com/en/bump-caps-safety-hats/',
        thumbnailUrl: HERO_HELMETS,
      },
      {
        name: 'Safety helmets with Mips®',
        url: 'https://www.uvex-safety.com/en/mips/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/Ej82Hopte65NV9PySCFtoSku94CEDzgfEruiJcSgq6Y/w:350/h:350/fn:Y3NtX21pcHMtSGVsbXRlY2hub2xvZ2llLWJlaS11dmV4XzcwNWRhMTQ4YmQ:t/cb:286baba24cc001f44ca7cd77924f8e3b39c8bbc5/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS8wMV9NZW51ZS1QaWNzL21pcHMtSGVsbXRlY2hub2xvZ2llLWJlaS11dmV4LmpwZz8xNzIyNjAxNDgz',
      },
      {
        name: 'uvex pheos forestry',
        url: 'https://www.uvex-safety.com/en/product-group/forestry-worker-set-with-mesh-visor/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/rwpQbv-5oPR8z4Tm5lzBP-okYPIP_RMhqz5tYN8pSu4/w:350/h:350/fn:Y3NtX3V2ZXgtcGhlb3MtZm9yZXN0cnlfMDI2MGZkODY2Ng:t/cb:1ac60e125876b47423ac61190579e56f9a12f26b/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS8wMV9NZW51ZS1QaWNzL3V2ZXgtcGhlb3MtZm9yZXN0cnkuanBnPzE3MjI2MDE0ODI',
      },
      {
        name: 'uvex vimox visor',
        url: 'https://www.uvex-safety.com/en/uvex-vimox-visor-for-safety-helmets/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/xtSnwUk3EMYTwCKTvVPKqbT8jJ7fJVpJvV7pJvr7SA0/w:350/h:350/fn:Y3NtX3ZpbW94LXZpc2llcl80M2ZmMTQyOWFl:t/cb:a103e441cb4a2ced12a3de9f50b816a7637a7c5e/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS8wMV9NZW51ZS1QaWNzL3ZpbW94LXZpc2llci5qcGc_MTcyMjYwMTQ4Mw',
      },
    ],
  },
  {
    name: 'Safety glasses',
    slug: 'safety-glasses',
    iconName: 'shield',
    descriptionRu: 'Защитные очки, закрытые очки и лицевые щитки с покрытием и УФ-защитой',
    subcategories: [
      {
        name: 'Safety spectacles',
        url: 'https://www.uvex-safety.com/en/products/safety-glasses/',
        thumbnailUrl: HERO_GLASSES,
      },
      {
        name: 'uvex hypervision',
        url: 'https://www.uvex-safety.com/en/hypervision-safety-eyewear-with-face-guard/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/qNNyGWU97hHjUc1stmp_279yRW0omf4XpiOZkaw_3sI/w:350/h:350/fn:Y3NtX3V2ZXgtaHlwZXJ2aXNpb24tbWVudV9lZmM1OTg2N2Nj:t/cb:8c578387e44909fcc03c3efc00e6e834721205a4/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS9Qcm9kdWN0cy9oeXBlcnZpc2lvbi91dmV4LWh5cGVydmlzaW9uLW1lbnUuanBnPzE3NjIyNjI2MzI',
      },
      {
        name: 'uvex pheos nxt',
        url: 'https://www.uvex-safety.com/en/uvex-pheos-nxt/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/U9hcvrHi4YYQ-8pYPNgPhPe1w5iISkt2xlKw0zQTqvU/w:350/h:350/fn:Y3NtX3V2ZXgtcGhlb3Mtbnh0XzM2ZGEyY2FiZmQ:t/cb:2417a89e8dd60d0b64d836eb9e05c802b62991f9/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS8wMV9NZW51ZS1QaWNzL3V2ZXgtcGhlb3Mtbnh0LmpwZz8xNzIyNjA1MDAx',
      },
      {
        name: 'Prescription safety spectacles',
        url: 'https://www.uvex-safety.com/en/individual-ppe/prescription-safety-spectacles/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/cD-HpwjobQE3q3iOs653Xih1IIalS86UOn2JrRGySoo/w:350/h:350/fn:Y3NtX3NjaHV0emJyaWxsZS1taXQtc2Voc3RhZXJrZV8zOWIwMGI3Yzdl:t/cb:fff4eb02a250c71a18381167935d2600cc8d106c/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS8wMV9NZW51ZS1QaWNzL3NjaHV0emJyaWxsZS1taXQtc2Voc3RhZXJrZS5qcGc_MTcyMjU5NTEwOQ',
      },
    ],
  },
  {
    name: 'Hearing protection',
    slug: 'hearing-protection',
    iconName: 'package',
    descriptionRu: 'Беруши, дужковые беруши, наушники и индивидуальные отопласты',
    subcategories: [
      {
        name: 'Earplugs',
        url: 'https://www.uvex-safety.com/en/products/earplugs/',
        thumbnailUrl: HERO_HEARING,
      },
      {
        name: 'Banded earplugs',
        url: 'https://www.uvex-safety.com/en/banded-earplugs/',
        thumbnailUrl: HERO_HEARING,
      },
      {
        name: 'uvex aXess one',
        url: 'https://www.uvex-safety.com/en/bluetooth-hearing-protecting-uvex-axess-one/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/uZJtt3fxxv4argeEoA-Fiy58UYK-rO7lHVrUWaQ-AyA/w:350/h:350/fn:Y3NtX3V2ZXgtYXhlc3Mtb25lXzJkZDFhMWFjNzE:t/cb:d386a9d6ca00b83a72c45444236045ce413213ca/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS8wMV9NZW51ZS1QaWNzL3V2ZXgtYXhlc3Mtb25lLmpwZz8xNzIyNjAyMzMw',
      },
      {
        name: 'Hearing protection otoplastics',
        url: 'https://www.uvex-safety.com/en/individual-ppe/hearing-protection-otoplastics/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/tAbzlNpgr_ke8qi0WcPm-WZwm5TX7FoCns1l7Xy2sKo/w:350/h:350/fn:Y3NtX2dlaG9lcnNjaHV0em90b3BsYXN0aWtlbl9mYTcxYzkyNTkx:t/cb:6950a2e7db511b2cffabf81021e3a3b7680b0056/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS8wMV9NZW51ZS1QaWNzL2dlaG9lcnNjaHV0em90b3BsYXN0aWtlbi5qcGc_MTcyMjU5NTM2MA',
      },
    ],
  },
  {
    name: 'Respiratory protection',
    slug: 'respiratory-protection',
    iconName: 'warning',
    descriptionRu: 'Фильтрующие полумаски FFP1/FFP2/FFP3 и линейка uvex silv-Air',
    subcategories: [
      {
        name: 'FFP 1',
        url: 'https://www.uvex-safety.com/en/ffp1-masks/',
        thumbnailUrl: HERO_RESPIRATORY,
      },
      {
        name: 'FFP 2',
        url: 'https://www.uvex-safety.com/en/ffp2-masks/',
        thumbnailUrl: HERO_RESPIRATORY,
      },
      {
        name: 'FFP 3',
        url: 'https://www.uvex-safety.com/en/ffp3-masks/',
        thumbnailUrl: HERO_RESPIRATORY,
      },
      {
        name: 'uvex silv-Air c',
        url: 'https://www.uvex-safety.com/en/uvex-silv-air-c-respirator-masks/',
        thumbnailUrl: HERO_RESPIRATORY,
      },
      {
        name: 'uvex silv-Air e',
        url: 'https://www.uvex-safety.com/en/uvex-silv-air-e-respiratory-protection/',
        thumbnailUrl: HERO_RESPIRATORY,
      },
      {
        name: 'uvex silv-Air premium',
        url: 'https://www.uvex-safety.com/en/product-group/uvex-silv-air-premium-respiratory-protection-in-ffp1-ffp2-ffp3/',
        thumbnailUrl: HERO_RESPIRATORY,
      },
    ],
  },
  {
    name: 'Safety gloves',
    slug: 'safety-gloves',
    iconName: 'package',
    descriptionRu: 'Перчатки для защиты от порезов, проколов, химии, сборочные и одноразовые',
    subcategories: [
      {
        name: 'Cut protection gloves',
        url: 'https://www.uvex-safety.com/en/products/cut-protection-gloves/',
        thumbnailUrl: HERO_GLOVES,
      },
      {
        name: 'Stab protection gloves',
        url: 'https://www.uvex-safety.com/en/stab-protection-gloves/',
        thumbnailUrl: HERO_GLOVES,
      },
      {
        name: 'Disposable gloves',
        url: 'https://www.uvex-safety.com/en/disposable-gloves/',
        thumbnailUrl: HERO_GLOVES,
      },
      {
        name: 'Arm protection',
        url: 'https://www.uvex-safety.com/en/arm-protection/',
        thumbnailUrl: HERO_GLOVES,
      },
      {
        name: 'Assembly gloves',
        url: 'https://www.uvex-safety.com/en/products/assembly-gloves/',
        thumbnailUrl: HERO_GLOVES,
      },
      {
        name: 'Chemical protection gloves',
        url: 'https://www.uvex-safety.com/en/chemical-protection-gloves/',
        thumbnailUrl: HERO_GLOVES,
      },
      {
        name: 'uvex phynomic',
        url: 'https://www.uvex-safety.com/en/uvex-phynomic-cut-protection-for-every-level/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/VZz-jB31QhaJWFkptlkv4f4gKEI6phf_j59SvQ4T2o0/w:350/h:350/fn:Y3NtX3V2ZXgtcGh5bm9taWMtY3V0LXByb3RlY3Rpb25fMDZlNWRiYmExOA:t/cb:fcbe2ff729e5cee6c191c0c43f4f7329badf3c8d/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS8wMV9NZW51ZS1QaWNzL3V2ZXgtcGh5bm9taWMtY3V0LXByb3RlY3Rpb24uanBnPzE3MjI1OTg5ODI',
      },
      {
        name: 'uvex Bamboo TwinFlex®',
        url: 'https://www.uvex-safety.com/en/product-group/uvex-bamboo-twinflex-safety-gloves/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/IXVTRqHk2kKajmkd7amJgqrtSlwt1QTtJcDosmxrNfg/w:350/h:350/fn:Y3NtX2JhbWJvby10d2luZmxleC1zZXJpZS1tZW51XzA3ZjQ2OTM0YTc:t/cb:0ef636d0dee5e50a203816baeefd83764f54305a/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS9Qcm9kdWN0cy9iYW1ib28tdHdpbmZsZXgtc2VyaWUvYmFtYm9vLXR3aW5mbGV4LXNlcmllLW1lbnUuanBnPzE3NjIyNTU5NzI',
      },
      {
        name: 'uvex rubiflex S',
        url: 'https://www.uvex-safety.com/en/uvex-rubiflex-s/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/jl3l55XH3pUgjVTjLuHCUkMSd1LhLW8yGP_ZffcuDxM/w:350/h:350/fn:Y3NtX3J1YmlmbGV4LVNjaHV0emhhbmRzY2h1aGVfZDAyZDUwY2I0Nw:t/cb:a22a2a8fd6e3408cafe5eaf8022fdb5811ca1cf9/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS8wMV9NZW51ZS1QaWNzL3J1YmlmbGV4LVNjaHV0emhhbmRzY2h1aGUuanBnPzE3MjI1OTg5ODI',
      },
    ],
  },
  {
    name: 'Safety footwear',
    slug: 'safety-footwear',
    iconName: 'package',
    descriptionRu: 'Защитная обувь классов S1, S2, S3, сандалии и ESD-модели',
    subcategories: [
      {
        name: 'S1 safety shoes',
        url: 'https://www.uvex-safety.com/en/products/s1-safety-shoes/',
        thumbnailUrl: HERO_FOOTWEAR,
      },
      {
        name: 'S2 safety shoes',
        url: 'https://www.uvex-safety.com/en/products/safety-shoes-s2/',
        thumbnailUrl: HERO_FOOTWEAR,
      },
      {
        name: 'S3 safety shoes',
        url: 'https://www.uvex-safety.com/en/products/safety-shoes-s3/',
        thumbnailUrl: HERO_FOOTWEAR,
      },
      {
        name: 'Safety sandals',
        url: 'https://www.uvex-safety.com/en/safety-sandals/',
        thumbnailUrl: HERO_FOOTWEAR,
      },
      {
        name: 'ESD safety shoes',
        url: 'https://www.uvex-safety.com/en/products/esd-safety-shoes/',
        thumbnailUrl: HERO_FOOTWEAR,
      },
      {
        name: 'uvex 1 sport',
        url: 'https://www.uvex-safety.com/en/product-group/uvex-1-sport-metal-free-safety-shoes/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/1uKQnsr6Ctg7r6Q2-8CVGymZNlqc-XSLfcjJNI4njqQ/w:350/h:350/fn:Y3NtX3V2ZXgtMS1zcG9ydC1uZXVoZWl0ZW4tbWVudWthY2hlbC1xdWFkcmF0aXNjaF83N2U1MTAyYjdi:t/cb:c3ed5eeab866b53bbb736c13ffad557a7e2d6e74/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS9MYW5kaW5ncGFnZXMvdXZleC0xLXNwb3J0LTIwMjUvdXZleC0xLXNwb3J0LW5ldWhlaXRlbi1tZW51a2FjaGVsLXF1YWRyYXRpc2NoLmpwZz8xNzYxNjU2MTkx',
      },
      {
        name: 'uvex 2 trend',
        url: 'https://www.uvex-safety.com/en/uvex-2-trend-safety-shoes/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/AiV4AlUMlojvC4SwIImIGpAvv_dM36xycD1AZj7OKR8/w:350/h:350/fn:Y3NtX3V2ZXgtMi10cmVuZC1uZXVoZWl0ZW4tbWVudWthY2hlbC1xdWFkcmF0aXNjaF85OTQ2MzhkMjM5:t/cb:380b68655cd3c4b3b2a65a6149807ca836e18b49/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS9MYW5kaW5ncGFnZXMvdXZleC0yLXRyZW5kLTIwMjUvdXZleC0yLXRyZW5kLW5ldWhlaXRlbi1tZW51a2FjaGVsLXF1YWRyYXRpc2NoLmpwZz8xNzYxNjU2MTgy',
      },
    ],
  },
  {
    name: 'Protective clothing & workwear',
    slug: 'protective-clothing-and-workwear',
    iconName: 'package',
    descriptionRu: 'Спецодежда, рабочая одежда и одноразовые защитные комбинезоны',
    subcategories: [
      {
        name: 'Protective clothing & workwear',
        url: 'https://www.uvex-safety.com/en/products/protective-clothing-and-workwear/',
        thumbnailUrl: HERO_CLOTHING,
      },
      {
        name: 'Disposable protective clothing',
        url: 'https://www.uvex-safety.com/en/disposable-protective-clothing/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/2rVoM1hyhKbjcA7jheZHgT-05fGD0uWFN1RynRlqeWA/w:350/h:350/fn:Y3NtX2NoZW1pa2FsaWVuc2NodXR6YW56dWdfMTdiY2IzYTc5Nw:t/cb:2a4710f1db64c2c58ee9c2b71ff13e543305e02a/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS8wMV9NZW51ZS1QaWNzL2NoZW1pa2FsaWVuc2NodXR6YW56dWcuanBnPzE3MjI2MDYzMTc',
      },
      {
        name: 'uvex suXXeed industry',
        url: 'https://www.uvex-safety.com/en/uvex-suxxeed-industry-workwear/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/qqOyHGIiq-6LbRBwY5kJqZLlgbggx02-rLrdQbhhb5c/w:350/h:350/fn:Y3NtX3N1eHhlZWQtaW5kdXN0cnlfZTEwMGIwNWQyNQ:t/cb:dd4f021fb942dcee3b37dfa91295dc75f91dbbe8/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS8wMV9NZW51ZS1QaWNzL3N1eHhlZWQtaW5kdXN0cnkuanBnPzE3MjI2MDY5NjQ',
      },
      {
        name: 'uvex corporate 26',
        url: 'https://www.uvex-safety.com/en/products/protective-clothing-and-workwear/?properties=6a767e456bb24a74bfb5d57891175e8a',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/AejunZMH4-G_VdI6rYHIrkgGn_MouYxjFaDSuwqGuZk/w:350/h:350/fn:Y3NtX3V2ZXgtY29ycG9yYXRlLTI2LXdvcmt3ZWFyLW1lbnVfMGI4NGFhYzZhMA:t/cb:1fb838c0837bbc00b6281b8638aa25153c8e8eca/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS9Qcm9kdWN0cy9jb3Jwb3JhdGUtMjYvdXZleC1jb3Jwb3JhdGUtMjYtd29ya3dlYXItbWVudS5qcGc_MTc2MjI1ODUyOA',
      },
    ],
  },
  {
    name: 'Individual PPE',
    slug: 'individual-ppe',
    iconName: 'wrench',
    descriptionRu: 'Индивидуально адаптированные СИЗ: очки с диоптриями, отопласты, ортопедическая обувь',
    subcategories: [
      {
        name: 'Prescription safety spectacles',
        url: 'https://www.uvex-safety.com/en/individual-ppe/prescription-safety-spectacles/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/cD-HpwjobQE3q3iOs653Xih1IIalS86UOn2JrRGySoo/w:350/h:350/fn:Y3NtX3NjaHV0emJyaWxsZS1taXQtc2Voc3RhZXJrZV8zOWIwMGI3Yzdl:t/cb:fff4eb02a250c71a18381167935d2600cc8d106c/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS8wMV9NZW51ZS1QaWNzL3NjaHV0emJyaWxsZS1taXQtc2Voc3RhZXJrZS5qcGc_MTcyMjU5NTEwOQ',
      },
      {
        name: 'Computer glasses',
        url: 'https://www.uvex-safety.com/en/computer-glasses/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/P3ZGAcGFVfSY8jr_AIGIEWdTwxhuZTR5ZmmFPUXzRF0/w:350/h:350/fn:Y3NtX2JpbGRzY2hpcm1icmlsbGVuLXZvbi11dmV4XzIzZjM1MzZmZTQ:t/cb:ce10ab96b6c5eb7748792355c00a555547627024/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS8wMV9NZW51ZS1QaWNzL2JpbGRzY2hpcm1icmlsbGVuLXZvbi11dmV4LmpwZz8xNzIyNTk1MjQw',
      },
      {
        name: 'Hearing protection otoplastics',
        url: 'https://www.uvex-safety.com/en/individual-ppe/hearing-protection-otoplastics/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/tAbzlNpgr_ke8qi0WcPm-WZwm5TX7FoCns1l7Xy2sKo/w:350/h:350/fn:Y3NtX2dlaG9lcnNjaHV0em90b3BsYXN0aWtlbl9mYTcxYzkyNTkx:t/cb:6950a2e7db511b2cffabf81021e3a3b7680b0056/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS8wMV9NZW51ZS1QaWNzL2dlaG9lcnNjaHV0em90b3BsYXN0aWtlbi5qcGc_MTcyMjU5NTM2MA',
      },
      {
        name: 'Orthopaedically adapted safety shoes',
        url: 'https://www.uvex-safety.com/en/individual-ppe/medicare/',
        thumbnailUrl:
          'https://d3rbxgeqn1ye9j.cloudfront.net/images/xpjq_U5lZ3kK1n4qZbTlZcywMsfReKeSzT8QIZOtp6A/w:350/h:350/fn:Y3NtX3V2ZXgtbWVkaWFjcmUtRWlubGFnZW5fOGYxNmM3MjQ4Nw:t/cb:c6ed45b97f8a48f7ecc1c5b56579a06dca843b2a/el:1/fq:jpeg:85:avif:70:webp:80/aHR0cHM6Ly9kM3JieGdlcW4xeWU5ai5jbG91ZGZyb250Lm5ldC9maWxlYWRtaW4vd3d3LnV2ZXgtc2FmZXR5LmNvbS8wMV9NZW51ZS1QaWNzL3V2ZXgtbWVkaWFjcmUtRWlubGFnZW4uanBnPzE3MjI1ODgzNzg',
      },
    ],
  },
];

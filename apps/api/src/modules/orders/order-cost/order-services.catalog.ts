import { AppException, ErrorCode } from '../../../common/errors/app-exception';
import { BaseOrderCost, OrderCost } from './order-cost.component';
import {
  CargoInsuranceDecorator,
  CertificatePackageDecorator,
  ExpressDeliveryDecorator,
  InstallationDecorator,
  OrderCostDecoratorClass,
} from './order-cost.decorators';

export interface OrderServiceDefinition {
  code: string;
  name: string;
  description: string;
  priceHint: string;
  decorator: OrderCostDecoratorClass;
}

/**
 * Optional services a customer can tick at checkout. The array order is the
 * wrapping order: flat fees first, percentage-based services last, so the
 * percentage also covers the flat services (deterministic totals).
 */
export const ORDER_SERVICES: OrderServiceDefinition[] = [
  {
    code: 'express_delivery',
    name: 'Экспресс-доставка',
    description: 'Доставка по городу в течение 24 часов',
    priceHint: `${ExpressDeliveryDecorator.FEE} ₸`,
    decorator: ExpressDeliveryDecorator,
  },
  {
    code: 'certificates',
    name: 'Пакет документов',
    description: 'Сертификаты соответствия и паспорта изделий',
    priceHint: `${CertificatePackageDecorator.FEE} ₸`,
    decorator: CertificatePackageDecorator,
  },
  {
    code: 'cargo_insurance',
    name: 'Страхование груза',
    description: 'Компенсация при повреждении или утере в пути',
    priceHint: '1,5% от суммы, мин. 1 000 ₸',
    decorator: CargoInsuranceDecorator,
  },
  {
    code: 'installation',
    name: 'Монтаж и пусконаладка',
    description: 'Выезд инженера на объект',
    priceHint: '5% от суммы, мин. 15 000 ₸',
    decorator: InstallationDecorator,
  },
];

export function listOrderServices() {
  return ORDER_SERVICES.map(({ code, name, description, priceHint }) => ({ code, name, description, priceHint }));
}

/**
 * Builds the decorated cost object: BaseOrderCost wrapped by one decorator
 * per selected service. Unknown codes are rejected; duplicates are ignored.
 */
export function buildOrderCost(
  subtotal: number,
  discount: number,
  serviceCodes: string[] = [],
  discountLabel?: string,
): OrderCost {
  const requested = new Set(serviceCodes);
  const unknown = [...requested].filter(c => !ORDER_SERVICES.some(s => s.code === c));
  if (unknown.length) {
    throw new AppException(ErrorCode.ORDER_SERVICE_UNKNOWN, `Неизвестные услуги: ${unknown.join(', ')}`);
  }

  let cost: OrderCost = new BaseOrderCost(subtotal, discount, discountLabel);
  for (const service of ORDER_SERVICES) {
    if (requested.has(service.code)) cost = new service.decorator(cost);
  }
  return cost;
}

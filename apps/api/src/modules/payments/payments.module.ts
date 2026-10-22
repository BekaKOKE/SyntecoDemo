import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PAYMENT_GATEWAYS } from './payment-gateway.interface';
import { KaspiPayAdapter } from './adapters/kaspi-pay.adapter';
import { HalykCardAdapter } from './adapters/halyk-card.adapter';
import { BankInvoiceGateway, CashOnDeliveryGateway } from './gateways/offline.gateways';

@Module({
  controllers: [PaymentsController],
  providers: [
    // Adapters are constructed with their default vendor client (no DI args).
    { provide: KaspiPayAdapter, useFactory: () => new KaspiPayAdapter() },
    { provide: HalykCardAdapter, useFactory: () => new HalykCardAdapter() },
    BankInvoiceGateway,
    CashOnDeliveryGateway,
    {
      provide: PAYMENT_GATEWAYS,
      useFactory: (...gateways) => gateways,
      inject: [KaspiPayAdapter, HalykCardAdapter, BankInvoiceGateway, CashOnDeliveryGateway],
    },
    PaymentsService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}

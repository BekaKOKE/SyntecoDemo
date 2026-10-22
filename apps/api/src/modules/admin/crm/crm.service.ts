import { Injectable, Optional } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EventsGateway } from '../../../common/events/events.gateway';

const STAGE_LABELS: Record<string, string> = {
  inquiry: 'Заявки',
  qualification: 'Квалификация',
  quote_sent: 'КП отправлено',
  approval: 'Согласование',
  won: 'Выиграно',
  lost: 'Проиграно',
};

const STAGE_ORDER = ['inquiry', 'qualification', 'quote_sent', 'approval', 'won', 'lost'];

export interface DealDTO {
  id: string;
  dealNumber: string;
  title: string;
  companyName: string;
  contactName: string | null;
  contactPhone: string | null;
  value: number;
  stage: string;
  priority: string;
  daysInStage: number;
  ownerId: string | null;
  ownerName: string | null;
  hot: boolean;
  notes: string | null;
  stageEnteredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineColumn {
  id: string;
  label: string;
  wip: number;
  sum: number;
  deals: DealDTO[];
}

@Injectable()
export class CrmService {
  constructor(
    private readonly prisma: PrismaClient,
    @Optional() private readonly events?: EventsGateway,
  ) {}

  // ── Get full pipeline ──────────────────────────────────
  async getPipeline(): Promise<PipelineColumn[]> {
    const deals = await this.prisma.deal.findMany({
      where: { stage: { notIn: ['lost'] } },
      orderBy: { createdAt: 'desc' },
    });

    // Update days in stage
    const now = new Date();
    const updated = deals.map((d) => ({
      ...d,
      daysInStage: Math.floor((now.getTime() - new Date(d.stageEnteredAt).getTime()) / 86_400_000),
    }));

    return STAGE_ORDER
      .filter((s) => s !== 'lost')
      .map((stage) => {
        const stageDeals = updated.filter((d) => d.stage === stage);
        return {
          id: stage,
          label: STAGE_LABELS[stage] ?? stage,
          wip: stageDeals.length,
          sum: stageDeals.reduce((s, d) => s + Number(d.value), 0),
          deals: stageDeals.map((d) => this.mapDeal(d)),
        };
      });
  }

  // ── Create deal ─────────────────────────────────────────
  async create(dto: any): Promise<DealDTO> {
    const dealNumber = await this.nextDealNumber();
    const deal = await this.prisma.deal.create({
      data: {
        dealNumber,
        title: dto.title,
        companyName: dto.companyName,
        contactName: dto.contactName ?? null,
        contactPhone: dto.contactPhone ?? null,
        value: dto.value ?? 0,
        stage: dto.stage ?? 'inquiry',
        priority: dto.priority ?? 'normal',
        ownerId: dto.ownerId ?? null,
        ownerName: dto.ownerName ?? null,
        hot: dto.hot ?? false,
        notes: dto.notes ?? null,
      },
    });
    const result = this.mapDeal(deal);
    this.events?.emitDealCreated({ dealId: result.id, dealNumber: result.dealNumber, stage: result.stage });
    return result;
  }

  // ── Update deal (including stage change = drag-drop) ────
  async update(id: string, dto: any): Promise<DealDTO> {
    const existing = await this.prisma.deal.findUniqueOrThrow({ where: { id } });

    const data: any = { ...dto };
    delete data.id;
    delete data.dealNumber;

    // If stage changed, reset the days counter
    if (dto.stage && dto.stage !== existing.stage) {
      data.stageEnteredAt = new Date();
      data.daysInStage = 0;
    }

    const deal = await this.prisma.deal.update({ where: { id }, data });
    const result = this.mapDeal(deal);

    // Emit stage change if applicable
    if (dto.stage && dto.stage !== existing.stage) {
      this.events?.emitDealStageChanged({
        dealId: result.id, dealNumber: result.dealNumber,
        fromStage: existing.stage, toStage: dto.stage,
      });
    } else {
      this.events?.emitDealUpdated({ dealId: result.id, dealNumber: result.dealNumber });
    }
    return result;
  }

  // ── Delete deal ─────────────────────────────────────────
  async remove(id: string): Promise<void> {
    const deal = await this.prisma.deal.findUniqueOrThrow({ where: { id }, select: { dealNumber: true } });
    await this.prisma.deal.delete({ where: { id } });
    this.events?.emitDealDeleted({ dealId: id, dealNumber: deal.dealNumber });
  }

  // ── Helper: next deal number ────────────────────────────
  private async nextDealNumber(): Promise<string> {
    const last = await this.prisma.deal.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { dealNumber: true },
    });
    if (!last?.dealNumber) return 'DL-26-00001';
    const seq = parseInt(last.dealNumber.split('-').pop()!, 10) + 1;
    return `DL-26-${String(seq).padStart(5, '0')}`;
  }

  // ── Helper: map DB row → DTO ────────────────────────────
  private mapDeal(d: any): DealDTO {
    return {
      id: d.id,
      dealNumber: d.dealNumber,
      title: d.title,
      companyName: d.companyName,
      contactName: d.contactName ?? null,
      contactPhone: d.contactPhone ?? null,
      value: Number(d.value),
      stage: d.stage,
      priority: d.priority,
      daysInStage: d.daysInStage ?? Math.floor(
        (Date.now() - new Date(d.stageEnteredAt ?? d.createdAt).getTime()) / 86_400_000
      ),
      ownerId: d.ownerId ?? null,
      ownerName: d.ownerName ?? null,
      hot: d.hot ?? false,
      notes: d.notes ?? null,
      stageEnteredAt: d.stageEnteredAt?.toISOString?.() ?? d.stageEnteredAt ?? d.createdAt,
      createdAt: d.createdAt?.toISOString?.() ?? d.createdAt,
      updatedAt: d.updatedAt?.toISOString?.() ?? d.updatedAt,
    };
  }
}

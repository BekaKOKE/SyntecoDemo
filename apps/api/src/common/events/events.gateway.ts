import {
  WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PinoLoggerService } from '../logging/logger.service';

/**
 * Synteco Events Gateway — real-time push for order status, CRM kanban, and notifications.
 *
 * Rooms:
 *   - order:{orderId} — clients tracking a specific order
 *   - crm — admin users viewing the CRM pipeline
 *   - admin — all admin users (notifications, stats updates)
 *
 * Events emitted (server → client):
 *   - order.status.changed — { orderId, orderNumber, oldStatus, newStatus }
 *   - deal.created / deal.updated / deal.deleted
 *   - deal.stage.changed — { dealId, dealNumber, fromStage, toStage }
 */
@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/events',
  pingInterval: 25000,
  pingTimeout: 10000,
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly clientMap = new Map<string, Set<string>>(); // userId → socketIds

  constructor(private readonly logger: PinoLoggerService) {}

  handleConnection(client: Socket) {
    const userId = (client.handshake.query.userId as string) || 'anonymous';
    if (!this.clientMap.has(userId)) this.clientMap.set(userId, new Set());
    this.clientMap.get(userId)!.add(client.id);

    // Personal room for user notifications (see RealtimeNotifier)
    if (userId !== 'anonymous') client.join(`user:${userId}`);

    // Auto-join admin room if the client identifies as admin
    if (client.handshake.query.role === 'admin' || client.handshake.query.role === 'super_admin') {
      client.join('admin');
      client.join('crm');
    }

    this.logger.raw().info({
      socketId: client.id, userId, event: 'client.connected',
      totalClients: this.server?.engine?.clientsCount ?? 0,
    });
  }

  handleDisconnect(client: Socket) {
    const userId = (client.handshake.query.userId as string) || 'anonymous';
    this.clientMap.get(userId)?.delete(client.id);

    this.logger.raw().debug({
      socketId: client.id, userId, event: 'client.disconnected',
    });
  }

  /** Allow a client to subscribe to a specific order */
  @SubscribeMessage('subscribe:order')
  handleSubscribeOrder(client: Socket, orderId: string) {
    client.join(`order:${orderId}`);
    return { subscribed: true, room: `order:${orderId}` };
  }

  /** Allow a client to unsubscribe from an order */
  @SubscribeMessage('unsubscribe:order')
  handleUnsubscribeOrder(client: Socket, orderId: string) {
    client.leave(`order:${orderId}`);
    return { unsubscribed: true, room: `order:${orderId}` };
  }

  // ── Helper methods called by services ────────────────

  emitOrderStatusChanged(data: {
    orderId: string; orderNumber: string; oldStatus: string; newStatus: string;
  }) {
    this.server.to(`order:${data.orderId}`).to('admin').emit('order.status.changed', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  emitDealStageChanged(data: {
    dealId: string; dealNumber: string; fromStage: string; toStage: string;
  }) {
    this.server.to('crm').emit('deal.stage.changed', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  emitDealUpdated(data: { dealId: string; dealNumber: string }) {
    this.server.to('crm').emit('deal.updated', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  emitDealCreated(data: { dealId: string; dealNumber: string; stage: string }) {
    this.server.to('crm').emit('deal.created', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  emitDealDeleted(data: { dealId: string; dealNumber: string }) {
    this.server.to('crm').emit('deal.deleted', data);
  }
}

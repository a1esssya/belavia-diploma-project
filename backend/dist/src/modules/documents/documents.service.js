"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const history_service_1 = require("../history/history.service");
const orders_service_1 = require("../orders/orders.service");
let DocumentsService = class DocumentsService {
    constructor(prisma, ordersService, historyService) {
        this.prisma = prisma;
        this.ordersService = ordersService;
        this.historyService = historyService;
    }
    async listForUserOrder(userId, orderId) {
        const order = await this.ordersService.assertOrderAccess(userId, orderId);
        const documents = await this.prisma.orderDocument.findMany({
            where: { orderId: order.id },
            orderBy: { createdAt: 'asc' },
        });
        return documents.map((document) => ({
            id: document.id,
            type: document.type,
            title: document.title,
            fileName: document.fileName,
            url: document.url,
            deliveryEmail: document.deliveryEmail,
            lastSentAt: document.lastSentAt,
        }));
    }
    async resendForUserOrder(userId, orderId) {
        const order = await this.ordersService.assertOrderAccess(userId, orderId);
        const now = new Date();
        await this.prisma.orderDocument.updateMany({
            where: { orderId: order.id },
            data: { lastSentAt: now },
        });
        await this.historyService.addEvent(order.id, 'documents.resent', 'Документы повторно отправлены на email', { deliveryEmail: 'demo@belavia.by' });
        const documents = await this.prisma.orderDocument.findMany({
            where: { orderId: order.id },
            orderBy: { createdAt: 'asc' },
        });
        return {
            success: true,
            deliveryEmail: 'demo@belavia.by',
            documents: documents.map((document) => ({
                id: document.id,
                type: document.type,
                title: document.title,
                lastSentAt: document.lastSentAt,
            })),
        };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_service_1.OrdersService,
        history_service_1.HistoryService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map
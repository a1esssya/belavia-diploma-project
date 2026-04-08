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
exports.HistoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let HistoryService = class HistoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listForOrder(orderId) {
        const order = await this.prisma.orderShowcase.findUnique({
            where: { id: orderId },
            select: { id: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Заказ не найден');
        }
        const events = await this.prisma.orderEvent.findMany({
            where: { orderId },
            orderBy: { createdAt: 'desc' },
        });
        return events.map((event) => ({
            id: event.id,
            type: event.type,
            message: event.message,
            payload: event.payload,
            createdAt: event.createdAt,
        }));
    }
    async addEvent(orderId, type, message, payload) {
        return this.prisma.orderEvent.create({
            data: {
                orderId,
                type,
                message,
                ...(payload ? { payload } : {}),
            },
        });
    }
};
exports.HistoryService = HistoryService;
exports.HistoryService = HistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HistoryService);
//# sourceMappingURL=history.service.js.map
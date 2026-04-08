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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const current_user_decorator_1 = require("../../common/auth/current-user.decorator");
const session_auth_guard_1 = require("../../common/auth/session-auth.guard");
const exchange_service_1 = require("./exchange.service");
class ExchangeConfirmDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExchangeConfirmDto.prototype, "quoteId", void 0);
let ExchangeController = class ExchangeController {
    constructor(exchangeService) {
        this.exchangeService = exchangeService;
    }
    createQuote(user, orderId) {
        return this.exchangeService.createQuote(user.userId, orderId);
    }
    confirmQuote(user, orderId, body, idempotencyKey) {
        return this.exchangeService.confirmQuote(user.userId, orderId, body.quoteId, idempotencyKey);
    }
    getOperation(user, operationId) {
        return this.exchangeService.getOperationView(operationId, user.userId);
    }
};
exports.ExchangeController = ExchangeController;
__decorate([
    (0, common_1.Post)('orders/:orderId/exchange/quote'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ExchangeController.prototype, "createQuote", null);
__decorate([
    (0, common_1.Post)('orders/:orderId/exchange/confirm'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Headers)('idempotency-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, ExchangeConfirmDto, String]),
    __metadata("design:returntype", void 0)
], ExchangeController.prototype, "confirmQuote", null);
__decorate([
    (0, common_1.Get)('exchange-operations/:operationId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('operationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ExchangeController.prototype, "getOperation", null);
exports.ExchangeController = ExchangeController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __metadata("design:paramtypes", [exchange_service_1.ExchangeService])
], ExchangeController);
//# sourceMappingURL=exchange.controller.js.map
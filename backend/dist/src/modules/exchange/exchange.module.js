"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeModule = void 0;
const common_1 = require("@nestjs/common");
const history_module_1 = require("../history/history.module");
const orders_module_1 = require("../orders/orders.module");
const exchange_controller_1 = require("./exchange.controller");
const exchange_service_1 = require("./exchange.service");
let ExchangeModule = class ExchangeModule {
};
exports.ExchangeModule = ExchangeModule;
exports.ExchangeModule = ExchangeModule = __decorate([
    (0, common_1.Module)({
        imports: [orders_module_1.OrdersModule, history_module_1.HistoryModule],
        controllers: [exchange_controller_1.ExchangeController],
        providers: [exchange_service_1.ExchangeService],
    })
], ExchangeModule);
//# sourceMappingURL=exchange.module.js.map
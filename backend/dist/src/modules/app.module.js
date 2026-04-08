"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_module_1 = require("../common/database.module");
const app_controller_1 = require("./app.controller");
const auth_module_1 = require("./auth/auth.module");
const booking_lookup_module_1 = require("./booking-lookup/booking-lookup.module");
const documents_module_1 = require("./documents/documents.module");
const exchange_module_1 = require("./exchange/exchange.module");
const history_module_1 = require("./history/history.module");
const integrations_module_1 = require("./integrations/integrations.module");
const orders_module_1 = require("./orders/orders.module");
const refund_module_1 = require("./refund/refund.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [app_controller_1.AppController],
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            orders_module_1.OrdersModule,
            documents_module_1.DocumentsModule,
            history_module_1.HistoryModule,
            exchange_module_1.ExchangeModule,
            refund_module_1.RefundModule,
            booking_lookup_module_1.BookingLookupModule,
            integrations_module_1.IntegrationsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
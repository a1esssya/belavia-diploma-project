"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingLookupModule = void 0;
const common_1 = require("@nestjs/common");
const orders_module_1 = require("../orders/orders.module");
const booking_lookup_controller_1 = require("./booking-lookup.controller");
const booking_lookup_service_1 = require("./booking-lookup.service");
let BookingLookupModule = class BookingLookupModule {
};
exports.BookingLookupModule = BookingLookupModule;
exports.BookingLookupModule = BookingLookupModule = __decorate([
    (0, common_1.Module)({
        imports: [orders_module_1.OrdersModule],
        controllers: [booking_lookup_controller_1.BookingLookupController],
        providers: [booking_lookup_service_1.BookingLookupService],
    })
], BookingLookupModule);
//# sourceMappingURL=booking-lookup.module.js.map
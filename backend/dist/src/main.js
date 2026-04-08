"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./modules/app.module");
async function bootstrap() {
    var _a;
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('v1', {
        exclude: [{ path: 'health', method: common_1.RequestMethod.GET }],
    });
    app.enableCors({ origin: true, credentials: true });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    await app.listen((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000);
}
void bootstrap();
//# sourceMappingURL=main.js.map
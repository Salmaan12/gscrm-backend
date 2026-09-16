import { ApplicationLogs } from "./application-logs.entity";
import { CurrentRateProductBrandSku } from "./current-rate-product-brand-sku.entity";
import { CurrentRate } from "./current-rate.entity";
import { Customer } from "./customer.entity";
import { AppModuleEntity } from "./module.entity";
import { ProductBrandSkuMaking } from "./product-brand-sku-making.entity";
import { ProductBrandSku } from "./product-brand-sku.entity";
import { ProductBrand } from "./product-brand.entity";
import { Product } from "./product.entity";
import { Ratework } from "./ratework.entity";
import { UserModule } from "./user-module.entity";
import { User } from "./user.entity";

const entities = [
    User,
    UserModule,
    Ratework,
    Product,
    ProductBrand,
    ProductBrandSku,
    ProductBrandSkuMaking,
    AppModuleEntity,
    Customer,
    CurrentRate,
    CurrentRateProductBrandSku,
    ApplicationLogs
]

export default entities;
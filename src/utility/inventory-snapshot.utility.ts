import { Repository } from 'typeorm';
import { InventorySnapshot } from 'src/entities/inventorysnapshot.entity';

export interface InventorySnapshotAdjustment {
    productId: number;
    productBrandId?: number;
    productBrandSkuId?: number;
    qty?: number;
    weight?: number;
    amount?: number;
}

export async function adjustInventorySnapshot(
    snapshotRepo: Repository<InventorySnapshot>,
    adjustment: InventorySnapshotAdjustment,
): Promise<InventorySnapshot> {

    const {
        productId,
        productBrandId,
        productBrandSkuId,
        qty,
        weight,
        amount,
    } = adjustment;

    const where: any = {
        productId: productId,
    };
    if (productBrandId != null) {
        where.productBrandId = productBrandId;
    }
    if (productBrandSkuId != null) {
        where.productBrandSkuId = productBrandSkuId;
    }

    // Find the snapshot using all three identifiers
    let snapshot = await snapshotRepo.findOne({
        where: where,
    });

    if (!snapshot) {
        // Create a new snapshot when no matching record exists
        const payload: InventorySnapshot | any = {
            productId: productId,
            productBrandId: productBrandId,
            productBrandSkuId: productBrandSkuId,
            weight: weight,
            qty: qty,
            amount: amount,
        };
        snapshot = snapshotRepo.create(payload as InventorySnapshot);
    } else {
        // Adjust the existing snapshot balances
        if (qty !== undefined) {
            snapshot.qty =
                String(Number(snapshot.qty ?? 0) + Number(qty ?? 0));
        }

        if (weight !== undefined) {
            snapshot.weight =
                String(Number(snapshot.weight ?? 0) + Number(weight ?? 0));
        }

        if (amount !== undefined) {
            snapshot.amount =
                String(Number(snapshot.amount ?? 0) + Number(amount ?? 0));
        }
    }

    return await snapshotRepo.save(snapshot);
}
import { GroupedSale } from "./grouped_sale";

export class Sale {
    current: GroupedSale;
    lastPeriod: GroupedSale;

    constructor(current: GroupedSale, lastPeriod: GroupedSale) {
        this.current = current;
        this.lastPeriod = lastPeriod;
    }
}
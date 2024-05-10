export class GroupedSale {
    quantityOfOrders: number;
    itemsSold: number;
    ordersValue: number;

    constructor (quantityOfOrders: number, itemsSold: number, ordersValue: number) {
        this.quantityOfOrders = quantityOfOrders;
        this.itemsSold = itemsSold;
        this.ordersValue = ordersValue;
    }
}
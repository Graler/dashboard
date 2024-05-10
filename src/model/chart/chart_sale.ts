export class ChartSale {
    year: number;
    month: number;
    total: number;
    pairs: number;

    constructor(year: number, month: number, total: number, pairs: number) {
        this.year = year;
        this.month = month;
        this.total = total;
        this.pairs = pairs;
    }
}

export type ItemRow = {
    item_code: string;
    item_name: string;
    warehouse: string;
    qty: number;
    valuation_rate: number;
    quantity_difference: number;
    amount_difference: number;
};

export const dummyData: ItemRow[] = [
    {
        item_code: "ITEM-0001",
        item_name: "Laptop Dell i5",
        warehouse: "Main Warehouse",
        qty: 10,
        valuation_rate: 125000,
        quantity_difference: 2,
        amount_difference: 250000,
    },
    {
        item_code: "ITEM-0002",
        item_name: "Wireless Mouse",
        warehouse: "Colombo Store",
        qty: 50,
        valuation_rate: 4500,
        quantity_difference: -5,
        amount_difference: -22500,
    },
    {
        item_code: "ITEM-0003",
        item_name: "Mechanical Keyboard",
        warehouse: "Kandy Warehouse",
        qty: 20,
        valuation_rate: 18500,
        quantity_difference: 3,
        amount_difference: 55500,
    },
    {
        item_code: "ITEM-0004",
        item_name: '24" Monitor',
        warehouse: "Main Warehouse",
        qty: 15,
        valuation_rate: 42000,
        quantity_difference: 0,
        amount_difference: 0,
    },
    {
        item_code: "ITEM-0005",
        item_name: "USB-C Docking Station",
        warehouse: "Galle Branch",
        qty: 8,
        valuation_rate: 27500,
        quantity_difference: -1,
        amount_difference: -27500,
    },
];
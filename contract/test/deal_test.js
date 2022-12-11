var Deal  = artifacts.require("Deal");

contract("Deal", (accounts) => {
    const SELLER = accounts[0];
    const BUYER = accounts[1];
    const COURIER = accounts[2];
    const PRODUCT = "product";
    const PRODUCT_QTY = 1;
    const PRICE = 2;
    const DELIVERY_PRICE = 1;
    const ORDER_NO = 1;

    it("Seller should own the contract", async () => {
        var deal = await Deal.new(BUYER, {from: SELLER});
        var owner = await deal.sellerAddress();

        return assert.equal(SELLER, owner, "Seller does not own the contract");
    });

    it("Buyer address is set correctly", async () => {
        var deal = await Deal.new(BUYER, {from: SELLER});
        var buyer = await deal.buyerAddress();

        return assert.equal(BUYER, buyer, "Buyer is not set correctly");
    });

    it("Buyer can place order", async () => {
        var deal = await Deal.new(BUYER, {from: SELLER});
        var response = await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: BUYER});
        const EVENT = response.logs[0].event;

        return assert.equal(EVENT, 'OrderPlaced', 'Buyer cannot place order');
    });

    it("Only buyer can place order", async () => {
        var deal = await Deal.new(BUYER, {from: SELLER});

        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i] === BUYER) {
                continue;
            }

            try {
                await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: accounts[i]});
            } catch (e) {
                if (e.message === 'Returned error: VM Exception while processing transaction: revert') {
                    continue;
                }
            }
            return assert.fail('Not only buyer can place order')
        }
    });

    it("Seller can set order price", async () => {
        const deal = await Deal.new(BUYER, {from: SELLER});
        await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: BUYER});

        const response = await deal.setOrderPrice(PRICE, ORDER_NO, {from: SELLER});
        const event = response.logs[0].event;

        return assert.equal(event, 'OrderPriceSet', 'Seller cannot set order price');
    });

    it("Only seller can set order price", async () => {
        var deal = await Deal.new(BUYER, {from: SELLER});
        await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: BUYER});

        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i] === SELLER) {
                continue;
            }

            try {
                await deal.setOrderPrice(PRICE, ORDER_NO, {from: accounts[i]});
            } catch (e) {
                if (e.message === 'Returned error: VM Exception while processing transaction: revert') {
                    continue;
                }
            }
            return assert.fail('Not only seller can place order')
        }
    });
    
    it("Correct order price is set", async () => {
        const deal = await Deal.new(BUYER, {from: SELLER});
        await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: BUYER});
        await deal.setOrderPrice(PRICE, ORDER_NO, {from: SELLER});

        const order = await deal.getOrder(ORDER_NO)
        const price = order.price.toNumber();

        return assert.equal(price, PRICE, 'Order price is not set correctly');
    });

    it("Seller can set delivery price", async () => {
        const deal = await Deal.new(BUYER, {from: SELLER});
        await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: BUYER});

        const response = await deal.setDeliveryPrice(DELIVERY_PRICE, ORDER_NO, {from: SELLER});
        const event = response.logs[0].event;

        return assert.equal(event, 'DeliveryPriceSet', 'Seller cannot set delivery price');
    });

    it("Only seller can set delivery price", async () => {
        var deal = await Deal.new(BUYER, {from: SELLER});
        await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: BUYER});

        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i] === SELLER) {
                continue;
            }

            try {
                await deal.setDeliveryPrice(DELIVERY_PRICE, ORDER_NO, {from: accounts[i]});
            } catch (e) {
                if (e.message === 'Returned error: VM Exception while processing transaction: revert') {
                    continue;
                }
            }
            return assert.fail('Not only seller can place order')
        }
    });
    
    it("Correct delivery price is set", async () => {
        const deal = await Deal.new(BUYER, {from: SELLER});
        await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: BUYER});
        await deal.setDeliveryPrice(DELIVERY_PRICE, ORDER_NO, {from: SELLER});

        const order = await deal.getOrder(ORDER_NO)
        const price = order.deliveryPrice.toNumber();

        return assert.equal(price, DELIVERY_PRICE, 'Delivery price is not set correctly');
    });

    it("Cannot change order price", async () => {
        const deal = await Deal.new(BUYER, {from: SELLER});
        await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: BUYER});
        await deal.setOrderPrice(PRICE, ORDER_NO, {from: SELLER});

        try {
            await deal.setOrderPrice(PRICE, ORDER_NO, {from: SELLER});
        } catch (e) {
            if (e.message === 'Returned error: VM Exception while processing transaction: revert') {
                return;
            }
        }
        return assert.fail('Seller can change order price')
    });

    it("Cannot change delivery price", async () => {
        const deal = await Deal.new(BUYER, {from: SELLER});
        await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: BUYER});
        await deal.setDeliveryPrice(DELIVERY_PRICE, ORDER_NO, {from: SELLER});

        try {
            await deal.setDeliveryPrice(DELIVERY_PRICE, ORDER_NO, {from: SELLER});
        } catch (e) {
            if (e.message === 'Returned error: VM Exception while processing transaction: revert') {
                return;
            }
        }
        return assert.fail('Seller can change delivery price')
    });

    it("Buyer can pay for order", async () => {
        const deal = await Deal.new(BUYER, {from: SELLER});
        await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: BUYER});
        await deal.setOrderPrice(PRICE, ORDER_NO, {from: SELLER});
        await deal.setDeliveryPrice(DELIVERY_PRICE, ORDER_NO, {from: SELLER});

        const response = await deal.pay(ORDER_NO, {from: BUYER, value: (PRICE + DELIVERY_PRICE)})
        const event = response.logs[0].event;

        return assert.equal(event, 'OrderPaid', 'Buyer cannot pay for order');
    });

    it("Payment value cannot be lower than order price + delivery price", async () => {
        const deal = await Deal.new(BUYER, {from: SELLER});
        await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: BUYER});
        await deal.setOrderPrice(PRICE, ORDER_NO, {from: SELLER});
        await deal.setDeliveryPrice(DELIVERY_PRICE, ORDER_NO, {from: SELLER});

        try {
            await deal.pay(ORDER_NO, {from: BUYER, value: (PRICE + DELIVERY_PRICE - 1)});
        } catch (e) {
            if (e.message === 'Returned error: VM Exception while processing transaction: revert') {
                return;
            }
        }
        return assert.fail('Payment value can be lower that order price + delivery price')
    });

    it("Payment value cannot be higher that order price + delivery price", async () => {
        const deal = await Deal.new(BUYER, {from: SELLER});
        await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: BUYER});
        await deal.setOrderPrice(PRICE, ORDER_NO, {from: SELLER});
        await deal.setDeliveryPrice(DELIVERY_PRICE, ORDER_NO, {from: SELLER});

        try {
            await deal.pay(ORDER_NO, {from: BUYER, value: (PRICE + DELIVERY_PRICE + 1)});
        } catch (e) {
            if (e.message === 'Returned error: VM Exception while processing transaction: revert') {
                return;
            }
        }
        return assert.fail('Payment value can be higher that order price + delivery price')
    });

    it("Seller can set courier address", async () => {
        const deal = await Deal.new(BUYER, {from: SELLER});
        await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: BUYER});
        await deal.setOrderPrice(PRICE, ORDER_NO, {from: SELLER});
        await deal.setDeliveryPrice(DELIVERY_PRICE, ORDER_NO, {from: SELLER});
        await deal.pay(ORDER_NO, {from: BUYER, value: (PRICE + DELIVERY_PRICE)});

        const response = await deal.startDelivery(COURIER, 1, ORDER_NO, {from: SELLER});
        const event = response.logs[0].event;

        return assert.equal(event, 'DeliveryStarted', 'Seller cannot set courier address');
    });

    it("Courier address is set correctly", async () => {
        const deal = await Deal.new(BUYER, {from: SELLER});
        await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: BUYER});
        await deal.setOrderPrice(PRICE, ORDER_NO, {from: SELLER});
        await deal.setDeliveryPrice(DELIVERY_PRICE, ORDER_NO, {from: SELLER});
        await deal.pay(ORDER_NO, {from: BUYER, value: (PRICE + DELIVERY_PRICE)});
        await deal.startDelivery(COURIER, 1, ORDER_NO, {from: SELLER});

        try {
            await deal.getInvoice(ORDER_NO, {from: COURIER});
        } catch (e) {
            if (e.message === 'Returned error: VM Exception while processing transaction: revert') {
                return assert.fail('Courier address is not set correctly')
            }
        }
        return;
    });

    it("Courier can confirm delivery", async () => {
        const deal = await Deal.new(BUYER, {from: SELLER});
        await deal.placeOrder(PRODUCT, PRODUCT_QTY, {from: BUYER});
        await deal.setOrderPrice(PRICE, ORDER_NO, {from: SELLER});
        await deal.setDeliveryPrice(DELIVERY_PRICE, ORDER_NO, {from: SELLER});
        await deal.pay(ORDER_NO, {from: BUYER, value: (PRICE + DELIVERY_PRICE)});
        await deal.startDelivery(COURIER, 1, ORDER_NO, {from: SELLER});

        const response = await deal.delivered(ORDER_NO, {from: COURIER});
        const event = response.logs[0].event;

        return assert.equal(event, 'OrderDelivered', 'Courier cannot confirm delivery');
    });
});
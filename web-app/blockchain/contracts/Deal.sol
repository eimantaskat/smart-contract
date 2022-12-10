// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Deal {
    struct Delivery {
        address payable courierAddress;
        uint price;
        uint payment;
        uint plannedDate;
        uint deliveryDate;

        bool initialised;
        bool priceSet;
    }

    struct Order {
        string product;
        uint quantity;
        uint price;
        uint payment;
        Delivery delivery;

        bool initialised;
        bool priceSet;
    }

    address payable public sellerAddress;
    address public buyerAddress;

    // Contract stage
    // Init: contract has been initiasised, waiting for buyer to place an order
    // WaitingForPrice: Waiting for seller to set product and shipment price
    // Payment: Waiting for customer to pay for order
    // Shipping: Order has been paid, waiting for seller to start delkivery
    // Shipped: Waiting for courrier to ship an order
    // Done: smart contract completed
    enum Stage {Init, WaitingForPrice, Payment, Shipping, Shipped, Done}
    Stage stage = Stage.Init;

    Order order;

    // EVENTS
    event OrderPlaced(address buyer, string product, uint quantity);
    event OrderPriceSet(address buyer, uint price);
    event DeliveryPriceSet(address buyer, uint price);
    event OrderPaid(address buyer, uint value, uint now);
    event DeliveryStarted(address buyer, uint delivery_date, address courier);
    event OrderDelivered(address buyer, uint delivey_date, address courier);

    constructor(address buyer) {
        sellerAddress = payable(msg.sender);

        buyerAddress = buyer;
    }

    function placeOrder(string calldata product, uint quantity) public payable {
        require(stage == Stage.Init);
        require(msg.sender == buyerAddress);

        order = Order(product, quantity, 0, 0, 
                                        Delivery(payable(0), 0, 0, 0, 0, false, false),
                                        true, false);

        stage = Stage.WaitingForPrice;
        emit OrderPlaced(buyerAddress, product, quantity);
    }

    function getOrder() view public returns(address buyer, string memory product, uint quantity, uint price, uint payment, uint deliveryPrice) {
        require(order.initialised);

        return(
            buyerAddress,
            order.product,
            order.quantity,
            order.price, 
            order.payment,
            order.delivery.price
        );
    }

    function setOrderPrice(uint price) public payable {
        require(stage == Stage.WaitingForPrice);
        require(sellerAddress == msg.sender);
        require(!order.priceSet);

        order.price = price;
        order.priceSet = true;

        emit OrderPriceSet(buyerAddress, price);

        if (order.priceSet && order.delivery.priceSet) {
            stage = Stage.Payment;
        }
    }

    function setDeliveryPrice(uint price) public payable {
        require(stage == Stage.WaitingForPrice);
        require(sellerAddress == msg.sender);
        require(!order.delivery.priceSet);

        order.delivery.price = price;
        order.delivery.priceSet = true;
        order.delivery.initialised = true;

        emit DeliveryPriceSet(buyerAddress, price);

        if (order.priceSet && order.delivery.priceSet) {
            stage = Stage.Payment;
        }
    }

    function pay() public payable {
        require(stage == Stage.Payment);
        require(buyerAddress == msg.sender);
        require(order.initialised);
        require((order.price + order.delivery.price) == msg.value);

        order.payment = order.price;

        emit OrderPaid(msg.sender, msg.value, block.timestamp);

        stage = Stage.Shipping;
    }

    function startDelivery(address courier, uint plannedDeliveryDate) public payable {
        require(stage == Stage.Shipping);
        require(sellerAddress == msg.sender);

        order.delivery.plannedDate = plannedDeliveryDate;
        order.delivery.courierAddress = payable(courier);

        emit DeliveryStarted(buyerAddress, plannedDeliveryDate, courier);

        stage = Stage.Shipped;
    }

    function getInvoice() view public returns(address buyer, uint deliveryDate, address courier) {
        require(order.delivery.courierAddress == msg.sender);

        return(buyerAddress, order.delivery.plannedDate, order.delivery.courierAddress);
    }

    function delivered() public payable {
        require(stage == Stage.Shipped);
        require(order.delivery.courierAddress == msg.sender);

        order.delivery.deliveryDate = block.timestamp;

        emit OrderDelivered(buyerAddress, block.timestamp, order.delivery.courierAddress);

        sellerAddress.transfer(order.payment);
        order.delivery.courierAddress.transfer(order.delivery.payment);

        stage = Stage.Done;
    }

    function getStage() view public returns(Stage currentStage) {
        require(
            sellerAddress == msg.sender || buyerAddress == msg.sender ||
            order.delivery.courierAddress == msg.sender
        );

        return(stage);
    }
}
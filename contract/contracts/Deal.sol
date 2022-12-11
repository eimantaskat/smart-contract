// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Deal {
    // Order stage
    // Init: Order has been placed, waiting for seller to set product and shipment price
    // Payment: Waiting for customer to pay for order
    // Shipping: Order has been paid, waiting for seller to start delkivery
    // Shipped: Waiting for courrier to ship an order
    // Done: smart contract completed
    enum Stage {Init, Payment, Shipping, Shipped, Done}

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
        Stage stage;

        bool initialised;
        bool priceSet;
    }

    address payable public sellerAddress;
    address public buyerAddress;

    mapping (uint => Order) public orders;
    uint public orderSequence;
    // EVENTS
    event OrderPlaced(address buyer, string product, uint quantity, uint orderNumber);
    event OrderPriceSet(address buyer, uint price, uint orderNumber);
    event DeliveryPriceSet(address buyer, uint price, uint orderNumber);
    event OrderPaid(address buyer, uint value, uint now, uint orderNumber);
    event DeliveryStarted(address buyer, uint delivery_date, address courier, uint orderNumber);
    event OrderDelivered(address buyer, uint delivey_date, address courier, uint orderNumber);

    constructor(address buyer) {
        sellerAddress = payable(msg.sender);

        buyerAddress = buyer;
    }

    function placeOrder(string calldata product, uint quantity) public payable {
        require(msg.sender == buyerAddress);

        orderSequence++;
        orders[orderSequence] = Order(product, quantity, 0, 0, 
                                        Delivery(payable(0), 0, 0, 0, 0, false, false),
                                        Stage.Init, true, false);

        emit OrderPlaced(buyerAddress, product, quantity, orderSequence);
    }

    function getOrder(uint number) view public returns(address buyer, string memory product, uint quantity, uint price, uint payment, uint deliveryPrice) {
        require(orders[number].initialised);

        return(
            buyerAddress,
            orders[number].product,
            orders[number].quantity,
            orders[number].price, 
            orders[number].payment,
            orders[number].delivery.price
        );
    }

    function setOrderPrice(uint price, uint number) public payable {
        require(orders[number].initialised);
        require(orders[number].stage == Stage.Init);
        require(sellerAddress == msg.sender);
        require(!orders[number].priceSet);

        orders[number].price = price;
        orders[number].priceSet = true;

        emit OrderPriceSet(buyerAddress, price, number);

        if (orders[number].priceSet && orders[number].delivery.priceSet) {
            orders[number].stage = Stage.Payment;
        }
    }

    function setDeliveryPrice(uint price, uint number) public payable {
        require(orders[number].initialised);
        require(orders[number].stage == Stage.Init);
        require(sellerAddress == msg.sender);
        require(!orders[number].delivery.priceSet);

        orders[number].delivery.price = price;
        orders[number].delivery.priceSet = true;
        orders[number].delivery.initialised = true;

        emit DeliveryPriceSet(buyerAddress, price, number);

        if (orders[number].priceSet && orders[number].delivery.priceSet) {
            orders[number].stage = Stage.Payment;
        }
    }

    function pay(uint number) public payable {
        require(orders[number].initialised);
        require(orders[number].stage == Stage.Payment);
        require(buyerAddress == msg.sender);
        require((orders[number].price + orders[number].delivery.price) == msg.value);

        orders[number].payment = orders[number].price;
        orders[number].delivery.payment = orders[number].delivery.price;

        emit OrderPaid(msg.sender, msg.value, block.timestamp, number);

        orders[number].stage = Stage.Shipping;
    }

    function startDelivery(address courier, uint plannedDeliveryDate, uint number) public payable {
        require(orders[number].initialised);
        require(orders[number].stage == Stage.Shipping);
        require(sellerAddress == msg.sender);

        orders[number].delivery.plannedDate = plannedDeliveryDate;
        orders[number].delivery.courierAddress = payable(courier);

        emit DeliveryStarted(buyerAddress, plannedDeliveryDate, courier, number);

        orders[number].stage = Stage.Shipped;
    }

    function getInvoice(uint number) view public returns(address buyer, uint deliveryDate, address courier) {
        require(orders[number].initialised);
        require(orders[number].delivery.courierAddress == msg.sender);

        return(buyerAddress, orders[number].delivery.plannedDate, orders[number].delivery.courierAddress);
    }

    function delivered(uint number) public payable {
        require(orders[number].initialised);
        require(orders[number].stage == Stage.Shipped);
        require(orders[number].delivery.courierAddress == msg.sender);

        orders[number].delivery.deliveryDate = block.timestamp;

        emit OrderDelivered(buyerAddress, block.timestamp, orders[number].delivery.courierAddress, number);

        sellerAddress.transfer(orders[number].payment);
        orders[number].delivery.courierAddress.transfer(orders[number].delivery.payment);

        orders[number].stage = Stage.Done;
    }

    function getStage(uint number) view public returns(Stage currentStage) {
        require(orders[number].initialised);
        require(
            sellerAddress == msg.sender || buyerAddress == msg.sender ||
            orders[number].delivery.courierAddress == msg.sender
        );

        return(orders[number].stage);
    }
}
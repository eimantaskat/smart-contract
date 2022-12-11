// import Web3 from 'web3';

// const provider = new Web3.providers.HttpProvider('http://localhost:7545');
// const web3 = new Web3(provider);

const abi = [{"inputs":[{"internalType":"address","name":"buyer","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"orderNumber","type":"uint256"}],"name":"DeliveryPriceSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"delivery_date","type":"uint256"},{"indexed":false,"internalType":"address","name":"courier","type":"address"},{"indexed":false,"internalType":"uint256","name":"orderNumber","type":"uint256"}],"name":"DeliveryStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"delivey_date","type":"uint256"},{"indexed":false,"internalType":"address","name":"courier","type":"address"},{"indexed":false,"internalType":"uint256","name":"orderNumber","type":"uint256"}],"name":"OrderDelivered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"now","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"orderNumber","type":"uint256"}],"name":"OrderPaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"string","name":"product","type":"string"},{"indexed":false,"internalType":"uint256","name":"quantity","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"orderNumber","type":"uint256"}],"name":"OrderPlaced","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"orderNumber","type":"uint256"}],"name":"OrderPriceSet","type":"event"},{"inputs":[],"name":"buyerAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"number","type":"uint256"}],"name":"delivered","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"number","type":"uint256"}],"name":"getInvoice","outputs":[{"internalType":"address","name":"buyer","type":"address"},{"internalType":"uint256","name":"deliveryDate","type":"uint256"},{"internalType":"address","name":"courier","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"number","type":"uint256"}],"name":"getOrder","outputs":[{"internalType":"address","name":"buyer","type":"address"},{"internalType":"string","name":"product","type":"string"},{"internalType":"uint256","name":"quantity","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"payment","type":"uint256"},{"internalType":"uint256","name":"deliveryPrice","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"number","type":"uint256"}],"name":"getStage","outputs":[{"internalType":"enum Deal.Stage","name":"currentStage","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"orderSequence","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"orders","outputs":[{"internalType":"string","name":"product","type":"string"},{"internalType":"uint256","name":"quantity","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"payment","type":"uint256"},{"components":[{"internalType":"address payable","name":"courierAddress","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"payment","type":"uint256"},{"internalType":"uint256","name":"plannedDate","type":"uint256"},{"internalType":"uint256","name":"deliveryDate","type":"uint256"},{"internalType":"bool","name":"initialised","type":"bool"},{"internalType":"bool","name":"priceSet","type":"bool"}],"internalType":"struct Deal.Delivery","name":"delivery","type":"tuple"},{"internalType":"enum Deal.Stage","name":"stage","type":"uint8"},{"internalType":"bool","name":"initialised","type":"bool"},{"internalType":"bool","name":"priceSet","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"number","type":"uint256"}],"name":"pay","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"string","name":"product","type":"string"},{"internalType":"uint256","name":"quantity","type":"uint256"}],"name":"placeOrder","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"sellerAddress","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"number","type":"uint256"}],"name":"setDeliveryPrice","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"number","type":"uint256"}],"name":"setOrderPrice","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"courier","type":"address"},{"internalType":"uint256","name":"plannedDeliveryDate","type":"uint256"},{"internalType":"uint256","name":"number","type":"uint256"}],"name":"startDelivery","outputs":[],"stateMutability":"payable","type":"function"}]

const getDealContract = (web3) => {
    return new web3.eth.Contract(abi, "0x3D571C7A66cfe545cF4D5F4B90793E46854C1B41");
}

export default getDealContract;
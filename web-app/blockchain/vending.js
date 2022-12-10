import Web3 from 'web3';

const provider = new Web3.providers.HttpProvider('http://localhost:7545');
const web3 = new Web3(provider);

const abi = [{"inputs":[{"internalType":"address","name":"buyer","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"DeliveryPriceSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"delivery_date","type":"uint256"},{"indexed":false,"internalType":"address","name":"courier","type":"address"}],"name":"DeliveryStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"delivey_date","type":"uint256"},{"indexed":false,"internalType":"address","name":"courier","type":"address"}],"name":"OrderDelivered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"now","type":"uint256"}],"name":"OrderPaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"string","name":"product","type":"string"},{"indexed":false,"internalType":"uint256","name":"quantity","type":"uint256"}],"name":"OrderPlaced","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"OrderPriceSet","type":"event"},{"inputs":[],"name":"buyerAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"delivered","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getInvoice","outputs":[{"internalType":"address","name":"buyer","type":"address"},{"internalType":"uint256","name":"deliveryDate","type":"uint256"},{"internalType":"address","name":"courier","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOrder","outputs":[{"internalType":"address","name":"buyer","type":"address"},{"internalType":"string","name":"product","type":"string"},{"internalType":"uint256","name":"quantity","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"payment","type":"uint256"},{"internalType":"uint256","name":"deliveryPrice","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getStage","outputs":[{"internalType":"enum Deal.Stage","name":"currentStage","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pay","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"string","name":"product","type":"string"},{"internalType":"uint256","name":"quantity","type":"uint256"}],"name":"placeOrder","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"sellerAddress","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"price","type":"uint256"}],"name":"setDeliveryPrice","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"price","type":"uint256"}],"name":"setOrderPrice","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"courier","type":"address"},{"internalType":"uint256","name":"plannedDeliveryDate","type":"uint256"}],"name":"startDelivery","outputs":[],"stateMutability":"payable","type":"function"}]

const vmContract = new web3.eth.Contract(abi, "0x9AEfD6d57AC482326558b35fdb6e48Be246b28Bb");

export default vmContract;
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import getDealContract from '../blockchain/deal'
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Deal.module.css';
import { Dropdown } from 'react-bootstrap';

const Deal = () => {
    const [error, setError] = useState('');
    const [orders, setOrders] = useState('');
    const [item, setItem] = useState('');
    const [amount, setAmount] = useState('');
    const [web3, setWeb3] = useState(null);
    const [address, setAddress] = useState(null);
    const [dealContract, setDealContract] = useState(null);
    const [placedOrders, setPlacedOrders] = useState([]);

    const [seller, setSeller] = useState(false);
    const [buyer, setBuyer] = useState(false);
    const [courier, setCourier] = useState(false);

    const stages = ["New", "Waiting for payment", "Shipping", "Shipped", "Done"];

    useEffect(() => {
        if (dealContract) {
            updateView();
        }
    }, [dealContract, address]);

    useEffect(() => {
        if (web3) {
            setSeller(false);
            setBuyer(false);
            setCourier(false);

            setAccount();
    
            const deal = getDealContract(web3);
            setDealContract(deal);
        }

    }, [web3]);

    useEffect(() => {
        window.ethereum.on('accountsChanged', handleAccountChange);
    });

    useEffect(() => {
        getOrders();
    }, [orders]);

    const handleAccountChange = (accounts) => {
        setAddress(accounts[0]);
        window.location.reload();
    }

    const updateView = async () => {
        if (!dealContract) {
            return;
        }
        if (!address) {
            return;
        }
        try {

            const sellerAddress = await dealContract.methods.sellerAddress().call();
            if (address === sellerAddress) {
                getOrdersHandler();
                return setSeller(true);
            }

            const buyerAddress = await dealContract.methods.buyerAddress().call();
            if (address === buyerAddress) {
                getOrdersHandler();
                return setBuyer(true);
            }

            if (address !== sellerAddress && address !== buyerAddress) {
                getOrdersHandler();
                return setCourier(true);
            }
        } catch (err) {
            setError(err.message);
        }
    }

    const setAccount = async () => {
        const accounts = await web3.eth.getAccounts();
        setAddress(accounts[0]);
    };

    const getOrdersHandler = async () => {
        const orders = await dealContract.methods.orderSequence().call();
        setOrders(orders);
    };

    const updateItem = (event : React.ChangeEvent<HTMLInputElement>) => {
        setItem(event.target.value);
    };

    const updateAmount = (event : React.ChangeEvent<HTMLInputElement>) => {
        setAmount(event.target.value);
    };

    const forPrice = (orders) => {
        return orders.filter((order) => {
            if (order.stage === "0" && (!order.priceSet || !order.delivery.priceSet)) {
                return true;
            }
            return false;
        })
    };

    const forDelivery = (orders) => {
        return orders.filter((order) => {
            if (order.stage === "2") {
                return true;
            }
            return false;
        })
    };

    const forPayment = (orders) => {
        return orders.filter((order) => {
            if (order.stage === "1") {
                return true;
            }
            return false;
        })
    };

    const toBeDelivered = (orders) => {
        return orders.filter((order) => {
            if (order.stage === "3") {
                return true;
            }
            return false;
        })
    };

    const getOrders = async () => {
        try {
            let contractOrders = [];
            for (let i = 1; i <= orders; i++) {
                let order = await dealContract.methods.orders(i).call()
                contractOrders.push(order);
            }

            setPlacedOrders(contractOrders);
        } catch (err) {
            setError(err.message);
        }
    }

    const placeOrderHandler = async () => {
        try {
            await dealContract.methods.placeOrder(item, amount).send(
                {
                    from: address,
                }
            )
            updateView();
        } catch (err) {
            setError(err.message);
        }
    };

    const connectWalletHandler = async () => {
        if (typeof window.ethereum === "undefined") {
            return setError("Metamask not installed");
        }

        try {
            await window.ethereum.request({method: "eth_requestAccounts"});
            var w3 = new Web3(window.ethereum);
            setWeb3(w3);
        } catch (err) {
            setError(err.message);
        }
    };

    const setPriceHandler = async (event) => {
        let fields = event.target.parentElement.parentElement.parentElement.childNodes;
        let number = fields[0].textContent;
        
        let price = fields[3].childNodes[0].childNodes[0].value;
        console.log(number);
        try {
            await dealContract.methods.setOrderPrice(web3.utils.toWei(price, "ether"), number).send(
                {
                    from: address
                }
            )

            updateView();
        } catch (err) {
            setError(err.message);
        }
    };

    const setDeliveryPriceHandler = async (event) => {
        let fields = event.target.parentElement.parentElement.parentElement.childNodes;
        let number = fields[0].textContent;
        
        let deliveryPrice = fields[4].childNodes[0].childNodes[0].value;
        try {
            await dealContract.methods.setDeliveryPrice(web3.utils.toWei(deliveryPrice, "ether"), number).send(
                {
                    from: address
                }
            )
            
            updateView();
        } catch (err) {
            setError(err.message);
        }
    };

    const paymentHandler = async (event) => {
        let fields = event.target.parentElement.parentElement.childNodes;
        let number = fields[0].textContent;
        let totalPrice = fields[5].textContent;

        try {
            await dealContract.methods.pay(number).send(
                {
                    from: address,
                    value: web3.utils.toWei(totalPrice, "ether")
                }
            );
            
            updateView();
        } catch (err) {
            setError(err.message);
        }
    };

    const startDeliveryHandler = async (event) => {
        let fields = event.target.parentElement.parentElement.childNodes;
        let number = fields[0].textContent;
        let plannedDate = fields[3].childNodes[0];
        let courierAddress = fields[4].childNodes[0];

        if(!plannedDate.value && !courierAddress.value) {
            return setError("Enter planned date and courier address");
        }

        let date = new Date(plannedDate.value);
        let time = date.getTime()

        try {
            await dealContract.methods.startDelivery(courierAddress.value, time, number).send(
                {
                    from: address
                }
            );
            
            updateView();
        } catch (err) {
            setError(err.message);
        }
    };

    const deliveryHandler = async (event) => {
        let fields = event.target.parentElement.parentElement.childNodes;
        let number = fields[0].textContent;

        try {
            await dealContract.methods.delivered(number).send(
                {
                    from: address
                }
            );
            
            updateView();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDisconnect = async () => {
        setAddress(null);
    };

    return (
        <div className={styles.main}>
            <Head>
                <title>Decentralized Deal App</title>
                <meta name="description" content="A blockchain deal application" />
            </Head>
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-brand">
                        <h1>Deal</h1>
                    </div>
                    <div className="navbar-end">
                        {
                            address ?
                                <Dropdown>
                                    <Dropdown.Toggle className="btn btn-success" variant="success" id="dropdown-basic">
                                        {address}
                                        {
                                            seller &&
                                                <> (seller)</>
                                                    
                                        }
                                        {
                                            buyer &&
                                                <> (buyer)</>
                                                    
                                        }
                                        {
                                            courier &&
                                                <> (courier)</>
                                                    
                                        }
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className="w-100">
                                        <Dropdown.Item onClick={handleDisconnect} className="btn btn-success">Disconnect</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            :
                                <button onClick={connectWalletHandler} className="btn btn-primary" type="button">No wallet connected</button>
                        }
                    </div>
                </div>
            </nav>

            {
                address ?
                <section>
                    {
                        buyer && 
                        <section>
                            <hr/>
                            <section>
                                <div className="container">
                                    <h5>New order</h5>
                                    <div className="input-group mb-3" id="order">
                                        <input onChange={updateItem} type="text" className="form-control" placeholder="Item" />
                                    </div>
                                    <div className="input-group mb-3" id="order">
                                        <input onChange={updateAmount} type="number" className="form-control" placeholder="Amount" />
                                    </div>
                                    <button onClick={placeOrderHandler} type="button" className="btn btn-primary">Place order</button>
                                </div>
                            </section>
                        </section>
                    }
                    {
                        placedOrders.length > 0 &&
                        <section>
                            <hr/>
                            <div className="container">
                                <h2>Orders: {orders}</h2>
                            </div>
                            <div className="container">
                                <table className="table m-5 table-hover">
                                    <thead className="thead-dark">
                                        <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Product</th>
                                        <th scope="col">Quantity</th>
                                        <th scope="col">Price</th>
                                        <th scope="col">Delivery price</th>
                                        <th scope="col">Stage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <>
                                        {
                                            placedOrders.length ?
                                                <>
                                                    {        
                                                        placedOrders.map((order, index) => {
                                                            index++;
                                                            return (
                                                                <tr key={index} id={index.toString()}>
                                                                    <td>{index}</td>
                                                                    <td>{order.product}</td>
                                                                    <td>{order.quantity}</td>
                                                                    <td>{web3.utils.fromWei(order.price, "ether")}</td>
                                                                    <td>{web3.utils.fromWei(order.delivery.price, "ether")}</td>
                                                                    <td>{stages[order.stage]}</td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </>
                                            :
                                                <>
                                                    <tr >
                                                        <td>
                                                            No orders
                                                        </td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                </>
                                        }
                                        </>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    }
                    {
                        seller && 
                        <div className="container">
                            <h3>WAITING TO SET PRICE</h3>
                            <table className="table m-5 table-hover">
                                <thead className="thead-dark">
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Product</th>
                                        <th scope="col">Quantity</th>
                                        <th scope="col">Price</th>
                                        <th scope="col">Delivery price</th>
                                        <th/>
                                    </tr>
                                </thead>
                                <tbody>
                                    <>
                                    {
                                        forPrice(placedOrders).length ?
                                            <>
                                                {
                                                    placedOrders.map((order, index) => {
                                                        index++;
                                                        if (order.stage === "0" && (!order.priceSet || !order.delivery.priceSet)) {
                                                            return (
                                                                <tr key={index}>
                                                                    <td>{index}</td>
                                                                    <td>{order.product}</td>
                                                                    <td>{order.quantity}</td>
                                                                    <td>
                                                                        <div className="input-group">
                                                                            {
                                                                                !order.priceSet ?
                                                                                    <>
                                                                                        <input type="number" className="form-control" defaultValue={web3.utils.fromWei(order.price, "ether")}/>
                                                                                        <button onClick={setPriceHandler} type="button" className="btn btn-primary">Set price</button>
                                                                                    </>
                                                                                :
                                                                                    <>
                                                                                        <input type="number" className="form-control" value={web3.utils.fromWei(order.price, "ether")} readOnly/>
                                                                                        <button onClick={setPriceHandler} type="button" className="btn btn-primary" disabled>Set price</button>
                                                                                    </>
                                                                            }
                                                                        </div>
                                                                    </td>
                                                                    <td> 
                                                                        <div className="input-group">
                                                                            {
                                                                                !order.delivery.priceSet ?
                                                                                    <>
                                                                                        <input type="number" className="form-control" defaultValue={web3.utils.fromWei(order.delivery.price, "ether")}/>
                                                                                        <button onClick={setDeliveryPriceHandler} type="button" className="btn btn-primary">Set delivery price</button>
                                                                                    </>
                                                                                :
                                                                                    <>
                                                                                        <input type="number" className="form-control" value={web3.utils.fromWei(order.delivery.price, "ether")} readOnly/>
                                                                                        <button onClick={setDeliveryPriceHandler} type="button" className="btn btn-primary" disabled>Set delivery price</button>
                                                                                    </>
                                                                            }
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        }
                                                    })
                                                }
                                            </>
                                            :
                                            <>
                                                <tr >
                                                    <td>
                                                        No orders
                                                    </td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </>
                                    }
                                    </>
                                </tbody>
                            </table>
                            <h3>WAITING FOR DELIVERY</h3>
                            <table className="table m-5 table-hover">
                                <thead className="thead-dark">
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Product</th>
                                        <th scope="col">Quantity</th>
                                        <th scope="col">Planned delivery date</th>
                                        <th scope="col">Courier address</th>
                                        <th/>
                                    </tr>
                                </thead>
                                <tbody>
                                    <>
                                    {
                                        forDelivery(placedOrders).length ?
                                        <>
                                            {
                                                placedOrders.map((order, index) => {
                                                    index++;
                                                    if (order.stage === "2") {
                                                        return (
                                                            <tr key={index}>
                                                                <td>{index}</td>
                                                                <td>{order.product}</td>
                                                                <td>{order.quantity}</td>
                                                                <td>
                                                                    <input type="date" className="form-control" />
                                                                </td>
                                                                <td>
                                                                    <input type="text" className="form-control"/>
                                                                </td>
                                                                <td>
                                                                    <button onClick={startDeliveryHandler} type="button" className="btn btn-primary">Start delivery</button>
                                                                </td>
                                                            </tr>
                                                        )
                                                    }
                                                })
                                            }
                                        </>
                                            :
                                        <>
                                            <tr >
                                                <td>
                                                    No orders
                                                </td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        </>
                                    }
                                    </>
                                </tbody>
                            </table>
                        </div>
                    }
                    {
                        buyer && 
                        <div className="container">
                            <h3>WAITING FOR PAYMENT</h3>
                            <table className="table m-5 table-hover">
                                <thead className="thead-dark">
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Product</th>
                                        <th scope="col">Quantity</th>
                                        <th scope="col">Price</th>
                                        <th scope="col">Delivery price</th>
                                        <th scope="col">Total price</th>
                                        <th/>
                                    </tr>
                                </thead>
                                <tbody>
                                    <>
                                    {
                                        forPayment(placedOrders).length ?
                                            <>
                                                {
                                                    placedOrders.map((order, index) => {
                                                        index++;
                                                        if (order.stage === "1") {
                                                            return (
                                                                <tr key={index}>
                                                                    <td>{index}</td>
                                                                    <td>{order.product}</td>
                                                                    <td>{order.quantity}</td>
                                                                    <td>{web3.utils.fromWei(order.price, "ether")}</td>
                                                                    <td>{web3.utils.fromWei(order.delivery.price, "ether")}</td>
                                                                    <td>{web3.utils.fromWei((Number(order.price) + Number(order.delivery.price)).toString(), "ether")}</td>
                                                                    <td>
                                                                        <button onClick={paymentHandler} type="button" className="btn btn-primary">Pay</button>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        }
                                                    })
                                                }
                                            </>
                                        :
                                            <>
                                                <tr >
                                                    <td>
                                                        No orders
                                                    </td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </>
                                    }
                                    </>
                                </tbody>
                            </table>
                        </div>
                    }
                    {
                        courier && 
                        <div className="container">
                            <h3>TO BE DELIVERED</h3>
                            <table className="table m-5 table-hover">
                                <thead className="thead-dark">
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Product</th>
                                        <th scope="col">Quantity</th>
                                        <th scope="col">Planned date</th>
                                        <th/>
                                    </tr>
                                </thead>
                                <tbody>
                                    <>
                                        {
                                            toBeDelivered(placedOrders).length ?
                                                <>
                                                    {
                                                        placedOrders.map((order, index) => {
                                                            index++;
                                                            if (order.stage === "3") {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td>{index}</td>
                                                                        <td>{order.product}</td>
                                                                        <td>{order.quantity}</td>
                                                                        <td>{order.delivery.plannedDate}</td>
                                                                        <td>
                                                                            <button onClick={deliveryHandler} type="button" className="btn btn-primary">Confirm Delivery</button>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            }
                                                        })
                                                    }
                                                </>
                                            :
                                                <>
                                                    <tr >
                                                        <td>
                                                            No orders
                                                        </td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                </>
                                        }
                                    </>
                                </tbody>
                            </table>
                        </div>
                    }
                </section>
                :
                <div className="d-flex align-items-center justify-content-center">
                    <div className="text-center mt-5">
                        <p className="fs-3"> <span className="text-danger">Opps!</span> No wallet connected.</p>
                        <p className="lead">
                            Please connect your wallet to access smart contract
                        </p>
                        <button onClick={connectWalletHandler} type="button" className="btn btn-primary">Connect Wallet</button>
                    </div>
                </div>
            }
            {
                error &&
                <div className="alert alert-danger m-5" role="alert">
                    <strong>ERROR!</strong><p>{error}</p>
                    <button onClick={() => setError('')} type="button" className="btn-close position-absolute top-0 end-0 p-2" aria-label="Close"></button>
                </div>
            }
        </div>
    );
};

export default Deal;
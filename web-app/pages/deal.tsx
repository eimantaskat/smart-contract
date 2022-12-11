import Head from 'next/head';
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import getDealContract from '../blockchain/deal'
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Deal.module.css';

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

    const [price, setPrice] = useState([]);
    const [deliveryPrice, setDeliveryPrice] = useState([]);

    const stages = ["New", "Waiting for payment", "Shipping", "Shipped", "Done"]

    useEffect(() => {
        if (dealContract) {
            updateView();
        }
    }, [dealContract, address]);

    useEffect(() => {
        if (web3) {
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
        updateView();
        setSeller(false);
        setBuyer(false);
        setCourier(false);
    }

    const updateView = async () => {
        if (!dealContract) {
            return;
        }
        try {
            const sellerAddress = await dealContract.methods.sellerAddress().call();
            if (address === sellerAddress) {
                getOrdersHandler();
                getOrders();
                return setSeller(true);
            }
            const buyerAddress = await dealContract.methods.buyerAddress().call();
            if (address === buyerAddress) {
                getOrdersHandler();
                return setBuyer(true);
            }
            // TODO courier
        } catch (err) {
            setError(err.message);
        }
    }

    const setAccount = async () => {
        const accounts = await web3.eth.getAccounts();
        setAddress(accounts[0]);
        updateView();
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

    const getOrders = async () => {
        try {
            let contractOrders = [];
            for (let i = 1; i <= orders; i++) {
                let order = await dealContract.methods.orders(i).call()
                contractOrders.push(order);
            }
            console.log(contractOrders)
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
                    // value: web3.utils.toWei("2", "ether"),
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

    const setPriceHandler = async (event : React.ChangeEvent<HTMLInputElement>) => {
        console.log(event);
        setPrice(event.target.value);
    };

    const setDeliveryPriceHandler = async (event : React.ChangeEvent<HTMLInputElement>) => {
        setDeliveryPrice(event.target.value)
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
                                <button onClick={connectWalletHandler} type="button" className="btn btn-primary" disabled >Wallet Connected</button>
                            :
                                <button onClick={connectWalletHandler} type="button" className="btn btn-primary">Connect Wallet</button>
                        }
                        
                    </div>
                </div>
            </nav>
            {
                address ?
                <section>
                    <section>
                        <div className="container text-primary">
                            <h4>Connected wallet: {address}
                            {/* { seller && <section>(Seller)</section> }
                            { buyer && <section>(Buyer)</section> }
                            { courier && <section>(Courier)</section> } */}
                            </h4>
                        </div>
                    </section>
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
                                        <th scope="col">Payment</th>
                                        <th scope="col">Stage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <>
                                        {
                                            placedOrders.map((order, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{index}</td>
                                                        <td>{order.product}</td>
                                                        <td>{order.quantity}</td>
                                                        <td>{order.price}</td>
                                                        <td>{order.payment}</td>
                                                        <td>{stages[order.stage]}</td>
                                                    </tr>
                                                )
                                            })
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
                                    </tr>
                                </thead>
                                <tbody>
                                    <>
                                    {
                                        placedOrders.map((order, index) => {
                                            if (order.stage === "0" && !order.priceSet) {
                                                return (
                                                    <tr key={index}>
                                                        <td>{index}</td>
                                                        <td>{order.product}</td>
                                                        <td>{order.quantity}</td>
                                                        <td>
                                                            {
                                                                order.price === "0" &&
                                                                <input type="text" onChange={setPriceHandler} className="form-control" value={order.price}/>
                                                            }
                                                        </td>
                                                        <td>
                                                            {
                                                                order.delivery.price === "0" &&
                                                                <input type="text" onChange={setDeliveryPriceHandler} className="form-control" value={order.delivery.price}/>
                                                            }
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                        })
                                    }
                                    </>
                                </tbody>
                            </table>
                        </div>
                    }
                </section>
                :
                <div className="container text-info">
                    <h1>Please connect your wallet</h1>
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
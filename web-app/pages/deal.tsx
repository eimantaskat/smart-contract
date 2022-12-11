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

    useEffect(() => {
        if (dealContract) {
            getOrdersHandler();
        }
        console.log("address: ", address)
    }, [dealContract, address]);

    useEffect(() => {
        if (web3) {
            setAccount();
    
            const deal = getDealContract(web3);
            setDealContract(deal);
        }

    }, [web3]);

    useEffect(() => {
        window.ethereum.on('accountsChanged', (accounts) => {
            setAddress(accounts[0]);
        });
    });

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

    const placeOrderHandler = async () => {
        try {
            await dealContract.methods.placeOrder(item, amount).send(
                {
                    from: address,
                    // value: web3.utils.toWei("2", "ether"),
                }
            )
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(`Unexpected error: ${err}`);
            }
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
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(`Unexpected error: ${err}`);
            }
        }
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
                        <button onClick={connectWalletHandler} type="button" className="btn btn-primary">Connect Wallet</button>
                    </div>
                </div>
            </nav>
            {
                address ?
                <section>
                    <section>
                        <div className="container text-primary">
                            <h4>Connected wallet: {address}</h4>
                        </div>
                    </section>
                    <section>
                        <div className="container">
                            <h2>Orders: {orders}</h2>
                        </div>
                    </section>
                    <section>
                        <div className="container">
                            <label htmlFor="order" className="label">Place order</label>
                            <div className="input-group mb-3" id="order">
                                <input onChange={updateItem} type="text" className="form-control" placeholder="Item" />
                            </div>
                            <div className="input-group mb-3" id="order">
                                <input onChange={updateAmount} type="number" className="form-control" placeholder="Amount" />
                            </div>
                            <button onClick={placeOrderHandler} type="button" className="btn btn-primary">Place order</button>
                        </div>
                    </section>
                    <section>
                        <div className="container text-danger">
                            <p>{error}</p>
                        </div>
                    </section>
                </section>
                :
                <div className="container text-info">
                    <h1>Please connect your wallet</h1>
                </div>
            }
        </div>
    );
};

export default Deal;
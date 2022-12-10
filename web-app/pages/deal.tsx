import Head from 'next/head';
import { useState } from 'react';
import Web3 from 'web3';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Deal.module.css';

const Deal = () => {
    const [error, setError] = useState('');
    let web3;

    const connectWalletHandler = async () => {
        // check if Metamask is installed
        if (typeof window.ethereum === "undefined") {
            return setError("Metamask not installed");
        }

        try {
            await window.ethereum.request({method: "eth_requestAccounts"});
            web3 = new Web3(window.ethereum);
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
            <section>
                <div className="container">
                    some text
                </div>
            </section>
            <section>
                <div className="container text-danger">
                    <p>{error}</p>
                </div>
            </section>
        </div>
    );
};

export default Deal;
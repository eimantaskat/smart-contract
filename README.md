# smart-contract

## Verslo modelis
![smart contract  drawio](https://user-images.githubusercontent.com/80033246/207680341-1d51d96c-c403-4be0-a8e2-f05bd75c77c0.png)

## Unit tests
Testų paleidimas lokaliame *Ethereum* tinkle:
```bash
    > cd contract
    > truffle test
```
Testų vykdymo rezultatas:
```bash
Using network 'development'.


Compiling your contracts...
===========================
> Compiling .\contracts\Deal.sol
> Artifacts written to C:\Users\Eimantas\AppData\Local\Temp\test--17284-AMMHrok7X1cH
> Compiled successfully using:
   - solc: 0.8.17+commit.8df45f5f.Emscripten.clang


  Contract: Deal
    ✔ Seller should own the contract (888ms)
    ✔ Buyer address is set correctly (875ms)
    ✔ Buyer can place order (1885ms)
    ✔ Only buyer can place order (2626ms)
    ✔ Seller can set order price (2162ms)
    ✔ Only seller can set order price (3143ms)
    ✔ Correct order price is set (3076ms)
    ✔ Seller can set delivery price (2461ms)
    ✔ Only seller can set delivery price (3360ms)
    ✔ Correct delivery price is set (2215ms)
    ✔ Cannot change order price (2030ms)
    ✔ Cannot change delivery price (3448ms)
    ✔ Buyer can pay for order (4164ms)
    ✔ Payment value cannot be lower than order price + delivery price (3808ms)
    ✔ Payment value cannot be higher that order price + delivery price (4278ms)
    ✔ Seller can set courier address (5924ms)
    ✔ Courier address is set correctly (6220ms)
    ✔ Courier can confirm delivery (5395ms)


  18 passing (59s)
```

## *Smart contract*'o testavimas ***Goerli*** tinkle

### Kontrakto sukūrimas
Kontrakto sukūrimo tranzakciją galite peržiūrėti https://goerli.etherscan.io/tx/0x89f7580f25f1a7ef842c94788bcda2f6189e9d21193a7ce7209f3fcf317f5b38 
  
Kontrakto sukūrimo output'as:
```bash
Starting migrations...
======================
> Network name:    'goerli'
> Network id:      5
> Block gas limit: 30000000 (0x1c9c380)


1_deploy_deal.js
================

   Deploying 'Deal'
   ----------------
   > transaction hash:    0x89f7580f25f1a7ef842c94788bcda2f6189e9d21193a7ce7209f3fcf317f5b38
   > Blocks: 0            Seconds: 8
   > contract address:    0x1bd0D9254F8A1B6aecfdC349a39380117436fe01
   > block number:        8134753
   > block timestamp:     1671039564
   > account:             0xD4D063B0fC90C751181Fd18a40fC9DA280a8859e
   > balance:             0.252692859180839864
   > gas used:            2072411 (0x1f9f5b)
   > gas price:           3.248609558 gwei
   > value sent:          0 ETH
   > total cost:          0.006732454182704338 ETH

   Pausing for 2 confirmations...

   -------------------------------
   > confirmation number: 1 (block: 8134754)
   > confirmation number: 2 (block: 8134755)
   > Saving artifacts
   -------------------------------------       
   > Total cost:     0.006732454182704338 ETH  

Summary
=======
> Total deployments:   1
> Final cost:          0.006732454182704338 ETH
```

### Vykdomos tranzakcijos

Užsakymo pateikimas: https://goerli.etherscan.io/tx/0xb184695e9b921e457dbb32f59d304ddb797edb236d1150dbd2e0eb1f7ce98c01  
Pirkinio kainos nustatymas: https://goerli.etherscan.io/tx/0x1cb496d0274d5c326bc4c4881459811e333bdec098de93ec134ec70b25a4034c  
Pristatymo kainos nustatymas: https://goerli.etherscan.io/tx/0xe56da626ed04802036c7d9f358e4a9a950c8409a96d7a55e8e56f4fb26ee4da6  
Užsakymo apmokėjimas: https://goerli.etherscan.io/tx/0x9ce047cab7ab9d262027be0eab796ae6daba581f9ec1136a1de293ba35d9d22f  
Pristatymo pradėjimas: https://goerli.etherscan.io/tx/0x88d7e5a9008625e553937bac76cd27c6d8f3b02e20c6c7fce63895037d624423  
Užsakymo pristatymo patvirtinimas: https://goerli.etherscan.io/tx/0xb06e4ff416aa95e63923c8186a177f4a703f1522a5a935bb6f03bf6a4748b54e

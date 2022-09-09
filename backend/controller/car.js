const { Gateway, Wallets } = require('fabric-network');
const { getCCP, getWallet } = require('../middleware/connection');
const EventStrategies = require('fabric-network/lib/impl/event/defaulteventhandlerstrategies');

let response, username,org,result, identity,ccp,walletPath,wallet;

const channel = 'mychanne';
const chaincode = 'car';

async function util(req){
    username = req.query.username;
    org = req.query.org;

    ccp = await getCCP(org);
    walletPath = await getWallet(org);
    wallet = await Wallets.newFileSystemWallet(walletPath);

    identity = await wallet.get(username);

    if(!identity) {
        console.log(`An identity for the user ${username} does not exist in the wallet, Register the user first`);
        response = {
                success: true,
                message: 'Kindly register the user: ' + username,
                uri: 'http://localhost:4000/api/users'
            };
        
    }
}



module.exports.createCar = async(req, res) => {

    try {
        await util(req);

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork(channel);
        const contract = network.getContract(chaincode);
        
        result = await contract.submitTransaction('CreateCar', req.body.id, req.body.model, username);

        response = {
            success: true,
            message: "New car created successfully",
        };

    res.status(201).json(response);

    }
    catch(error) {

        console.log("Inside Catch block : ", error.message);

        response = {
            success: false,
            message: error.message,
        };

        // disconnect from the network
        // await gateway.disconnect();

        res.status(500).json(response);
    }
}

module.exports.queryAllCar = async(req, res) => {

    try {
        await util(req);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });
    
        console.log(`Channel name ... ${channel}`);
        const network = await gateway.getNetwork(channel);

        console.log(`Chaincode name ... ${chaincode}`);
        const contract = network.getContract(chaincode);

        let result = await contract.evaluateTransaction('QueryAllCars');
        result = JSON.parse(result.toString());

        response = {
            success: true,
            message: result,
        };
        
        // // Disconnect from the gateway.
        await gateway.disconnect();

        res.status(201).json(response);

    }
    catch(error) {

        console.log("Error is : ", error);

        response = {
            success: false,
            message: error,
        };

        // disconnect from the network
        await gateway.disconnect();

        res.status(401).json(response);
    }
}

module.exports.deliverCar = async(req, res) => {

    try {
        let response, result, identity;

        const username = req.query.username;
        const org = req.query.org;
        const channel = 'mychannel';
        const chaincode = 'car';
        const ccp = await getCCP(org);
        const walletPath = await getWallet(org);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        identity = await wallet.get(username);

        if(!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet, Register the user first`);
            response = {
                success: true,
                message: 'Kindly register the user: ' + username,
                uri: 'http://localhost:3000/api/users'
            };
        }
        else {
        // Create a new gateway for connecting to our peer node.
        const connectOptions = {
            wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
            eventHandlerOptions: EventStrategies.NONE
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, connectOptions);

        console.log(`Channel name ... ${channel}`);
        console.log(`Chaincode name ... ${chaincode}`);

        const network = await gateway.getNetwork(channel);
        const contract = network.getContract(chaincode);
        
        console.log(req.body.id);
        await contract.submitTransaction('DeliverCar', req.body.id, req.body.owner);

        // console.log(JSON.stringify(JSON.parse(result.toString())));
        // result = JSON.parse(result.toString());

        response = {
            success: true,
            message: "Car delivered successfully",
        };
        
        // Disconnect from the gateway.
        await gateway.disconnect();
    }

    res.status(201).json(response);

    }
    catch(error) {

        console.log(error);

        response = {
            success: false,
            message: error.message,
        };

        // disconnect from the network
        await gateway.disconnect();

        res.status(401).json(response);
    }
}

module.exports.sellCar = async(req, res) => {

    try {
        let response, result, identity;

        const username = req.query.username;
        const org = req.query.org;
        const channel = 'mychannel';
        const chaincode = 'car';
        const ccp = await getCCP(org);
        const walletPath = await getWallet(org);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        identity = await wallet.get(username);

        if(!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet, Register the user first`);
            response = {
                success: true,
                message: 'Kindly register the user: ' + username,
                uri: 'http://localhost:3000/api/users'
            };
        }
        else {
        // Create a new gateway for connecting to our peer node.
        const connectOptions = {
            wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
            eventHandlerOptions: EventStrategies.NONE
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, connectOptions);

        console.log(`Channel name ... ${channel}`);
        console.log(`Chaincode name ... ${chaincode}`);

        const network = await gateway.getNetwork(channel);
        const contract = network.getContract(chaincode);
        
        console.log(req.body.id);
        await contract.submitTransaction('SellCar', req.body.id, req.body.owner);

        // console.log(JSON.stringify(JSON.parse(result.toString())));
        // result = JSON.parse(result.toString());

        response = {
            success: true,
            message: "Car sold successfully",
        };
        
        // Disconnect from the gateway.
        await gateway.disconnect();
    }

    res.status(201).json(response);

    }
    catch(error) {

        console.log(error);

        response = {
            success: false,
            message: error.message,
        };

        // disconnect from the network
        await gateway.disconnect();

        res.status(401).json(response);
    }
}

module.exports.trackCar = async(req, res) => {

    try {

        let response, result, identity;

        const username = req.query.username;
        const org = req.query.org;
        const channel = 'mychannel';
        const chaincode = 'car';
        // const fcn = req.body.fcn;

        const ccp = await getCCP(org);

        const walletPath = await getWallet(org);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        identity = await wallet.get(username);

        if(!identity) {

            console.log(`An identity for the user ${username} does not exist in the wallet, Register the user first`);
            response = {
                success: true,
                message: 'Kindly register the user: ' + username,
                uri: 'http://localhost:3000/api/users'
            };
        
        }
        else {

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });
    
        // Get the network (channel) our contract is deployed to.
        console.log(`Channel name ... ${channel}`);
        const network = await gateway.getNetwork(channel);

        console.log(`Chaincode name ... ${chaincode}`);
        const contract = network.getContract(chaincode);

        let result = await contract.evaluateTransaction('GetHistoryForAsset', req.body.id);

        console.log(JSON.stringify(JSON.parse(result.toString())));
        result = JSON.parse(result.toString());

        response = {
            success: true,
            message: result,
        };
        
        // Disconnect from the gateway.
        await gateway.disconnect();
    }

    res.status(201).json(response);

    }
    catch(error) {

        console.log(error);

        response = {
            success: false,
            message: error.message,
        };

        // disconnect from the network
        await gateway.disconnect();

        res.status(401).json(response);
    }
}

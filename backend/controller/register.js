const { Wallets } = require('fabric-network');
const fabricCA = require('fabric-ca-client');
const { getCCP, getCAurl, getWallet, getAffiliation } = require('../middleware/connection');
const { enrollAdmin } = require('./enrollAdmin');

module.exports.registerUser = async(req, res) => {

    try{
    const org = req.body.org;
    const username = req.body.username;

    console.log('Organization: ', org);
    console.log('User Name: ', username);

    let ccp = await getCCP(org);

    const caURL = await getCAurl(org, ccp);
    const ca = new fabricCA(caURL);

    const walletPath = await getWallet(org);
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const user = await wallet.get(username);


    if(user) {
        console.log(`An identity for the user ${username} already exist`);
        var response = {
            success: true,
            message: "Duplicate User"
        }
        return res.status(201).json(response);
    }
    else {
        console.log('Username does not exist');
    }

    let adminIdentity = await wallet.get('admin');
    if(!adminIdentity) {
        console.log('Admin identity does not exist');
        await enrollAdmin(org,ccp);
        adminIdentity = await wallet.get('admin');
    }
    else {
        console.log('Admin identity is already present');
    }

    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');
    // console.log('Admin : ', adminUser);

    // Register the user, enroll the user, and import the new identity into the wallet.
    let secret, enroll;


    let x509identity;

    if(org == "Org1") {

        console.log('Create org1 user');
        secret = await ca.register({ affiliation: await getAffiliation(org), enrollmentID: username, role: 'client', 
                    attrs: [{name: 'abac.manufacturer', value: 'true', ecert: true}]}, adminUser);

        enroll = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret });

        x509identity = {
            credentials:{
                certificate: enroll.certificate,
                privateKey: enroll.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509'
        };
    }
    else if(org == "Org2") {

        console.log('Create Org2 user');
        console.log('Affiliation : ', await getAffiliation(org));
        
        secret = await ca.register({ affiliation: await getAffiliation(org), enrollmentID: username, role: 'client', 
            attrs: [{name: 'abac.dealer', value: 'true', ecert: true}]}, adminUser);

        enroll = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret });


        x509identity = {
            credentials:{
                certificate: enroll.certificate,
                privateKey: enroll.key.toBytes(),
            },
            mspId: 'Org2MSP',
            type: 'X.509'
        };
    }
    else if(org == "Org3") {

        console.log('Create Org3 user');

        secret = await ca.register({ enrollmentID: username, role: 'client', 
            attrs: [{name: 'abac.owner', value: 'true', ecert: true}]}, adminUser);

        enroll = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret });


        x509identity = {
            credentials:{
                certificate: enroll.certificate,
                privateKey: enroll.key.toBytes(),
            },
            mspId: 'Org3MSP',
            type: 'X.509'
        };
    }

    await wallet.put(username, x509identity);

    console.log(`Successfully registered and enrolled user ${username} and imported it into the wallet`);
    
    var response = {
        success: true,
        message: username + ' enrolled Successfully',
    };

    res.status(201).json(response);
    }
    catch(error) {

        var response = {
        success: false,
        message: error.message,};
        
        res.status(201).json(response);
    }
};
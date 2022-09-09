const { Wallets } = require('fabric-network');
const fabricCA = require('fabric-ca-client');
const { getWallet, getCAinfo, getCAurl } = require('../middleware/connection');

module.exports.enrollAdmin = async(org, ccp) => {

    try {
        let x509identity;
        const caInfo = await getCAinfo(org, ccp);
        const caTLSCert = caInfo.tlsCACerts.pem;
        // const ca = new fabricCA(caInfo.url, { trustedRoots: caTLSCert, verify: false});
        const ca = new fabricCA(caInfo.url, { trustedRoots: caTLSCert, verify: false }, caInfo.caName);

        const wallet = await getWallet(org);
        const walletPath = await Wallets.newFileSystemWallet(wallet);
        console.log(`Wallet path: ${walletPath}`);

        const admin = await walletPath.get('admin');
        if(admin) {
            console.log('An admin identity is already present');
            return;
        }

        // Enroll the admin and import the identity into wallet
        const adminEnroll = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        if(org == "Org1") {

            x509identity = {
                credentials: {
                    certificate: adminEnroll.certificate,
                    privateKey: adminEnroll.key.toBytes(),
                },
                mspId: 'Org1MSP',
                type: 'X.509',
            }

        }
        else if(org == "Org2") {

            x509identity = {
                credentials: {
                    certificate: adminEnroll.certificate,
                    privateKey: adminEnroll.key.toBytes(),
                },
                mspId: 'Org2MSP',
                type: 'X.509',
            }
            
        }

        await walletPath.put('admin', x509identity);
        console.log('Successfully enrolled admin user');
        return;
    }
    catch(error) {
        console.log(error);
        process.exit(1);
    }

};
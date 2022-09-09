const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');

module.exports.getCCP = (org) => {
    
    let ccpPath;
        
    if(org == "Org1") {
        ccpPath = path.resolve(__dirname,'..','..','connection-profile','connection-org1.json');
    }

    if(org == "Org2") {
        ccpPath = path.resolve(__dirname,'..','..','connection-profile','connection-org2.json');
    }

    console.log('CCP : ', ccpPath);
    const ccp = yaml.load(fs.readFileSync(ccpPath, 'utf-8'));

    return ccp;
};

module.exports.getCAurl = (org, ccp) => {

    let caURL;

    if(org == "Org1") {
        caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
    }
    if(org == "Org2") {
        caURL = ccp.certificateAuthorities['ca.org2.example.com'].url;
    }
    console.log('CA-url: ', caURL);
    return caURL;
};

module.exports.getWallet = (org) => {

    let walletPath;

    if(org == "Org1") {
        walletPath = path.join(process.cwd(), 'org1-wallet');
    }

    if(org == "Org2") {
        walletPath = path.join(process.cwd(), 'org2-wallet');
    }

    return walletPath;
};

module.exports.getCAinfo = (org, ccp) => {

    let caInfo;

    if(org == "Org1") {
        caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    }

    if(org == "Org2") {
        caInfo = ccp.certificateAuthorities['ca.org2.example.com'];
    }
    
    return caInfo;
};

module.exports.getAffiliation = async (org) => {
    return org == "Org1" ? 'org1.department1' : 'org2.department1'
}
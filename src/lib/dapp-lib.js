'use strict';
import Blockchain from './blockchain';
import BN from 'bn.js'; // Required for injected code
import dappConfig from '../dapp-config.json';
import SvgIcons from '../dapp/components/widgets/svg-icons';

///+import

export default class DappLib {

/*>>>>>>>>>>>>>>>>>>>>>>>>>>> ACCESS CONTROL: CONTRACT RUN STATE  <<<<<<<<<<<<<<<<<<<<<<<<<<*/

    static async isContractRunStateActive(data) {

        let result = await Blockchain.get({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_STATE_CONTRACT,
                params: {
                    from: null
                }
            },
            'isContractRunStateActive'
        );
        return {
            type: DappLib.DAPP_RESULT_BOOLEAN,
            label: 'Is Contract Run State Active',
            result: result.callData,
            hint: null
        }
    }

    static async setContractRunState(data) {
        let result = await Blockchain.post({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_STATE_CONTRACT,
                params: {
                    from: null
                }
            },
            'setContractRunState',
            data.mode
        );
        return {
            type: DappLib.DAPP_RESULT_TX_HASH,
            label: 'Transaction Hash',
            result: DappLib.getTransactionHash(result.callData),
            hint: `Verify contract run state is ${data.mode ? 'active' : 'inactive'} by calling contract functions that use requireContractRunStateActive().`
        }
    }

/*>>>>>>>>>>>>>>>>>>>>>>>>>>> ACCESS CONTROL: ADMINISTRATOR ROLE  <<<<<<<<<<<<<<<<<<<<<<<<<<*/

    static async isContractAdmin(data) {

        let result = await Blockchain.get({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_STATE_CONTRACT,
                params: {
                    from: null
                }
            },
            'isContractAdmin',
            data.account
        );
        return {
            type: DappLib.DAPP_RESULT_BOOLEAN,
            label: 'Is Contract Admin',
            result: result.callData,
            hint: null
        }
    }

    static async addContractAdmin(data) {

        let result = await Blockchain.post({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_STATE_CONTRACT,
                params: {
                    from: null
                }
            },
            'addContractAdmin',
            data.account
        );
        return {
            type: DappLib.DAPP_RESULT_TX_HASH,
            label: 'Transaction Hash',
            result: DappLib.getTransactionHash(result.callData),
            hint: `Verify ${DappLib.formatAccount(data.account)} is an administrator by using "Is Contract Admin."`
        }
    }

    static async removeContractAdmin(data) {

        let result = await Blockchain.post({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_STATE_CONTRACT,
                params: {
                    from: null
                }
            },
            'removeContractAdmin',
            data.account
        );
        return {
            type: DappLib.DAPP_RESULT_TX_HASH,
            label: 'Transaction Hash',
            result: DappLib.getTransactionHash(result.callData),
            hint: `Verify ${DappLib.formatAccount(data.account)} is no longer an administrator by using "Is Contract Admin."`
        }
    }

    static async removeLastContractAdmin(data) {

        let result = await Blockchain.post({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_STATE_CONTRACT,
                params: {
                    from: null
                }
            },
            'removeLastContractAdmin',
            data.account
        );
        return {
            type: DappLib.DAPP_RESULT_TX_HASH,
            label: 'Transaction Hash',
            result: DappLib.getTransactionHash(result.callData),
            hint: `Verify that all functions that require an administrator no longer work."`
        }
    }

/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ASSET VALUE TRACKING: TOKEN  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/

    static async _decimals(data) {
        let result = await Blockchain.get({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_STATE_CONTRACT,
                params: {
                    from: data.from
                }
            },
            'decimals'
        );
        return result.callData
    }

    static async _toSmallestUnit(amount, data) {
        let decimals = await DappLib._decimals(data);
        let units = new BN(10).pow(new BN(decimals));
        return new BN(amount).mul(units);
    }

    static async _fromSmallestUnit(amount, data) {
        let decimals = await DappLib._decimals(data);
        let units = new BN(10).pow(new BN(decimals));
        return new BN(amount).div(units);
    }

    static async totalSupply(data) {

        let result = await Blockchain.get({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_STATE_CONTRACT,
                params: {
                    from: data.from
                }
            },
            'totalSupply',
        ); 
        let supply = result.callData;
        return {
            type: DappLib.DAPP_RESULT_BIG_NUMBER,
            label: 'Total Supply',
            result: new BN(supply),
            unitResult: await DappLib._fromSmallestUnit(supply, data),
            hint: null
        }
    }

    static async balance(data) {

        let result = await Blockchain.get({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_STATE_CONTRACT,
                params: {
                    from: data.from
                }
            },
            'balance'
        );
        let balance = result.callData;
        return {
            type: DappLib.DAPP_RESULT_BIG_NUMBER,
            label: 'Account Balance for ' + DappLib.formatAccount(result.callAccount),
            result: new BN(balance),
            unitResult: await DappLib._fromSmallestUnit(balance, data),
            hint: null
        }
    }

    static async balanceOf(data) {

        let result = await Blockchain.get({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_STATE_CONTRACT,
                params: {
                    from: data.from
                }
            },
            'balanceOf',
            data.account
        );
        let balance = result.callData;
        return {
            type: DappLib.DAPP_RESULT_BIG_NUMBER,
            label: DappLib.formatAccount(result.callAccount) + ' Account Balance',
            result: new BN(balance),
            unitResult: await DappLib._fromSmallestUnit(balance, data),
            hint: null
        }
    }

    static async transfer(data) {

        let decimals = await DappLib._decimals(data);
        let units = new BN(10).pow(new BN(decimals));
        let amount = new BN(data.amount).mul(units);
        let result = await Blockchain.post({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_STATE_CONTRACT,
                params: {
                    from: data.from
                }
            },
            'transfer',
            data.to,
            amount
        );
        return {
            type: DappLib.DAPP_RESULT_TX_HASH,
            label: 'Transaction Hash',
            result: DappLib.getTransactionHash(result.callData),
            hint: `Verify transfer by using "Balance for Account" to check the balance of ${DappLib.formatAccount(data.to)}.`
        }
    }


/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> EXAMPLES  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/

    // These example functions demonstrate cross-contract calling

    static async getStateContractOwner() {

        let result = await Blockchain.get({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_CONTRACT,
                params: {
                }
            },
            'getStateContractOwner',
        ); 
        let owner = result.callData;
        return {
            type: DappLib.DAPP_RESULT_ACCOUNT,
            label: 'Contract Owner',
            result: owner,
            unitResult: null,
            hint: null
        }
    }

    static async getStateCounter() {

        let result = await Blockchain.get({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_CONTRACT,
                params: {
                }
            },
            'getStateCounter',
        );         
        return result;
    }

    static async incrementStateCounter(data) {

        let result = await Blockchain.post({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_CONTRACT,
                params: {
                }
            },
            'incrementStateCounter',
            data.increment
        );
        return {
            type: DappLib.DAPP_RESULT_TX_HASH,
            label: 'Transaction Hash',
            result: DappLib.getTransactionHash(result.callData),
            hint: ''
        }
    }



/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> DAPP LIBRARY  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/

    static get DAPP_STATE_CONTRACT() {
        return 'dappStateContract'
    }
    static get DAPP_CONTRACT() {
        return 'dappContract'
    }

    static get DAPP_RESULT_BIG_NUMBER() {
        return 'big-number'
    }

    static get DAPP_RESULT_ACCOUNT() {
        return 'account'
    }

    static get DAPP_RESULT_TX_HASH() {
        return 'tx-hash'
    }

    static get DAPP_RESULT_HASH_ARRAY() {
        return 'hash-array'
    }

    static get DAPP_RESULT_ARRAY() {
        return 'array'
    }

    static get DAPP_RESULT_OBJECT() {
        return 'object'
    }

    static get DAPP_RESULT_ERROR() {
        return 'error'
    }

    static getTransactionHash(t) {
        if (!t) { return ''; }
        let value = '';
        if (typeof t === 'string') {                
            value = t;
        } else if (typeof t === 'object') {    
            if (t.hasOwnProperty('transactionHash')) {
                    value = t.transactionHash;       // Ethereum                
            } else if (t.hasOwnProperty('transaction')) {
                if (t.transaction.id) {
                    value = t.transaction.id;       // Harmony
                }
            } else {
                value = JSON.stringify(t);
            }
        }
        return value;
    }

    static formatHint(hint) {
        if (hint) {
            return `<p class="mt-3 grey-text"><strong>Hint:</strong> ${hint}</p>`;
        } else {
            return '';
        }
    }

    static formatNumber(n) {
        var parts = n.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return `<strong class="p-1 blue-grey-text number copy-target" style="font-size:1.1rem;" title="${n}">${parts.join(".")}</strong>`;
    }

    static formatAccount(a) {
        return `<strong class="green accent-1 p-1 blue-grey-text number copy-target" title="${a}">${DappLib.toCondensed(a, 6, 4)}</strong>${ DappLib.addClippy(a)}`;
    }

    static formatTxHash(a) {
        let value = DappLib.getTransactionHash(a);
        return `<strong class="teal lighten-5 p-1 blue-grey-text number copy-target" title="${value}">${DappLib.toCondensed(value, 6, 4)}</strong>${ DappLib.addClippy(value)}`;
    }

    static formatIpfsHash(a) {
        let config = DappLib.getConfig();
        let url = `${config.ipfs.protocol}://${config.ipfs.host}/ipfs/${a}`;
        return `<strong class="teal lighten-5 p-1 black-text number copy-target" title="${url}"><a href="${url}" target="_new">${a.substr(0,6)}...${a.substr(a.length-4, 4)}</a></strong>${ DappLib.addClippy(a)}`;
    }

    static formatBoolean(a) {
        return (a ? 'YES' : 'NO');
    }

    static formatText(a, copyText) {
        if (!a) { return; }
        if (a.startsWith('<')) {
            return a;
        }
        return `<span title="${copyText ? copyText : a}">${a}</span>${DappLib.addClippy(copyText ? copyText : a)}`;
    }

    static formatStrong(a) {
        return `<strong>${a}</strong>`;
    }

    static formatPlain(a) {
        return a;
    }

    static formatObject(a) {
        let data = [];
        let labels = [ 'Item', 'Value' ];
        let keys = [ 'item', 'value' ];
        let formatters = [ 'Strong', 'Text-20-5' ];
        let reg = new RegExp('^\\d+$'); // only digits
        for(let key in a) {
            if (!reg.test(key)) {
                data.push({
                    item: key.substr(0,1).toUpperCase() + key.substr(1),
                    value: a[key]
                });
            }
        }
        return DappLib.formatArray(data, formatters, labels, keys);
    }

    static formatArray(h, dataFormatters, dataLabels, dataKeys) {

        let output = '<table class="table table-striped">';

        if (dataLabels) {
            output += '<thead><tr>';
            for(let d=0; d<dataLabels.length; d++) {
                output += `<th scope="col">${dataLabels[d]}</th>`;
            }    
            output += '</tr></thead>';
        }
        output += '<tbody>';
        h.map((item) => {
            output += '<tr>';
            for(let d=0; d<dataFormatters.length; d++) {
                let text = dataKeys && dataKeys[d] ? item[dataKeys[d]] : item;
                let copyText =  dataKeys && dataKeys[d] ? item[dataKeys[d]] : item;

                if (text.startsWith('<')) {
                    output += (d == 0 ? '<th scope="row">' : '<td>') + text + (d == 0 ? '</th>' : '</td>');
                } else {
                    let formatter = 'format' + dataFormatters[d];
                    if (formatter.startsWith('formatText')) {
                        let formatterFrags = formatter.split('-');
                        if (formatterFrags.length === 3) {
                            text = DappLib.toCondensed(text, Number(formatterFrags[1]), Number(formatterFrags[2]));
                        } else if (formatterFrags.length === 2) {
                            text = DappLib.toCondensed(text, Number(formatterFrags[1]));
                        }
                        formatter = formatterFrags[0];    
                    }
                    output += (d == 0 ? '<th scope="row">' : '<td>') + DappLib[formatter](text, copyText) + (d == 0 ? '</th>' : '</td>');                        
                }
            }    
            output += '</tr>';
        })
        output += '</tbody></table>';
        return output;
    }


    static addClippy(data) {
        let icon = SvgIcons.clippy;
        return icon.replace('<svg ', `<svg data-copy="${data}" `)
    }

    static fromAscii(str, padding) {

        if (str.startsWith('0x') || !padding) {
            return str;
        }

        if (str.length > padding) {
            str = str.substr(0, padding);
        }

        var hex = '0x';
        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i);
            var n = code.toString(16);
            hex += n.length < 2 ? '0' + n : n;
        }
        return hex + '0'.repeat(padding*2 - hex.length + 2);
    };
    
    static toAscii(hex) {
        var str = '',
            i = 0,
            l = hex.length;
        if (hex.substring(0, 2) === '0x') {
            i = 2;
        }
        for (; i < l; i+=2) {
            var code = parseInt(hex.substr(i, 2), 16);
            if (code === 0) continue; // this is added
            str += String.fromCharCode(code);
        }
        return str;
    };

    static toCondensed(s, begin, end) {
        if (!s) { return; }
        if (s.length && s.length <= begin + end) {
            return s;
        } else {
            if (end) {
                return `${s.substr(0, begin)}...${s.substr(s.length-end, end)}`;
            } else {
                return `${s.substr(0, begin)}...`;
            }
        }
    }

    static getConfig() {
        return dappConfig;
    }

    // Return value of this function is used to dynamically re-define getConfig()
    // for use during testing. With this approach, even though getConfig() is static
    // it returns the correct contract addresses as its definition is re-written
    // before each test run. Look for the following line in test scripts to see it done:
    //  DappLib.getConfig = Function(`return ${ JSON.stringify(DappLib.getTestConfig(testDappStateContract, testDappContract, testAccounts))}`);
    static getTestConfig(testDappStateContract, testDappContract, testAccounts) {

        return Object.assign(
            {}, 
            dappConfig,
            {
                dappStateContractAddress: testDappStateContract.address,
                dappContractAddress: testDappContract.address,
                accounts: testAccounts,
                owner: testAccounts[0],
                admins: [
                    testAccounts[1],
                    testAccounts[2],
                    testAccounts[3]
                ],
                users: [
                    testAccounts[4],
                    testAccounts[5],
                    testAccounts[6],
                    testAccounts[7],
                    testAccounts[8]
                ],
                testAddresses: [
                    // These test addresses are useful when you need to add random accounts in test scripts
                    "0xb1ac66b49fdc369879123332f2cdd98caad5f75a",
                    "0x0d27a7c9850f71d7ef71ffbe0155122e83d9455d",
                    "0x88477a8dc34d60c40b160e9e3b1721341b63c453",
                    "0x2880e2c501a70f7db1691a0e2722cf6a8a9c9009",
                    "0x0226df61d33e41b90be3b5fd830bae303fcb66f5",
                    "0x60a4dff3d25f4e5a5480fb91d550b0efc0e9dbb3",
                    "0xa2f52a2060841cc4eb4892c0234d2c6b6dcf1ea9",
                    "0x71b9b9bd7b6f72d7c0841f38fa7cdb840282267d",
                    "0x7f54a3318b2a728738cce36fc7bb1b927281c24e",
                    "0x81b7E08F65Bdf5648606c89998A9CC8164397647"
                ],
                ipfsTestFiles: [
                    "QmaWf4HjxvCH5W8Cm8AoFkSNwPUTr3VMZ3uXp8Szoqun53",
                    "QmTrjnQTaUfEEoJ8DgsDG2A8AqsiN5bSV62q98tWkZMU2D",
                    "QmSn26zrUd5CbuNoBPwGhPrktLv94rPiZxNmkHx5smTYj3",
                    "QmTy9aLjFxV8sDK7GEp8uR1zC8ukq3NrV6aSNxjvBTTcqu",
                    "QmWJU1FQghgi69VSDpEunEwemPDFqmBvXzp8b9DxKHP7QQ",
                    "QmYT1ejAMbG2fP7AMdH2Pi2QpQRxQXBUC3CbENzpY2icok",
                    "QmQJh3yLX9z6dmKbFhCyGsZrUEtRXeurcDG39eXbkwQG7C",
                    "QmWRYExBZgZ67R43jW2vfwL3Hio78JaR7Vq3ouiJTsZ6qw",
                    "QmWwPLQVVJizkwwiqPcknBUnRH359TfbusHpVGZtWNGMxu",
                    "QmbtFKnBuyUmRoFh9EueP2r6agYpwGJwG4VBikQ4wwjGAY"
                ]
            }
        );
    }

}
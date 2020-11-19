const txsStats = {
	pattern: "stats",
	data:[{
		token: '0x0c74199d22f732039e843366a236ff4f61986b32',
		txs: 10,
		transfers: 0,
		pair_add: 0,
		active_at: Math.floor(Date.now() / 1000)
	}]
};

const txsHolders = {
	pattern: 'holders',
	data: [{
		token: '0x0c74199d22f732039e843366a236ff4f61986b32',
		holders: 10
	}]
};

const txsHoldersChange = {
	pattern: 'holders:change',
	data: [{
		token: '0x0c74199d22f732039e843366a236ff4f61986b32',
		holders: 10
	}]
};
const tokenSupply = {
	pattern: 'supply:change',
	data: {token: '0x0c74199d22f732039e843366a236ff4f61986b32'}
}
console.log(JSON.stringify(txsHoldersChange));

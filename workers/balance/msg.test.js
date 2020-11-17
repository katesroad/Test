const balanceMsg = {
	pattern: "balance",
	data: [
		{
			tokens: [
				"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
				"0x0c74199d22f732039e843366a236ff4f61986b32"
			],
			tlTokens: [],
			address: "0x53781221c8a0b40d0f7d9b52a75409dbeffda634",
		},
		{
			tokens: ['0x20dd2f2bfa4ce3eaec5f57629583dad8a325872a'],
			tlTokens: ['0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'],
			address: '0x88817ef0545ca562530f9347b20138edecfd8e30',
		},
		{
			address: '0xed0799cadcfa593a23a629ad521c5ffde4c4c0b9',
			tlTokens: ['0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'],
		}
	],
};
console.log(JSON.stringify(balanceMsg));

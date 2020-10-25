nohup ./build/bin/efsn --datadir ./mainnet/ --rpc --rpcaddr 0.0.0.0 --rpcapi net,fsn,eth,web3 --rpcport 9001 --rpccorsdomain "*"  --gcmode=archive &

nohup ./build/bin/efsn --datadir ./mainnet/ --rpc --rpcaddr 0.0.0.0 --rpcapi net,fsn,eth,web3 --rpcport 9001 --rpccorsdomain "*" --testnet --gcmode=archive &

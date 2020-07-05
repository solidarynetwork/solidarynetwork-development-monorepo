#!/bin/bash

CHAINCODE_NAME=solidary-chain-chaincode

# in case of problems invoke something mv hyperledger-fabric-network to /tmp
# mv ~/hyperledger-fabric-network /tmp

# helper script to restart hyperledger network

clear

# lift hyperledger
npm run env:restart

# first build @solidary-chain/common-cc package else fails in deploy smart contract/chaincode
npx lerna run build --scope @solidary-chain/common-cc --stream

# deploy smart contract/chaincode
npm run cc:start -- ${CHAINCODE_NAME}
# used to debug
# npm run cc:start:debug -- ${CHAINCODE_NAME}

# sleep 20 seconds
sleep 20

# create views and indexs before seed
./couchdb/install.sh

# enroll member user "chaincodeAdmin"
node registerIdentitiesManager.js

# seed ledger
npm run seed

# prevent lost props, rebuild chaincode packages: comment this already is executed in cc:start above
# npx lerna run build --scope @solidary-chain/common-cc --stream
# npx lerna run build --scope @solidary-chain/person-cc
# npx lerna run build --scope @solidary-chain/participant-cc
# npx lerna run build --scope @solidary-chain/cause-cc
# npx lerna run build --scope @solidary-chain/transaction-cc

# invoke some stuff
npx hurl invoke ${CHAINCODE_NAME} person_get 4ea88521-031b-4279-9165-9c10e1839001

# start server/frontend
# echo "start server-rest with: 'npx lerna run start:dev --scope @solidary-chain/server-rest --stream'"
echo "start server-graphql with: 'npx lerna run start:dev --scope @solidary-chain/server-graphql --stream'"
echo "start frontend-react with: 'npx lerna run start --scope @solidary-chain/frontend-react --stream'"

# reset upgrade-chaincode version
FILE_VERSION=upgrade-chaincode.txt
echo 1.0 > FILE_VERSION
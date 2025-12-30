# Change the contract address and name if needed

forge verify-contract  \
    --verifier blockscout  \
    --verifier-url https://blockscout.taurus.autonomys.xyz/api -e ""  \
    --evm-version london --chain 490000 --compiler-version 0.8.28  \
    --watch  \
    0x505c243ec05dF81bC33295fF7C135D4D98063Da5  \
    EternalMintNfts
export const swapJson = {
    "version": "0.1.0",
    "name": "cargo_swap",
    "instructions": [
        {
            "name": "InitPool",
            "accounts": [],
            "args": [
                {
                    "name": "amountA",
                    "type": "u64"
                },
                {
                    "name": "amountB",
                    "type": "u64"
                }
            ],
            "discriminant": {
                "type": "u8",
                "value": 0
            }
        },
        {
            "name": "AddLiquidity",
            "accounts": [],
            "args": [
                {
                    "name": "amountA",
                    "type": "u64"
                },
                {
                    "name": "amountB",
                    "type": "u64"
                }
            ],
            "discriminant": {
                "type": "u8",
                "value": 1
            }
        },
        {
            "name": "RemoveLiquidity",
            "accounts": [],
            "args": [
                {
                    "name": "lpAmount",
                    "type": "u64"
                }
            ],
            "discriminant": {
                "type": "u8",
                "value": 2
            }
        },
        {
            "name": "Swap",
            "accounts": [],
            "args": [
                {
                    "name": "amountIn",
                    "type": "u64"
                },
                {
                    "name": "directionAToB",
                    "type": "bool"
                }
            ],
            "discriminant": {
                "type": "u8",
                "value": 3
            }
        },
        {
            "name": "MultihopSwap",
            "accounts": [],
            "args": [
                {
                    "name": "amountIn",
                    "type": "u64"
                },
                {
                    "name": "minimumAmountOut",
                    "type": "u64"
                }
            ],
            "discriminant": {
                "type": "u8",
                "value": 4
            }
        },
        {
            "name": "MultihopSwapWithPath",
            "accounts": [],
            "args": [
                {
                    "name": "amountIn",
                    "type": "u64"
                },
                {
                    "name": "minimumAmountOut",
                    "type": "u64"
                },
                {
                    "name": "tokenPath",
                    "type": {
                        "vec": "publicKey"
                    }
                }
            ],
            "discriminant": {
                "type": "u8",
                "value": 5
            }
        }
    ],
    "accounts": [
        {
            "name": "Pool",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "tokenA",
                        "type": "publicKey"
                    },
                    {
                        "name": "tokenB",
                        "type": "publicKey"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "reserveA",
                        "type": "u64"
                    },
                    {
                        "name": "reserveB",
                        "type": "u64"
                    },
                    {
                        "name": "totalLpSupply",
                        "type": "u64"
                    }
                ]
            }
        }
    ],
    "metadata": {
        "origin": "shank",
        "address": "8qhCTESZN9xDCHvtXFdCHfsgcctudbYdzdCFzUkTTMMe"
    }
}
import * as anchor from "@project-serum/anchor";
// import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes/index.js";
import bs58 from "bs58";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
// import { Profile } from "./profile.ts"; // auto-generated types from IDL
import "dotenv/config";

export const Profile = {
  "version": "0.1.0",
  "name": "profiles",
  "docs": [
    "A decentralized profile + UPI-style handle mapping program.",
    "- Unique username per profile (lowercase ASCII: [a-z0-9._-], 1..=32, *no '@'*)",
    "- Main wallet address pointer (wallet@username)",
    "- Arbitrary per-type mappings, e.g. nft@username, token@username, metadata@username, custom-foo@username",
    "- Reverse lookup: main_address -> username (for quick \"who is this address?\" UX)",
    "",
    "PDA layout:",
    "Profile        : [\"profile\", username]",
    "Mapping        : [\"mapping\", username, address_type]",
    "ReverseLookup  : [\"reverse\", main_address]"
  ],
  "instructions": [
    {
      "name": "createProfile",
      "docs": [
        "Create a new profile PDA for `username`. The `username` **must be already normalized**:",
        "- lowercase ASCII only ([a-z0-9._-]), length 1..=32",
        "- must NOT contain '@'",
        "The account address is derived as PDA([\"profile\", username])."
      ],
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Payer & initial authority"
          ]
        },
        {
          "name": "profile",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Profile PDA at [\"profile\", username]"
          ]
        },
        {
          "name": "reverse",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Reverse lookup for initial main address (authority pubkey)"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        },
        {
          "name": "bio",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "avatar",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "twitter",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "discord",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "website",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "setProfileDetails",
      "docs": [
        "Update bio/avatar and social links."
      ],
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "profile",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bio",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "avatar",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "twitter",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "discord",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "website",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "setMainAddress",
      "docs": [
        "Change main address pointer. Also (upsert) a reverse lookup record at [\"reverse\", new_main]."
      ],
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "profile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reverse",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "New reverse record for the updated main address"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newMain",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "setAuthority",
      "docs": [
        "Transfer profile authority (ownership)."
      ],
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "profile",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "setAddressMapping",
      "docs": [
        "Set or upsert a mapping PDA at [\"mapping\", username, address_type] -> target Pubkey.",
        "`address_type` must be normalized ASCII [a-z0-9.-], 1..=16 (e.g., \"wallet\",\"nft\",\"token\",\"metadata\",\"custom-foo\").",
        "`type_hint` is a client-defined enum tag (0=wallet,1=token,2=nft,3=metadata,4=custom)."
      ],
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "profile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mapping",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "PDA: [\"mapping\", username, address_type]"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "addressType",
          "type": "string"
        },
        {
          "name": "target",
          "type": "publicKey"
        },
        {
          "name": "typeHint",
          "type": "u8"
        }
      ]
    },
    {
      "name": "getAddressMapping",
      "docs": [
        "OPTIONAL: Emit an on-chain event with the mapping (handy for log/subscription-based UIs)."
      ],
      "accounts": [
        {
          "name": "profile",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Anyone can fetch/emit mapping"
          ]
        },
        {
          "name": "mapping",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "clearAddressMapping",
      "docs": [
        "Remove a mapping PDA and refund rent to authority."
      ],
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "profile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mapping",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "AddressMapping",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "profile",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "addressType",
            "type": "string"
          },
          {
            "name": "target",
            "type": "publicKey"
          },
          {
            "name": "extraTag",
            "type": "u8"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "Profile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "mainAddress",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "bio",
            "type": "string"
          },
          {
            "name": "avatar",
            "type": "string"
          },
          {
            "name": "twitter",
            "type": "string"
          },
          {
            "name": "discord",
            "type": "string"
          },
          {
            "name": "website",
            "type": "string"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    },
    {
      "name": "ReverseLookup",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "AuthorityChanged",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newAuthority",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "MainAddressChanged",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newMain",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "MappingCleared",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "addressType",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "MappingFetched",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "addressType",
          "type": "string",
          "index": false
        },
        {
          "name": "target",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "tag",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "MappingSet",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "addressType",
          "type": "string",
          "index": false
        },
        {
          "name": "target",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "tag",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "ProfileCreated",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mainAddress",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "username",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "ProfileUpdated",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidUsername",
      "msg": "Invalid username: only [a-z0-9._-], 1..=32, and must not contain '@'"
    },
    {
      "code": 6001,
      "name": "InvalidAddressType",
      "msg": "Invalid address type: only [a-z0-9.-], 1..=16"
    }
  ]
};

// Program ID of your deployed profiles program
const PROGRAM_ID = new PublicKey("GrJrqEtxztquco6Zsg9WfrArYwy5BZwzJ4ce4TfcJLuJ");

const RPC_ENDPOINT = 'https://rpc.gorbchain.xyz';
const WS_ENDPOINT = 'wss://rpc.gorbchain.xyz/ws/';
export const connection = new Connection(RPC_ENDPOINT, {
  commitment: 'confirmed',
  wsEndpoint: WS_ENDPOINT,
});
const PVT = process.env.PVT! as string;
// Load wallet from ~/.config/solana/id.json
const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(PVT))
  );
// Setup Anchor provider
const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(walletKeypair),
    { commitment: 'confirmed' }
  );
anchor.setProvider(provider);

const wallet = provider.wallet as anchor.Wallet;
const program = new anchor.Program(
  Profile as anchor.Idl, 
  PROGRAM_ID,
  provider
);

async function createProfile(username: string) {
  // PDA seeds
  const [profilePda] = await PublicKey.findProgramAddress(
    [Buffer.from("profile"), Buffer.from(username)],
    PROGRAM_ID
  );

  const [reversePda] = await PublicKey.findProgramAddress(
    [Buffer.from("reverse"), wallet.publicKey.toBuffer()],
    PROGRAM_ID
  );
// @ts-ignore
  const tx = await program.methods
    .createProfile(
      username,
      "My Bio",       // bio (optional string)
      "https://...",  // avatar (url)
      "@mytwitter",   // twitter
      "mydiscord#123", // discord
      "https://mysite.com" // website
    )
    .accounts({
      authority: wallet.publicKey,
      profile: profilePda,
      reverse: reversePda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log(`✅ Tx Signature: ${tx}`);
}

// createProfile("alice"); // username must be normalized (lowercase a-z0-9._-)

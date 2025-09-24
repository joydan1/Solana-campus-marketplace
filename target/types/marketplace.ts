/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/marketplace.json`.
 */
export type Marketplace = {
  "address": "Dh9qpAVZunvQrHuBiMRExS6b8ieCBMdnM3vnRa9SfLJZ",
  "metadata": {
    "name": "marketplace",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyItem",
      "discriminator": [
        80,
        82,
        193,
        201,
        216,
        27,
        70,
        184
      ],
      "accounts": [
        {
          "name": "item",
          "writable": true
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "seller",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "closeItem",
      "discriminator": [
        232,
        80,
        56,
        56,
        194,
        171,
        176,
        235
      ],
      "accounts": [
        {
          "name": "item",
          "writable": true
        },
        {
          "name": "seller",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "confirmPurchase",
      "discriminator": [
        174,
        19,
        59,
        34,
        182,
        113,
        155,
        234
      ],
      "accounts": [
        {
          "name": "item",
          "writable": true
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "seller",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "listItem",
      "discriminator": [
        174,
        245,
        22,
        211,
        228,
        103,
        121,
        13
      ],
      "accounts": [
        {
          "name": "item",
          "writable": true,
          "signer": true
        },
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "category",
          "type": "string"
        },
        {
          "name": "useEscrow",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "itemAccount",
      "discriminator": [
        203,
        112,
        16,
        182,
        215,
        183,
        63,
        175
      ]
    }
  ],
  "events": [
    {
      "name": "itemBought",
      "discriminator": [
        164,
        239,
        51,
        167,
        116,
        135,
        31,
        189
      ]
    },
    {
      "name": "itemClosed",
      "discriminator": [
        231,
        237,
        7,
        35,
        188,
        196,
        206,
        88
      ]
    },
    {
      "name": "itemConfirmed",
      "discriminator": [
        119,
        33,
        121,
        219,
        148,
        199,
        96,
        130
      ]
    },
    {
      "name": "itemListed",
      "discriminator": [
        51,
        193,
        103,
        51,
        201,
        26,
        211,
        113
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "nameTooLong",
      "msg": "Item name too long"
    },
    {
      "code": 6001,
      "name": "categoryTooLong",
      "msg": "Category too long"
    },
    {
      "code": 6002,
      "name": "alreadySold",
      "msg": "This item has already been sold"
    },
    {
      "code": 6003,
      "name": "notSold",
      "msg": "This item is not sold yet"
    },
    {
      "code": 6004,
      "name": "notAuthorized",
      "msg": "Only the authorized user can perform this action"
    },
    {
      "code": 6005,
      "name": "notEscrow",
      "msg": "Item does not use escrow"
    }
  ],
  "types": [
    {
      "name": "itemAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "category",
            "type": "string"
          },
          {
            "name": "sold",
            "type": "bool"
          },
          {
            "name": "escrow",
            "type": "bool"
          },
          {
            "name": "buyer",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "itemBought",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "escrow",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "itemClosed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "itemConfirmed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "price",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "itemListed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "category",
            "type": "string"
          },
          {
            "name": "escrow",
            "type": "bool"
          }
        ]
      }
    }
  ]
};

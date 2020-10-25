# Read ME

What the project is?

It is a blockchain browser site. Similar product you can refer are

- etherscan: https://etherscan.io/
- https://fsnex.com/

## Design style

- Follow material UI design style
  - Framework we will use: [quasar](https://quasar.dev/introduction-to-quasar) which also follows material guidelines.

- Effect I want to convey to our user
  - Simple, reliable

- Responsive

- Notice, the design should include the logo

## How we work/cooperate togther

- I will introduce the site based on the information structure, then give the detail of pages

- Deisnger ship design pages by pages so that developer can work parallely

### Pages and common components

- Site style and color platte, font size guide

- Common components
  - Site header
    - **Logo**
    - Blockchain
      - View transactions
      - View Blocks
      - View Top accounts
    - Tokens
      - Erc20 tokens
      - Fusion tokens
    - Swaps
      - swaps
      - dex
    - news(future)
    - login(future)
  - Site footer
    - please refer: https://www.fsn365.com/txs site footer

- home page
  - samples:
    - fsnex: https://fsnex.com
    - fsn365: https://fsn365.com
    - etherscan: https://etherscan.com

  - Key Information
    - Latest blocks
    - Latest transactions
    - Stats information blocks
    - Search form

- transaction list page: https://fsnex.com/transactions
  - A better way to show transaction type
  - A better way to show token flow among two addresses in a transaction


- transaction detail page: https://fsnex.com/transaction/0x95d37b05f7ed227f8f192698cf088e07119ffe754dbf69d1604517325f5494d8
  - A better way to show transaction type
  - A better way to show token flow among addresses or contracts

- block list page: https://fsnex.com/blocks
  - Add an icon before the block number(optional)

- block detail page: https://fsnex.com/block/2890115
  - Add Icon to the block page
  - Stress block number

- token list page: https://fsnex.com/tokens
  - add logo for token before token name(we need to design a common style for token that has no officialy provided icon)

- Token detail page: https://fsnex.com/token/0x0c74199d22f732039e843366a236ff4f61986b321
  - Add icon for token at token information tab
  - Stress token's verification status

- Address detail page: https://fsnex.com/address/0x71c56b08f562f53d0fb617a23f94ab2c9f8e4703
  - Add icon for token
  - A better and intuitive way to show the timelock token balance

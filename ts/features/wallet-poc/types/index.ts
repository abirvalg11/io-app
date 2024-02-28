import { CardTypes } from "./ComponentTypes";
export type Category = "bonus" | "payment" | "trasport" | "feature-x" | "other";

// Here we have a basci type definition for a wallet card
// the card can have some base properties and some specific properties
// depending on the card type.
// cardType is used to map the card to the
// specific component that will render the card.
// category is used to group the cards in the wallet.
export type WalletCardBase = {
  key: string;
  label: string;
  cardType: CardTypes;
  category: Category;
};

// A bonus card has an amount and an initiativeId
export type WalletCardBonus = {
  amount: number;
  initiativeId: string;
};

// A payment card has a circuit
export type WalletCardPayment = {
  circuit: string;
};

// A payment card has a circuit
export type WalletCardFeatureX = {
  circuit: string;
  description: string;
};

// TODO: improve type definition
export type WalletCard = WalletCardBase &
  (WalletCardBonus | WalletCardPayment | WalletCardFeatureX);
export type WalletCardType = WalletCard["cardType"];

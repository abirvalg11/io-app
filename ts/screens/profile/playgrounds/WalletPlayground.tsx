/* eslint-disable sonarjs/no-identical-functions */
import {
  ContentWrapper,
  Divider,
  ListItemNav
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { RNavScreenWithLargeHeader } from "../../../components/ui/RNavScreenWithLargeHeader";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { PaymentsOnboardingRoutes } from "../../../features/payments/onboarding/navigation/routes";

const WalletPlayground = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const navigateToWalletOnboarding = () => {
    navigation.navigate(PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR, {
      screen: PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_SELECT_METHOD
    });
  };

  const navigateToWalletPaymentPlayground = () => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.WALLET_PAYMENT_PLAYGROUND
    });
  };

  return (
    <RNavScreenWithLargeHeader
      title={{ label: "Payments playground" }}
      description="Choose the playground flow for the new wallet"
    >
      <ContentWrapper>
        {/* Onboarding Playground */}
        <ListItemNav
          value="Onboarding"
          accessibilityLabel={"Onboarding Playground"}
          description="Start the onboarding flow to add a new method of payment"
          onPress={navigateToWalletOnboarding}
        />
        <Divider />
        {/* Payment Playground */}
        <ListItemNav
          value="Payment"
          accessibilityLabel={"Onboarding Playground"}
          description="Start the payment flow to pay with a method of payment"
          onPress={navigateToWalletPaymentPlayground}
        />
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};

export default WalletPlayground;

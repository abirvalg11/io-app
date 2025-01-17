import {
  ButtonSolid,
  ContentWrapper,
  Divider,
  H2,
  IOToast,
  IOVisualCostants,
  ListItemHeader,
  ListItemInfoCopy,
  ListItemNav,
  ListItemSwitch,
  VSpacer,
  useIOTheme,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import I18n from "i18n-js";
import * as React from "react";
import { ComponentProps } from "react";
import { Alert, FlatList, ListRenderItemInfo } from "react-native";
import { AlertModal } from "../../components/ui/AlertModal";
import { LightModalContext } from "../../components/ui/LightModal";
import { isPlaygroundsEnabled } from "../../config";
import { isFastLoginEnabledSelector } from "../../features/fastLogin/store/selectors";
import { lollipopPublicKeySelector } from "../../features/lollipop/store/reducers/lollipop";
import { toThumbprint } from "../../features/lollipop/utils/crypto";
import { walletAddCoBadgeStart } from "../../features/wallet/onboarding/cobadge/store/actions";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import { sessionExpired } from "../../store/actions/authentication";
import { setDebugModeEnabled } from "../../store/actions/debug";
import {
  preferencesIdPayTestSetEnabled,
  preferencesItWalletTestSetEnabled,
  preferencesNewWalletSectionSetEnabled,
  preferencesPagoPaTestEnvironmentSetEnabled,
  preferencesPnTestEnvironmentSetEnabled
} from "../../store/actions/persistedPreferences";
import { clearCache } from "../../store/actions/profile";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import {
  sessionTokenSelector,
  walletTokenSelector
} from "../../store/reducers/authentication";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { notificationsInstallationSelector } from "../../store/reducers/notifications/installation";
import {
  isIdPayTestEnabledSelector,
  isItWalletTestEnabledSelector,
  isNewWalletSectionEnabledSelector,
  isPagoPATestEnabledSelector,
  isPnTestEnabledSelector
} from "../../store/reducers/persistedPreferences";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { getDeviceId } from "../../utils/device";
import { isDevEnv } from "../../utils/environment";

import DSEnableSwitch from "./components/DSEnableSwitch";

type PlaygroundsNavListItem = {
  value: string;
  condition?: boolean;
} & Pick<
  ComponentProps<typeof ListItemNav>,
  "description" | "testID" | "onPress"
>;

type DevDataCopyListItem = {
  value: string;
  condition?: boolean;
} & Pick<
  ComponentProps<typeof ListItemInfoCopy>,
  "label" | "testID" | "onPress"
>;

type DevActionButton = {
  condition: boolean;
} & Pick<ComponentProps<typeof ButtonSolid>, "color" | "label" | "onPress">;

const DeveloperActionsSection = () => {
  const dispatch = useIODispatch();

  const handleClearCachePress = () => {
    Alert.alert(
      I18n.t("profile.main.cache.alert"),
      undefined,
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.confirm"),
          style: "destructive",
          onPress: () => {
            dispatch(clearCache());
            IOToast.show(I18n.t("profile.main.cache.cleared"));
          }
        }
      ],
      { cancelable: false }
    );
  };

  const dumpAsyncStorage = () => {
    /* eslint-disable no-console */
    console.log("[DUMP START]");
    AsyncStorage.getAllKeys()
      .then(keys => {
        console.log(`\tAvailable keys: ${keys.join(", ")}`);
        return Promise.all(
          keys.map(key =>
            AsyncStorage.getItem(key).then(value => {
              console.log(`\tValue for ${key}\n\t\t`, value);
            })
          )
        );
      })
      .then(() => console.log("[DUMP END]"))
      .catch(e => console.error(e));
    /* eslint-enable no-console */
  };

  const devActionButtons: ReadonlyArray<DevActionButton> = [
    {
      condition: true,
      label: I18n.t("profile.main.cache.clear"),
      onPress: handleClearCachePress
    },
    {
      condition: isDevEnv,
      label: I18n.t("profile.main.forgetCurrentSession"),
      onPress: () => dispatch(sessionExpired())
    },
    {
      condition: isDevEnv,
      label: I18n.t("profile.main.clearAsyncStorage"),
      onPress: () => {
        void AsyncStorage.clear();
      }
    },
    {
      condition: isDevEnv,
      color: "primary",
      label: I18n.t("profile.main.dumpAsyncStorage"),
      onPress: dumpAsyncStorage
    }
  ];

  // Don't render the separator, even if the item is null
  const filteredDevActionButtons = devActionButtons.filter(
    item => item.condition !== false
  );

  const renderDevActionButton = ({
    item: { color = "danger", label, onPress }
  }: ListRenderItemInfo<DevActionButton>) => (
    <ButtonSolid
      fullWidth
      color={color}
      label={label}
      accessibilityLabel={label}
      onPress={onPress}
    />
  );

  return (
    <FlatList
      ListHeaderComponent={<ListItemHeader label="Actions" />}
      scrollEnabled={false}
      keyExtractor={(item: DevActionButton, index: number) =>
        `${item.label}-${index}`
      }
      contentContainerStyle={{
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      data={filteredDevActionButtons}
      renderItem={renderDevActionButton}
      ItemSeparatorComponent={() => <VSpacer size={8} />}
      ListFooterComponent={() => <VSpacer size={16} />}
    />
  );
};

const DeveloperDataSection = () => {
  const isFastLoginEnabled = useIOSelector(isFastLoginEnabledSelector);
  const sessionToken = useIOSelector(sessionTokenSelector);
  const walletToken = useIOSelector(walletTokenSelector);
  const { id: notificationId } = useIOSelector(
    notificationsInstallationSelector
  );
  const { token: notificationToken } = useIOSelector(
    notificationsInstallationSelector
  );
  const publicKey = useIOSelector(lollipopPublicKeySelector);
  const deviceUniqueId = getDeviceId();
  const thumbprint = toThumbprint(publicKey);

  const devDataCopyListItems: ReadonlyArray<DevDataCopyListItem> = [
    {
      condition: isFastLoginEnabled,
      label: "Fast Login",
      value: `${isFastLoginEnabled}`,
      onPress: () => clipboardSetStringWithFeedback(`${isFastLoginEnabled}`)
    },
    {
      condition: isDevEnv && !!sessionToken,
      label: "Session token",
      value: `${sessionToken}`,
      onPress: () => clipboardSetStringWithFeedback(`${sessionToken}`)
    },
    {
      condition: isDevEnv && !!walletToken,
      label: "Wallet token",
      value: `${walletToken}`,
      onPress: () => clipboardSetStringWithFeedback(`${walletToken}`)
    },
    {
      condition: isDevEnv,
      label: "Notification ID",
      value: `${notificationId}`,
      onPress: () => clipboardSetStringWithFeedback(`${notificationId}`)
    },
    {
      condition: isDevEnv && !!notificationToken,
      label: "Notification token",
      value: `${notificationToken}`,
      onPress: () => clipboardSetStringWithFeedback(`${notificationToken}`)
    },
    {
      label: "Device unique ID",
      value: `${deviceUniqueId}`,
      onPress: () => clipboardSetStringWithFeedback(`${deviceUniqueId}`)
    },
    {
      condition: !!thumbprint,
      label: "Thumbprint",
      value: `${thumbprint}`,
      onPress: () => clipboardSetStringWithFeedback(`${thumbprint}`)
    }
  ];

  // Don't render the separator, even if the item is null
  const filteredDevDataCopyListItems = devDataCopyListItems.filter(
    item => item.condition !== false
  );

  const renderDevDataCopyItem = ({
    item: { label, value, onPress, testID, condition }
  }: ListRenderItemInfo<DevDataCopyListItem>) => {
    // If condition is either true or undefined, render the item
    if (condition !== false) {
      return (
        <ListItemInfoCopy
          label={label}
          value={value}
          onPress={onPress}
          testID={testID}
          accessibilityLabel={value}
          numberOfLines={5}
        />
      );
    } else {
      return null;
    }
  };

  return (
    <FlatList
      ListHeaderComponent={<ListItemHeader label="Data" />}
      scrollEnabled={false}
      keyExtractor={(item: DevDataCopyListItem, index: number) =>
        `${item.value}-${index}`
      }
      contentContainerStyle={{
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      data={filteredDevDataCopyListItems}
      renderItem={renderDevDataCopyItem}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
};

const DesignSystemSection = () => {
  const navigation = useIONavigation();
  const { themeType, setTheme } = useIOThemeContext();
  const dispatch = useIODispatch();

  const isNewWalletSectionEnabled = useIOSelector(
    isNewWalletSectionEnabledSelector
  );

  const onNewWalletSectionToggle = (enabled: boolean) => {
    dispatch(
      preferencesNewWalletSectionSetEnabled({
        isNewWalletSectionEnabled: enabled
      })
    );
  };

  return (
    <ContentWrapper>
      <ListItemHeader label="Human Interface" />

      <ListItemNav
        value={I18n.t("profile.main.designSystem")}
        accessibilityLabel={I18n.t("profile.main.designSystem")}
        onPress={() =>
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.DESIGN_SYSTEM
          })
        }
      />
      <Divider />
      <DSEnableSwitch />
      <Divider />
      <ListItemSwitch
        label="Abilita Dark Mode"
        value={themeType === "dark"}
        onSwitchValueChange={() =>
          setTheme(themeType === "dark" ? "light" : "dark")
        }
      />
      <Divider />
      <ListItemSwitch
        label={I18n.t("profile.main.newWalletSection")}
        value={isNewWalletSectionEnabled}
        onSwitchValueChange={onNewWalletSectionToggle}
      />
    </ContentWrapper>
  );
};

const PlaygroundsSection = () => {
  const navigation = useIONavigation();
  const isIdPayTestEnabled = useIOSelector(isIdPayTestEnabledSelector);
  const isItWalletTestEnabled = useIOSelector(isItWalletTestEnabledSelector);
  const playgroundsNavListItems: ReadonlyArray<PlaygroundsNavListItem> = [
    {
      value: "Lollipop",
      onPress: () =>
        navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
          screen: ROUTES.LOLLIPOP_PLAYGROUND
        })
    },
    {
      value: "Markdown",
      onPress: () =>
        navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
          screen: ROUTES.MARKDOWN_PLAYGROUND
        })
    },
    {
      value: "CGN Landing Page",
      onPress: () =>
        navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
          screen: ROUTES.CGN_LANDING_PLAYGROUND
        })
    },
    {
      condition: isIdPayTestEnabled,
      value: "IDPay Onboarding",
      onPress: () =>
        navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
          screen: ROUTES.IDPAY_ONBOARDING_PLAYGROUND
        })
    },
    {
      condition: isIdPayTestEnabled,
      value: "IDPay Code",
      onPress: () =>
        navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
          screen: ROUTES.IDPAY_CODE_PLAYGROUND
        })
    },
    {
      condition: isItWalletTestEnabled,
      value: "IT Wallet",
      onPress: () =>
        navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
          screen: ROUTES.ITW_PLAYGROUND
        })
    }
  ];

  // Don't render the separator, even if the item is null
  const filteredPlaygroundsNavListItems = playgroundsNavListItems.filter(
    item => item.condition !== false
  );

  const renderPlaygroundsNavItem = ({
    item: { value, onPress, testID, condition }
  }: ListRenderItemInfo<PlaygroundsNavListItem>) => {
    // If condition is either true or undefined, render the item
    if (condition !== false) {
      return (
        <ListItemNav
          accessibilityLabel={value}
          value={value}
          onPress={onPress}
          testID={testID}
        />
      );
    } else {
      return null;
    }
  };

  return (
    <FlatList
      ListHeaderComponent={<ListItemHeader label="Playground" />}
      scrollEnabled={false}
      keyExtractor={(item: PlaygroundsNavListItem, index: number) =>
        `${item.value}-${index}`
      }
      contentContainerStyle={{
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      data={filteredPlaygroundsNavListItems}
      renderItem={renderPlaygroundsNavItem}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
};

const DeveloperTestEnvironmentSection = ({
  handleShowModal
}: {
  handleShowModal: () => void;
}) => {
  const dispatch = useIODispatch();
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);
  const isPnTestEnabled = useIOSelector(isPnTestEnabledSelector);
  const isIdPayTestEnabled = useIOSelector(isIdPayTestEnabledSelector);
  const isItWalletTestEnabled = useIOSelector(isItWalletTestEnabledSelector);
  const onAddTestCard = () => {
    if (!isPagoPATestEnabled) {
      Alert.alert(
        I18n.t("profile.main.addCard.warning.title"),
        I18n.t("profile.main.addCard.warning.message"),
        [
          {
            text: I18n.t("profile.main.addCard.warning.closeButton"),
            style: "cancel"
          }
        ],
        { cancelable: false }
      );
      return;
    }
    dispatch(walletAddCoBadgeStart(undefined));
  };

  const onPagoPAEnvironmentToggle = (enabled: boolean) => {
    if (enabled) {
      Alert.alert(
        I18n.t("profile.main.pagoPaEnvironment.alertConfirmTitle"),
        I18n.t("profile.main.pagoPaEnvironment.alertConfirmMessage"),
        [
          {
            text: I18n.t("global.buttons.cancel"),
            style: "cancel"
          },
          {
            text: I18n.t("global.buttons.confirm"),
            style: "destructive",
            onPress: () => {
              dispatch(
                preferencesPagoPaTestEnvironmentSetEnabled({
                  isPagoPATestEnabled: enabled
                })
              );
              handleShowModal();
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      dispatch(
        preferencesPagoPaTestEnvironmentSetEnabled({
          isPagoPATestEnabled: enabled
        })
      );
      handleShowModal();
    }
  };

  const onPnEnvironmentToggle = (enabled: boolean) => {
    dispatch(
      preferencesPnTestEnvironmentSetEnabled({ isPnTestEnabled: enabled })
    );
  };

  const onIdPayTestToggle = (enabled: boolean) => {
    dispatch(preferencesIdPayTestSetEnabled({ isIdPayTestEnabled: enabled }));
    handleShowModal();
  };

  const onItWalletTestToggle = (enabled: boolean) => {
    dispatch(
      preferencesItWalletTestSetEnabled({ isItWalletTestEnabled: enabled })
    );
  };
  return (
    <ContentWrapper>
      <ListItemHeader
        label={I18n.t("profile.main.testEnvironmentSectionHeader")}
      />
      <ListItemSwitch
        label={I18n.t("profile.main.pagoPaEnvironment.pagoPaEnv")}
        description={I18n.t("profile.main.pagoPaEnvironment.pagoPAEnvAlert")}
        value={isPagoPATestEnabled}
        onSwitchValueChange={onPagoPAEnvironmentToggle}
      />
      <Divider />
      {/* Add Test Card CTA */}
      <ListItemNav
        value={I18n.t("profile.main.addCard.titleSection")}
        accessibilityLabel={I18n.t("profile.main.addCard.titleSection")}
        onPress={onAddTestCard}
      />
      <Divider />
      <ListItemSwitch
        label={I18n.t("profile.main.pnEnvironment.pnEnv")}
        value={isPnTestEnabled}
        onSwitchValueChange={onPnEnvironmentToggle}
      />
      <Divider />
      <ListItemSwitch
        label={I18n.t("profile.main.idpay.idpayTest")}
        description={I18n.t("profile.main.idpay.idpayTestAlert")}
        value={isIdPayTestEnabled}
        onSwitchValueChange={onIdPayTestToggle}
      />
      <ListItemSwitch
        label={I18n.t("profile.main.itWallet.itWalletTest")}
        description={I18n.t("profile.main.itWallet.itWalletTestDescription")}
        value={isItWalletTestEnabled}
        onSwitchValueChange={onItWalletTestToggle}
      />
    </ContentWrapper>
  );
};

const DeveloperModeSection = () => {
  const { showModal } = React.useContext(LightModalContext);
  const dispatch = useIODispatch();
  const isDebugModeEnabled = useIOSelector(isDebugModeEnabledSelector);

  const theme = useIOTheme();

  const handleShowModal = () => {
    showModal(
      <AlertModal
        message={I18n.t("profile.main.pagoPaEnvironment.alertMessage")}
      />
    );
  };

  return (
    <>
      <ContentWrapper>
        <VSpacer size={24} />
        <H2 color={theme["textHeading-default"]}>
          {I18n.t("profile.main.developersSectionHeader")}
        </H2>
        <VSpacer size={8} />

        {/* Enable/Disable Developer Mode */}
        <ListItemSwitch
          label={I18n.t("profile.main.debugMode")}
          value={isDebugModeEnabled}
          onSwitchValueChange={enabled =>
            dispatch(setDebugModeEnabled(enabled))
          }
        />
      </ContentWrapper>

      <VSpacer size={8} />

      {/* Playgrounds */}
      {isPlaygroundsEnabled && <PlaygroundsSection />}

      <VSpacer size={24} />

      {/* Test Environments */}
      <DeveloperTestEnvironmentSection handleShowModal={handleShowModal} />

      <VSpacer size={24} />

      {/* Human Interface/Design System */}
      <DesignSystemSection />

      {/* Data */}
      {isDebugModeEnabled && (
        <>
          <VSpacer size={24} />
          <DeveloperDataSection />
        </>
      )}

      {/* Actions */}
      {isDebugModeEnabled && (
        <>
          <VSpacer size={32} />
          <DeveloperActionsSection />
        </>
      )}
    </>
  );
};

export default DeveloperModeSection;

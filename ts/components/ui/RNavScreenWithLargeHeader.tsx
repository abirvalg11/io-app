import {
  Body,
  ContentWrapper,
  H2,
  HeaderSecondLevel,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React, { ComponentProps, useLayoutEffect, useState } from "react";
import { LayoutChangeEvent, View, Image } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BackProps,
  HeaderActionProps,
  useHeaderProps
} from "../../hooks/useHeaderProps";
import { SupportRequestParams } from "../../hooks/useStartSupportRequest";
import I18n from "../../i18n";

export type LargeHeaderTitleProps = {
  label: string;
  heroImage?: ComponentProps<typeof Image>["source"];
  testID?: string;
};

type Props = {
  children: React.ReactNode;
  fixedBottomSlot?: React.ReactNode;
  title: LargeHeaderTitleProps;
  description?: string;
  goBack?: BackProps["goBack"];
  headerActionsProp?: HeaderActionProps;
  canGoback?: boolean;
} & SupportRequestParams;

/**
 * A screen with a large header that can be used as a template for other screens.
 * It also handles the contextual help and the faq. The usage of LargeHeader naming is due to a similar behaviour
 * offered by react-navigation/native-stack, referencing the native API from iOS platform.
 * @param children
 * @param fixedBottomSlot An optional React node that is fixed to the bottom of the screen. Useful for buttons or other actions. It will be positioned outside the main `ScrollView`.
 * @param title
 * @param titleTestID
 * @param contextualHelp
 * @param contextualHelpMarkdown
 * @param faqCategories
 * @param headerProps
 * @param canGoback allows to show/not show the back button and consequently does not pass to the HeaderSecondLevel the props that would display the back button
 */
export const RNavScreenWithLargeHeader = ({
  children,
  fixedBottomSlot,
  title,
  goBack,
  canGoback = true,
  description,
  contextualHelp,
  contextualHelpMarkdown,
  faqCategories,
  headerActionsProp = {}
}: Props) => {
  const [titleHeight, setTitleHeight] = useState(0);
  const translationY = useSharedValue(0);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const getTitleHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setTitleHeight(height);
  };

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    translationY.value = event.contentOffset.y;
  });

  const headerPropsWithoutGoBack = {
    title: title.label,
    scrollValues: {
      contentOffsetY: translationY,
      triggerOffset: titleHeight
    },
    contextualHelp,
    contextualHelpMarkdown,
    faqCategories,
    ...headerActionsProp
  };

  const headerProps: ComponentProps<typeof HeaderSecondLevel> = useHeaderProps(
    canGoback
      ? {
          ...headerPropsWithoutGoBack,
          backAccessibilityLabel: I18n.t("global.buttons.back"),
          goBack: goBack ?? navigation.goBack
        }
      : headerPropsWithoutGoBack
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <HeaderSecondLevel {...headerProps} />
    });
  }, [headerProps, navigation]);

  return (
    <>
      <Animated.ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom,
          flexGrow: 1
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={8}
        snapToOffsets={[0, titleHeight]}
        snapToEnd={false}
        decelerationRate="normal"
      >
        <View
          onLayout={getTitleHeight}
          accessible={false}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        >
          {title.heroImage && (
            <>
              <Image
                source={title.heroImage}
                style={{ width: "100%", height: 270, resizeMode: "stretch" }}
              />
              <VSpacer size={24} />
            </>
          )}
          <H2
            style={IOStyles.horizontalContentPadding}
            testID={title.testID}
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants"
            accessible={false}
          >
            {title.label}
          </H2>
        </View>

        {description && (
          <ContentWrapper>
            <VSpacer size={4} />
            <Body color="grey-700">{description}</Body>
          </ContentWrapper>
        )}

        <VSpacer size={16} />

        {children}
      </Animated.ScrollView>
      {fixedBottomSlot}
    </>
  );
};

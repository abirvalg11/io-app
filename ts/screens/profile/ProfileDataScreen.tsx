import { ContentWrapper } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { connect } from "react-redux";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import { isEmailUniquenessValidationEnabledSelector } from "../../features/fastLogin/store/selectors";
import I18n from "../../i18n";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import {
  hasProfileEmailSelector,
  isProfileEmailValidatedSelector,
  profileEmailSelector,
  profileNameSurnameSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";

type Props = ReturnType<typeof mapStateToProps>;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.contextualHelpTitle",
  body: "profile.preferences.contextualHelpContent"
};

const ProfileDataScreen: React.FC<Props> = ({
  profileEmail,
  isEmailValidated,
  isEmailUniquenessValidationEnabled,
  hasProfileEmail,
  nameSurname
}): React.ReactElement => {
  const navigation = useIONavigation();

  const navigateToInsertEmailScreen = React.useCallback(() => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.INSERT_EMAIL_SCREEN,
      params: {
        isOnboarding: false
      }
    });
  }, [navigation]);

  const navigateToReadEmailScreen = React.useCallback(() => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.READ_EMAIL_SCREEN
    });
  }, [navigation]);

  const onPressEmail = () => {
    if (hasProfileEmail) {
      if (isEmailUniquenessValidationEnabled) {
        navigateToInsertEmailScreen();
      } else {
        navigateToReadEmailScreen();
      }
    } else {
      navigateToInsertEmailScreen();
    }
  };
  return (
    <RNavScreenWithLargeHeader
      title={{
        label: I18n.t("profile.data.title")
      }}
      description={I18n.t("profile.data.subtitle")}
      headerActionsProp={{ showHelp: true }}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["profile", "privacy", "authentication_SPID"]}
    >
      <ContentWrapper>
        {/* Show name and surname */}
        {nameSurname && (
          <ListItemComponent
            title={I18n.t("profile.data.list.nameSurname")}
            subTitle={nameSurname}
            hideIcon
            testID="name-surname"
          />
        )}
        {/* Insert or edit email */}
        <ListItemComponent
          title={I18n.t("profile.data.list.email")}
          subTitle={pipe(
            profileEmail,
            O.getOrElse(() => I18n.t("global.remoteStates.notAvailable"))
          )}
          titleBadge={
            !isEmailValidated
              ? I18n.t("profile.data.list.need_validate")
              : undefined
          }
          onPress={onPressEmail}
          testID="insert-or-edit-email"
        />
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  profileEmail: profileEmailSelector(state),
  isEmailValidated: isProfileEmailValidatedSelector(state),
  hasProfileEmail: hasProfileEmailSelector(state),
  nameSurname: profileNameSurnameSelector(state),
  isEmailUniquenessValidationEnabled:
    isEmailUniquenessValidationEnabledSelector(state)
});

export default connect(mapStateToProps)(ProfileDataScreen);

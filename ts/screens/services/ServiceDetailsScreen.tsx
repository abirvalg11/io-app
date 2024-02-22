import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useEffect, useState } from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import { Route, useRoute } from "@react-navigation/native";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { SpecialServiceMetadata } from "../../../definitions/backend/SpecialServiceMetadata";
import { IOStyles } from "../../components/core/variables/IOStyles";
import ExtractedCTABar from "../../components/cta/ExtractedCTABar";
import OrganizationHeader from "../../components/OrganizationHeader";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ContactPreferencesToggles from "../../components/services/ContactPreferencesToggles";
import ServiceMetadataComponent from "../../components/services/ServiceMetadata";
import SpecialServicesCTA from "../../components/services/SpecialServices/SpecialServicesCTA";
import TosAndPrivacyBox from "../../components/services/TosAndPrivacyBox";
import LegacyMarkdown from "../../components/ui/Markdown/LegacyMarkdown";
import { FooterTopShadow } from "../../components/FooterTopShadow";
import I18n from "../../i18n";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import { loadServiceDetail } from "../../store/actions/services";
import { Dispatch } from "../../store/actions/types";
import { contentSelector } from "../../store/reducers/content";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { serviceByIdSelector } from "../../store/reducers/entities/services/servicesById";
import {
  isEmailEnabledSelector,
  isInboxEnabledSelector,
  isProfileEmailValidatedSelector,
  profileSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { getServiceCTA } from "../../features/messages/utils/messages";
import { logosForService } from "../../utils/services";
import { handleItemOnPress } from "../../utils/url";
import { useIOSelector } from "../../store/hooks";

export type ServiceDetailsScreenNavigationParams = Readonly<{
  serviceId: ServiceId;
  // if true the service should be activated automatically
  // as soon as the screen is shown (used for custom activation
  // flows like PN)
  activate?: boolean;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type SpecialServiceWrapper = {
  isSpecialService: boolean;
  customSpecialFlowOpt?: string;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "serviceDetail.headerTitle",
  body: "serviceDetail.contextualHelpContent"
};

/**
 * Screen displaying the details of a selected service. The user
 * can enable/disable the service and customize the notification settings.
 */
const ServiceDetailsScreen = (props: Props) => {
  const [isMarkdownLoaded, setIsMarkdownLoaded] = useState(false);
  const navigation = useIONavigation();
  const { serviceId, activate } =
    useRoute<Route<"SERVICE_DETAIL", ServiceDetailsScreenNavigationParams>>()
      .params;

  const service = useIOSelector(state =>
    pipe(serviceByIdSelector(state, serviceId), pot.toUndefined)
  );

  // const serviceId = props.route.params.serviceId;
  // const activate = props.route.params.activate;

  const { loadServiceDetail } = props;
  useEffect(() => {
    loadServiceDetail(serviceId);
  }, [serviceId, loadServiceDetail]);

  const onMarkdownEnd = () => setIsMarkdownLoaded(true);

  // This has been considered just to avoid compiling errors
  // once we navigate from list or a message we always have the service data since they're previously loaded
  if (service === undefined) {
    return null;
  }

  const metadata = service.service_metadata;

  // if markdown content is not available, render immediately what is possible
  // but we must wait for metadata load to be completed to avoid flashes
  const isMarkdownAvailable = metadata?.description;
  // if markdown data is available, wait for it to be rendered
  const canRenderItems = isMarkdownAvailable ? isMarkdownLoaded : true;

  const specialServiceInfoOpt = SpecialServiceMetadata.is(metadata)
    ? ({
        isSpecialService: true,
        customSpecialFlowOpt: metadata.custom_special_flow
      } as SpecialServiceWrapper)
    : undefined;

  const maybeCTA = getServiceCTA(metadata);
  const showCTA =
    (O.isSome(maybeCTA) || !!specialServiceInfoOpt) && canRenderItems;

  return (
    <BaseScreenComponent
      goBack={() => navigation.goBack()}
      headerTitle={I18n.t("serviceDetail.headerTitle")}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["services_detail"]}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={IOStyles.flex}>
          <ContentWrapper>
            <OrganizationHeader
              serviceName={service.service_name}
              organizationName={service.organization_name}
              logoURLs={logosForService(service)}
            />
            <VSpacer size={8} />

            {metadata?.description && (
              <>
                <LegacyMarkdown
                  animated={true}
                  onLoadEnd={onMarkdownEnd}
                  onError={onMarkdownEnd}
                >
                  {metadata.description}
                </LegacyMarkdown>
                <VSpacer size={24} />
              </>
            )}

            {canRenderItems && (
              <>
                {metadata && (
                  <>
                    <TosAndPrivacyBox
                      tosUrl={metadata.tos_url}
                      privacyUrl={metadata.privacy_url}
                    />
                    <VSpacer size={24} />
                  </>
                )}

                <ContactPreferencesToggles
                  serviceId={service.service_id}
                  channels={service.available_notification_channels}
                  isSpecialService={!!specialServiceInfoOpt}
                  customSpecialFlowOpt={
                    specialServiceInfoOpt?.customSpecialFlowOpt
                  }
                />
                <VSpacer size={24} />

                <ServiceMetadataComponent
                  servicesMetadata={service.service_metadata}
                  organizationFiscalCode={service.organization_fiscal_code}
                  getItemOnPress={handleItemOnPress}
                  serviceId={service.service_id}
                  isDebugModeEnabled={props.isDebugModeEnabled}
                />

                <EdgeBorderComponent />
              </>
            )}
          </ContentWrapper>
        </ScrollView>

        {showCTA && (
          <FooterTopShadow>
            {O.isSome(maybeCTA) && (
              <View style={IOStyles.row}>
                <ExtractedCTABar
                  ctas={maybeCTA.value}
                  dispatch={props.dispatch}
                  serviceMetadata={metadata}
                  service={service}
                />
              </View>
            )}
            {!!specialServiceInfoOpt && (
              <>
                <VSpacer size={8} />
                <SpecialServicesCTA
                  serviceId={serviceId}
                  customSpecialFlowOpt={
                    specialServiceInfoOpt.customSpecialFlowOpt
                  }
                  activate={activate}
                />
              </>
            )}
          </FooterTopShadow>
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  isInboxEnabled: isInboxEnabledSelector(state),
  isEmailEnabled: isEmailEnabledSelector(state),
  isEmailValidated: isProfileEmailValidatedSelector(state),
  content: contentSelector(state),
  profile: profileSelector(state),
  isDebugModeEnabled: isDebugModeEnabledSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadServiceDetail: (id: ServiceId) => dispatch(loadServiceDetail.request(id)),
  dispatch
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServiceDetailsScreen);

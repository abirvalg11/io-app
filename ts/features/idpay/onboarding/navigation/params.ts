import { IdPayOnboardingNavigatorParams } from "./navigator";
import { IdPayOnboardingRoutes } from "./routes";

export type IdPayOnboardingParamsList = {
  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN]: IdPayOnboardingNavigatorParams;
  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS]: undefined;
  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS]: undefined;
  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE]: undefined;
  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION]: undefined;
  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE]: undefined;
  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS]: undefined;
};

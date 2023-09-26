import { PidData } from "@pagopa/io-react-native-cie-pid";
import I18n from "../../../i18n";

export const ISSUER_URL = "https://www.interno.gov.it/pid/";

export const pidDataMock: PidData = {
  name: "Mario",
  surname: "Rossi",
  fiscalCode: "RSSMRA80L05F593A",
  birthDate: "1980-01-10"
};

enum AssuranceLevel {
  HIGH = "high"
}

export const mapAssuranceLevel = (level: AssuranceLevel | string) => {
  switch (level) {
    case AssuranceLevel.HIGH:
      return I18n.t(
        "features.itWallet.verifiableCredentials.claims.securityLevels.high"
      );
    default:
      return I18n.t(
        "features.itWallet.verifiableCredentials.claims.securityLevels.na"
      );
  }
};

export const FEDERATION_ENTITY = {
  organization_name: "Comune di Milano",
  homepage_uri: "https://www.comune.milano.it/",
  policy_uri: "https://www.comune.milano.it/privacy",
  logo_uri: "https://www.comune.milano.it/logo.png",
  contacts: "https://www.comune.milano.it/contacts"
};
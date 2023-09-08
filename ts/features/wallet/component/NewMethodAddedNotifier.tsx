import { useState } from "react";
import { connect } from "react-redux";
import { GlobalState } from "../../../store/reducers/types";
import { useActionOnFocus } from "../../../utils/hooks/useOnFocus";
import bancomatInformationBottomSheet from "../bancomat/utils/bancomatInformationBottomSheet";
import { onboardingBancomatAddedPansSelector } from "../onboarding/bancomat/store/reducers/addedPans";

type Props = ReturnType<typeof mapStateToProps>;

/**
 * Handle the notification for a new payment method added
 * TODO: add other methods, handle only bancomat atm
 * @constructor
 */
const NewPaymentMethodAddedNotifier = (props: Props) => {
  // Save the latest visualized bottom sheet, in order to avoid to show it again if focus changed
  const [lastNotifiedBancomatHash, setLastNotifiedBancomatHash] =
    useState<string>("");

  const { present, bottomSheet } = bancomatInformationBottomSheet();

  useActionOnFocus(() => {
    const lastAddedHash = props.addedBancomat.reduce(
      (acc, val) => acc + val.idWallet.toString(),
      ""
    );
    // a new set of bancomat has been added and no bottomsheet has been dispayed
    if (lastAddedHash !== "" && lastNotifiedBancomatHash !== lastAddedHash) {
      setLastNotifiedBancomatHash(lastAddedHash);
      void present();
    }
  });

  return bottomSheet;
};

const mapStateToProps = (state: GlobalState) => ({
  addedBancomat: onboardingBancomatAddedPansSelector(state)
});

export default connect(mapStateToProps)(NewPaymentMethodAddedNotifier);

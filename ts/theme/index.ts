/**
 * This file exports a function to create the whole theme of the application.
 * It takes our custom variables and mixes them with each defined component theme.
 */
import merge from "lodash/merge";
import getTheme from "native-base/src/theme/components";

import baseScreenComponentTheme from "./components/BaseScreenComponent";
import buttonTheme from "./components/Button";
import headerTheme from "./components/Header";
import inputTheme from "./components/Input";
import itemTheme from "./components/Item";
import listItemTheme from "./components/ListItem";
import maskedInputTheme from "./components/MaskedInput";
import textTheme from "./components/Text";
import { Theme } from "./types";
import variables from "./variables";

const theme = (): Theme => {
  const nbTheme = getTheme(variables);
  const overrides = {
    "NativeBase.Button": {
      ...buttonTheme()
    },
    "NativeBase.Header": {
      ...headerTheme()
    },
    "NativeBase.Item": {
      ...itemTheme()
    },
    "NativeBase.Text": {
      ...textTheme()
    },
    "NativeBase.Input": {
      ...inputTheme()
    },
    "NativeBase.ListItem": {
      ...listItemTheme()
    },
    "UIComponent.BaseScreenComponent": {
      ...baseScreenComponentTheme()
    },
    "UIComponent.MaskedInput": {
      ...maskedInputTheme()
    }
  };

  // We need ad deep merge
  return merge(nbTheme, overrides);
};

export default theme;

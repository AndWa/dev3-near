import { withTheme } from "@rjsf/core";

import BaseInputTemplate from "./BaseInputTemplate";
import SubmitButton from "./SubmitButton";
import FieldTemplate from "./FieldTemplate";
import DescriptionField from "./DescriptionField";
import TitleField from "./TitleField";
import ObjectFieldTemplate from "./ObjectFieldTemplate";

export const Form = withTheme({
  templates: {
    BaseInputTemplate,
    DescriptionFieldTemplate: DescriptionField,
    FieldTemplate,
    ObjectFieldTemplate,
    TitleFieldTemplate: TitleField,
    ButtonTemplates: {
      SubmitButton,
    },
  },
});

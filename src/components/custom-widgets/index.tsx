// Custom widgets which depend on external state.
// They are registed to HDSForm/HDSTabbedForm via customWidgets property.

import HDSWidgets from "../HDSWidgets";
import { Indexable } from "../HDSForm";
import { WidgetProps } from "@rjsf/core";

export interface CustomWidgetsProps {
  hrnList: { hrn: string; label: string }[];
}

export function createCustomWidgets(props: CustomWidgetsProps): Indexable {
  // Usage in uiSchema for a HRN property: "ui:widget": "hrnSelect".
  // If HRN schema property has a pattern, the projectHrns are filtered by it.
  const HrnSelectWidget = (widgetProps: WidgetProps) => {
    console.assert(props.hrnList, "Missing projectHrns!");
    let projectHrns = props.hrnList;
    if (widgetProps.schema.pattern) {
      const pattern = widgetProps.schema.pattern;
      projectHrns = projectHrns.filter(
        (value) => value.hrn.match(pattern) != null
      );
    }
    const enumOptions = projectHrns.map((option) => ({
      value: option.hrn,
      label: option.label + " [" + option.hrn + "]",
    }));
    widgetProps.options.enumOptions = enumOptions;
    return HDSWidgets.SelectWidget(widgetProps);
  };

  return {
    hrnSelect: HrnSelectWidget,
  };
}

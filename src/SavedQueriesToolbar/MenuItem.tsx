import { ReactNode } from "react";
import { ThemeUICSSObject } from "theme-ui";

import { Chip, Flex, FontSize, Text } from "@edgeandnode/components";

export interface MenuItemProps {
  header: string;
  className: string;
  isSelected: boolean;
  isDefault: boolean;
  onClick: () => void;
  icon?: ReactNode;
  textStyle?: ThemeUICSSObject;
}

export function MenuItem(props: MenuItemProps) {
  return (
    <Flex direction="row" align="center">
      {props.icon}
      {/* analogous to .new-query className: color: #4bca81; */}
      <Text
        weight="SEMIBOLD"
        sx={{
          opacity: props.isSelected ? 1 : 0.7,
          ...props.textStyle,
        }}
      >
        {props.header}
        {props.isDefault && (
          <Chip sx={{ fontSize: FontSize["12px"] }}>Default</Chip>
        )}
      </Text>
    </Flex>
  );
}

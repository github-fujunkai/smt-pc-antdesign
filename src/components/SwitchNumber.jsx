import React from "react";
import { Switch } from "antd";

export default function SwitchNumber({
    value,
    onChange,
    ...restProps
}) {
    return (
        <Switch
            value={!!value}
            onChange={(val) => onChange && onChange(Number(val))}
            {...restProps}
        />
    );
}

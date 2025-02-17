import React, { useState, useContext, useMemo } from 'react';
import classNames from 'classnames';
import {
  FilterDropdown,
  FieldLabel,
  isDropdownValueType,
  useMountMergeState,
  omitUndefined,
} from '@ant-design/pro-utils';
import { ConfigProvider } from 'antd';

import './index.less';
import type { LightFilterFooterRender } from '../../interface';

export type SizeType = 'small' | 'middle' | 'large' | undefined;

export type LightWrapperProps = {
  label?: React.ReactNode;
  disabled?: boolean;
  placeholder?: React.ReactNode;
  size?: SizeType;
  value?: any;
  onChange?: (value?: any) => void;
  onBlur?: (value?: any) => void;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  valuePropName: string;
  customLightMode?: boolean;
  light?: boolean;
  id?: string;
  labelFormatter?: (value: any) => string;
  bordered?: boolean;
  otherFieldProps?: any;
  footerRender?: LightFilterFooterRender;
};

const LightWrapper: React.ForwardRefRenderFunction<any, LightWrapperProps> = (props) => {
  const {
    label,
    size,
    disabled,
    onChange: propsOnChange,
    onBlur,
    className,
    style,
    children,
    valuePropName,
    light,
    customLightMode,
    placeholder,
    id,
    labelFormatter,
    bordered,
    value,
    otherFieldProps,
  } = props;

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('pro-field-light-wrapper');
  const [tempValue, setTempValue] = useState<string | undefined>(props[valuePropName]);
  const [open, setOpen] = useMountMergeState<boolean>(false);
  const isDropdown =
    React.isValidElement(children) && isDropdownValueType(children.props.valueType);

  const onChange = (...restParams: any[]) => {
    otherFieldProps?.onChange?.(...restParams);
    propsOnChange?.(...restParams);
  };

  const isLight = useMemo(() => {
    if (!light || customLightMode || isDropdown) {
      return true;
    }
    return false;
  }, [customLightMode, isDropdown, light]);

  const childrenIsValidElement = useMemo(
    () => children && React.isValidElement(children),
    [children],
  );

  const allowClear = useMemo(() => {
    if (isLight) return undefined;
    if (childrenIsValidElement) return (children as JSX.Element)?.props?.fieldProps?.allowClear;
    return undefined;
  }, [children, childrenIsValidElement, isLight]);

  const footerRender = useMemo(() => {
    if (isLight) return undefined;
    if (childrenIsValidElement) return (children as JSX.Element)?.props.footerRender;
    return undefined;
  }, [children, childrenIsValidElement, isLight]);

  if (isLight) {
    if (React.isValidElement(children)) {
      return React.cloneElement(
        children,
        omitUndefined({
          value,
          onBlur,
          ...children.props,
          fieldProps: omitUndefined({
            id,
            [valuePropName]: props[valuePropName],
            // 优先使用 children.props.fieldProps，比如 LightFilter 中可能需要通过 fieldProps 覆盖 Form.Item 默认的 onChange
            ...children.props.fieldProps,
            // 这个 onChange 是 Form.Item 添加上的，要通过 fieldProps 透传给 ProField 调用
            onChange,
            onBlur,
          }),
        }),
      );
    }
    return children as JSX.Element;
  }

  const labelValue = props[valuePropName];

  return (
    <FilterDropdown
      disabled={disabled}
      onVisibleChange={setOpen}
      visible={open}
      label={
        <FieldLabel
          ellipsis
          size={size}
          onClear={() => {
            onChange?.();
            setTempValue(undefined);
          }}
          bordered={bordered}
          style={style}
          className={className}
          label={label}
          placeholder={placeholder}
          value={labelValue}
          disabled={disabled}
          expanded={open}
          formatter={labelFormatter}
          allowClear={allowClear}
        />
      }
      footer={{
        onClear: () => setTempValue(undefined),
        onConfirm: () => {
          onChange?.(tempValue);
          setOpen(false);
        },
      }}
      footerRender={footerRender}
    >
      <div className={classNames(`${prefixCls}-container`, className)} style={style}>
        {React.isValidElement(children)
          ? React.cloneElement(children, {
              ...children.props,
              fieldProps: {
                className: `${prefixCls}-field`,
                [valuePropName]: tempValue,
                id,
                onChange: (e: any) => {
                  setTempValue(e?.target ? e.target.value : e);
                },
                allowClear,
                ...children.props.fieldProps,
              },
            })
          : children}
      </div>
    </FilterDropdown>
  );
};

export default LightWrapper;

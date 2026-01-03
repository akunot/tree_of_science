import React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

/**
 * Wrapper sencillo sobre @radix-ui/react-switch
 * Uso: <Switch checked={checked} onCheckedChange={setChecked} />
 */
export const Switch = React.forwardRef(function Switch(
  { checked = false, onCheckedChange, className = '', ...props },
  ref
) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={
        `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ` +
        `${checked ? 'bg-blue-600' : 'bg-gray-200'} ` +
        className
      }
      checked={checked}
      onCheckedChange={onCheckedChange}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={
          `block h-5 w-5 transform rounded-full bg-white shadow transition-transform ` +
          `${checked ? 'translate-x-5' : 'translate-x-1'}`
        }
      />
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = 'Switch';
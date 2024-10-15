import { cn } from '@/lib/utils/style';
import { ClockIcon } from '@radix-ui/react-icons';
import { useRef } from 'react';
import { useDateSegment, useLocale, useTimeField } from 'react-aria';
import { TimeFieldStateOptions, useTimeFieldState } from 'react-stately';

export function TimePicker(props: Omit<TimeFieldStateOptions, 'locale'>) {
  let { locale } = useLocale();
  let state = useTimeFieldState({
    ...props,
    locale
  });

  let ref = useRef(null);
  let { labelProps, fieldProps } = useTimeField(props, state, ref);

  return (
    <div className="flex flex-col flex-start">
      <span {...labelProps}>{props.label}</span>
      <div {...fieldProps} ref={ref} className="flex items-center justify-between h-9 w-full rounded-md border border-input bg-transparent px-4 pl-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
        {state.segments.map((segment, i) => (
          <DateSegmentView key={i} segment={segment} state={state} />
        ))}
        <ClockIcon className="w-4 h-4 text-muted-foreground ml-auto" />
      </div>
    </div>
  );
}

type DataSegmentViewProps = {
  segment: any;
  state: any;
}

function DateSegmentView({ segment, state }: DataSegmentViewProps) {
  let ref = useRef<HTMLDivElement>(null);
  let { segmentProps: {
    onKeyDown,
    ...segmentProps
  } } = useDateSegment(segment, state, ref);

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          ref.current?.blur();
        }
        onKeyDown?.(e);
      }}
      {...segmentProps}
      ref={ref}
      className={cn(
        "px-[1px] focus:bg-primary focus:text-white focus:outline-none focus:border-r tabular-nums text-end font-normal rounded-md"
      )}
    >
      {segment.text}
    </div>
  );
}
import * as React from "react";

import makeUrls, { CalendarEvent } from "./makeUrls";

type CalendarURLs = ReturnType<typeof makeUrls>;

const useAutoFocus = () => {
  const elementRef = React.useRef<HTMLElement>(null);

  React.useEffect(
    () => {
      const previous = document.activeElement;
      const element = elementRef.current;

      if (element) {
        element.focus();
      }

      if (previous instanceof HTMLElement) {
        return () => previous.focus();
      }

      return undefined;
    },
    []
  );

  return elementRef;
};

type OpenStateToggle = (event?: React.MouseEvent) => void;

const useOpenState = (initialOpen: boolean): [boolean, OpenStateToggle] => {
  const [open, setOpen] = React.useState<boolean>(initialOpen);
  const onToggle = () => setOpen(current => !current);

  React.useEffect(
    () => {
      if (open) {
        const onClose = () => setOpen(false);
        document.addEventListener("click", onClose);

        return () => document.removeEventListener("click", onClose);
      }

      return undefined;
    },
    [open, setOpen]
  );

  return [open, onToggle];
};

type CalendarRef = HTMLAnchorElement;
type CalendarProps = {
  children: React.ReactNode;
  filename?: string;
  href: string;
};

const Calendar = React.forwardRef<CalendarRef, CalendarProps>(
  ({ children, filename, href }, ref) => (
    <a ref={ref} download={Boolean(filename) ? filename : false} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
);

type DropdownProps = {
  onToggle: OpenStateToggle;
  urls: CalendarURLs;
  filename?: string;
};

const Dropdown: React.FC<DropdownProps> = ({ onToggle, urls, filename = 'download' }) => {
  const ref = useAutoFocus() as React.RefObject<HTMLAnchorElement>;
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onToggle();
    }
  };

  return (
    <div className="chq-atc--dropdown" onKeyDown={onKeyDown} role="presentation">
      <Calendar href={urls.ics} filename={filename} ref={ref}>
        Apple Calendar
      </Calendar>
      <Calendar href={urls.google}>
        Google
      </Calendar>
      <Calendar href={urls.ics} filename={filename}>
        Outlook
      </Calendar>
      <Calendar href={urls.outlook}>
        Outlook Web App
      </Calendar>
      <Calendar href={urls.yahoo}>
        Yahoo
      </Calendar>
    </div>
  );
};

type AddToCalendarProps = {
  event: CalendarEvent;
  open?: boolean;
  filename?: string;
};

const AddToCalendar: React.FC<AddToCalendarProps> = ({ children = "Add to My Calendar", event, filename, open: initialOpen = false }) => {
  const [open, onToggle] = useOpenState(initialOpen);
  const urls = React.useMemo<CalendarURLs>(() => makeUrls(event), [event]);

  return (
    <div className="chq-atc">
      {event && (
        <button type="button" className="chq-atc--button" onClick={onToggle}>
          <svg width="20px" height="20px" viewBox="0 0 1024 1024">
            <path d="M704 192v-64h-32v64h-320v-64h-32v64h-192v704h768v-704h-192z M864 864h-704v-480h704v480z M864 352h-704v-128h160v64h32v-64h320v64h32v-64h160v128z" />
          </svg>
          {" "}
          {children}
        </button>
      )}
      {open && <Dropdown onToggle={onToggle} urls={urls} filename={filename} />}
    </div>
  );
};

export default AddToCalendar;

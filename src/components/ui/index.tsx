import {
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import './ui.css';

type CommonProps = {
  className?: string;
  style?: CSSProperties;
};

export type ButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'default' | 'link' | 'danger';
    icon?: ReactNode;
    loading?: boolean;
  };

export function Button({
  variant = 'default',
  icon,
  loading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`ui-button ui-button--${variant} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="small" /> : icon}
      {children}
    </button>
  );
}

export function IconButton({
  'aria-label': ariaLabel,
  ...props
}: ButtonProps) {
  return (
    <Button
      {...props}
      aria-label={ariaLabel}
      className={`ui-icon-button ${props.className ?? ''}`}
    />
  );
}

export function LinkButton({
  variant = 'default',
  icon,
  children,
  className = '',
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'primary' | 'default' | 'link';
  icon?: ReactNode;
}) {
  return (
    <a
      className={`ui-button ui-button--${variant} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </a>
  );
}

type ValidationMessages = {
  requiredMessage?: string;
  minLengthMessage?: string;
  emailMessage?: string;
};

function validationProps<T extends HTMLInputElement | HTMLSelectElement>(
  messages: ValidationMessages,
) {
  return {
    onInvalid: (event: React.InvalidEvent<T>) => {
      const element = event.currentTarget;
      if (element.validity.valueMissing && messages.requiredMessage) {
        element.setCustomValidity(messages.requiredMessage);
      } else if (
        element instanceof HTMLInputElement &&
        element.validity.tooShort &&
        messages.minLengthMessage
      ) {
        element.setCustomValidity(messages.minLengthMessage);
      } else if (
        element instanceof HTMLInputElement &&
        element.validity.typeMismatch &&
        messages.emailMessage
      ) {
        element.setCustomValidity(messages.emailMessage);
      }
    },
    onInput: (event: React.FormEvent<T>) => {
      event.currentTarget.setCustomValidity('');
    },
  };
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & ValidationMessages
>(function Input(
  {
    requiredMessage,
    minLengthMessage,
    emailMessage,
    ...props
  },
  ref,
) {
  return (
    <input
      {...props}
      ref={ref}
      {...validationProps<HTMLInputElement>({
        requiredMessage,
        minLengthMessage,
        emailMessage,
      })}
      className={`ui-input ${props.className ?? ''}`}
    />
  );
});

export const PasswordInput = (
  props: InputHTMLAttributes<HTMLInputElement> &
    ValidationMessages,
) => <Input {...props} type="password" />;

export const Textarea = (
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) => <textarea {...props} className={`ui-input ui-textarea ${props.className ?? ''}`} />;

export function FileUpload({
  files,
  onChange,
  accept,
  multiple = false,
  maxCount,
  disabled,
  loading,
  title = 'Dosyanızı buraya sürükleyin veya seçmek için tıklayın',
  hint,
  icon,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxCount?: number;
  disabled?: boolean;
  loading?: boolean;
  title?: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
}) {
  const inputId = useId();
  const addFiles = (incoming: FileList | File[]) => {
    if (disabled || loading) return;
    const next = multiple
      ? [...files, ...Array.from(incoming)]
      : Array.from(incoming).slice(0, 1);
    onChange(maxCount ? next.slice(0, maxCount) : next);
  };

  return (
    <div className="ui-file-upload">
      <label
        className={`ui-file-upload__dropzone ${
          disabled || loading ? 'ui-file-upload__dropzone--disabled' : ''
        }`}
        htmlFor={inputId}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event: DragEvent<HTMLLabelElement>) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
      >
        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled || loading}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = '';
          }}
        />
        {icon && <span className="ui-file-upload__icon">{icon}</span>}
        <span className="ui-file-upload__title">{title}</span>
        {hint && <span className="ui-file-upload__hint">{hint}</span>}
      </label>
      {files.length > 0 && (
        <ul className="ui-file-upload__list">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.lastModified}-${index}`}>
              <span title={file.name}>{file.name}</span>
              <Button
                variant="link"
                disabled={disabled || loading}
                aria-label={`${file.name} dosyasını kaldır`}
                onClick={() =>
                  onChange(files.filter((_, fileIndex) => fileIndex !== index))
                }
              >
                Kaldır
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export type SelectOption = {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
};

export function Select({
  options,
  requiredMessage,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[];
} & ValidationMessages) {
  return (
    <select
      {...props}
      {...validationProps<HTMLSelectElement>({
        requiredMessage,
      })}
      className={`ui-input ui-select ${props.className ?? ''}`}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({
  children,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  children?: ReactNode;
}) {
  return (
    <label className="ui-checkbox">
      <input {...props} type="checkbox" />
      <span>{children}</span>
    </label>
  );
}

export function Switch({
  checked,
  defaultChecked,
  onChange,
  name,
  checkedLabel = 'Aktif',
  uncheckedLabel = 'Pasif',
}: {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  name?: string;
  checkedLabel?: ReactNode;
  uncheckedLabel?: ReactNode;
}) {
  const controlled = checked !== undefined;
  const [internal, setInternal] =
    useState(defaultChecked ?? false);
  const active = controlled ? checked : internal;

  return (
    <label
      className={`ui-switch ${
        active ? 'ui-switch--checked' : ''
      }`}
    >
      <input
        type="checkbox"
        name={name}
        checked={controlled ? checked : undefined}
        defaultChecked={
          !controlled ? defaultChecked : undefined
        }
        onChange={(event) => {
          if (!controlled) {
            setInternal(event.target.checked);
          }
          onChange?.(event.target.checked);
        }}
      />
      <span>
        {active ? checkedLabel : uncheckedLabel}
      </span>
    </label>
  );
}

export function FormField({
  label,
  error,
  required,
  children,
  htmlFor,
}: {
  label: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="ui-form-field">
      <label htmlFor={htmlFor} className="ui-form-field__label">
        {required && <span aria-hidden="true">*</span>}
        {label}
      </label>
      {children}
      {error && <div className="ui-form-field__error">{error}</div>}
    </div>
  );
}

export function Card({
  title,
  extra,
  children,
  hoverable,
  bodyStyle,
  className = '',
  ...props
}: CommonProps & {
  title?: ReactNode;
  extra?: ReactNode;
  children?: ReactNode;
  hoverable?: boolean;
  bodyStyle?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <section
      {...props}
      className={`ui-card ${hoverable ? 'ui-card--hoverable' : ''} ${className}`}
    >
      {(title || extra) && (
        <header className="ui-card__header">
          <div className="ui-card__title">{title}</div>
          <div>{extra}</div>
        </header>
      )}
      <div className="ui-card__body" style={bodyStyle}>
        {children}
      </div>
    </section>
  );
}

export function Badge({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: TagTone;
}) {
  return <span className={`ui-badge ui-tag--${tone}`}>{children}</span>;
}

export type TagTone =
  | 'default'
  | 'blue'
  | 'purple'
  | 'cyan'
  | 'green'
  | 'gold'
  | 'orange'
  | 'red';

export function Tag({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: TagTone;
}) {
  return <span className={`ui-tag ui-tag--${tone}`}>{children}</span>;
}

export function Alert({
  title,
  children,
  type = 'info',
}: {
  title?: ReactNode;
  children?: ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
}) {
  return (
    <div className={`ui-alert ui-alert--${type}`} role="alert">
      {title && <strong>{title}</strong>}
      {children}
    </div>
  );
}

export function Spinner({
  size = 'default',
  label,
}: {
  size?: 'small' | 'default' | 'large';
  label?: ReactNode;
}) {
  return (
    <span className="ui-spinner-wrap" role="status">
      <span className={`ui-spinner ui-spinner--${size}`} />
      {label && <span>{label}</span>}
    </span>
  );
}

export function LoadingContainer({
  loading,
  children,
}: {
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <div className="ui-loading-container">
      {children}
      {loading && (
        <div className="ui-loading-container__overlay">
          <Spinner size="large" />
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  description = 'Veri bulunamadı.',
}: {
  description?: ReactNode;
}) {
  return (
    <div className="ui-empty">
      <div className="ui-empty__image" aria-hidden="true" />
      <div>{description}</div>
    </div>
  );
}

export function ResultView({
  status,
  title,
  description,
  icon,
  actions,
}: {
  status?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="ui-result" role="status">
      {icon && <div className="ui-result__icon">{icon}</div>}
      {!icon && status && <div className="ui-result__status">{status}</div>}
      <Heading level={1} className="ui-result__title">
        {title}
      </Heading>
      {description && (
        <div className="ui-result__description">{description}</div>
      )}
      {actions && <div className="ui-result__actions">{actions}</div>}
    </section>
  );
}

export function DescriptionList({
  title,
  items,
}: {
  title?: ReactNode;
  items: Array<{
    label: ReactNode;
    value: ReactNode;
  }>;
}) {
  return (
    <section className="ui-descriptions">
      {title && (
        <h3 className="ui-descriptions__title">
          {title}
        </h3>
      )}
      <dl>
        {items.map((item, index) => (
          <div
            className="ui-descriptions__row"
            key={index}
          >
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ImagePreview({
  src,
  alt,
  style,
}: {
  src: string;
  alt: string;
  style?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="ui-image-preview"
        onClick={() => setOpen(true)}
        aria-label={`${alt} görselini büyüt`}
      >
        <img src={src} alt={alt} style={style} />
      </button>
      {open &&
        createPortal(
          <div
            className="ui-image-lightbox"
            role="dialog"
            aria-modal="true"
            onClick={() => setOpen(false)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setOpen(false);
              }
            }}
            tabIndex={-1}
          >
            <img src={src} alt={alt} />
          </div>,
          document.body,
        )}
    </>
  );
}

export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav className="ui-pagination" aria-label="Sayfalama">
      <Button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Önceki
      </Button>
      <span>{page} / {Math.max(1, pageCount)}</span>
      <Button disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
        Sonraki
      </Button>
    </nav>
  );
}

type OverlayProps = {
  open: boolean;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  closeOnOverlay?: boolean;
  width?: number | string;
  closable?: boolean;
};

function useDialogBehaviour(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !ref.current) return;
      const focusable = [...ref.current.querySelectorAll<HTMLElement>(
        'button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])',
      )].filter((element) => !element.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [open, onClose]);
  return ref;
}

export function Modal({
  open,
  title,
  children,
  footer,
  onClose,
  closeOnOverlay = true,
  width = 520,
  closable = true,
}: OverlayProps) {
  const ref = useDialogBehaviour(open, onClose);
  if (!open) return null;
  return createPortal(
    <div
      className="ui-overlay"
      onMouseDown={(event) => {
        if (closeOnOverlay && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        style={{ width }}
      >
        {(title || closable) && (
          <header className="ui-modal__header">
            <strong>{title}</strong>
            {closable && (
              <IconButton aria-label="Kapat" onClick={onClose}>×</IconButton>
            )}
          </header>
        )}
        <div className="ui-modal__body">{children}</div>
        {footer && <footer className="ui-modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({
  open,
  title,
  children,
  footer,
  onClose,
  closeOnOverlay = true,
  width = 560,
}: OverlayProps) {
  const ref = useDialogBehaviour(open, onClose);
  if (!open) return null;
  return createPortal(
    <div
      className="ui-overlay ui-overlay--drawer"
      onMouseDown={(event) => {
        if (closeOnOverlay && event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        ref={ref}
        className="ui-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        style={{ width }}
      >
        <header className="ui-modal__header">
          <strong>{title}</strong>
          <IconButton aria-label="Kapat" onClick={onClose}>×</IconButton>
        </header>
        <div className="ui-modal__body">{children}</div>
        {footer && <footer className="ui-modal__footer">{footer}</footer>}
      </aside>
    </div>,
    document.body,
  );
}

export type DataTableColumn<T> = {
  key: string;
  title: ReactNode;
  dataIndex?: keyof T;
  width?: number;
  ellipsis?: boolean;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  sorter?: (a: T, b: T) => number;
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading,
  emptyText,
  minWidth,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: keyof T | ((record: T) => string | number);
  loading?: boolean;
  emptyText?: ReactNode;
  minWidth?: number;
}) {
  if (loading) return <Spinner label="Yükleniyor..." />;
  if (data.length === 0) return <EmptyState description={emptyText} />;
  return (
    <div className="ui-table-scroll">
      <table className="ui-table" style={{ minWidth }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ width: column.width }}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((record, index) => {
            const key = typeof rowKey === 'function'
              ? rowKey(record)
              : String(record[rowKey]);
            return (
              <tr key={key}>
                {columns.map((column) => {
                  const value = column.dataIndex
                    ? record[column.dataIndex]
                    : undefined;
                  return (
                    <td
                      key={column.key}
                      className={column.ellipsis ? 'ui-table__ellipsis' : ''}
                    >
                      {column.render
                        ? column.render(value, record, index)
                        : (value as ReactNode)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ManagedDataTable<T>({
  columns,
  data,
  rowKey,
  loading,
  emptyText,
  minWidth,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  title,
  actions,
  totalLabel,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey:
    | keyof T
    | ((record: T) => string | number);
  loading?: boolean;
  emptyText?: ReactNode;
  minWidth?: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  title?: ReactNode;
  actions?: ReactNode;
  totalLabel?: (total: number) => ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [sortState, setSortState] =
    useState<{
      key: string;
      direction: 'asc' | 'desc';
    } | null>(null);
  const [compact, setCompact] =
    useState(false);
  const [settingsOpen, setSettingsOpen] =
    useState(false);
  const [hiddenColumns, setHiddenColumns] =
    useState<Set<string>>(
      () => new Set(),
    );
  const visibleColumns = columns.filter(
    (column) =>
      !hiddenColumns.has(column.key),
  );

  const sortedData = sortState
    ? [...data].sort((a, b) => {
        const column = visibleColumns.find(
          (item) =>
            item.key === sortState.key,
        );
        const result =
          column?.sorter?.(a, b) ?? 0;
        return sortState.direction === 'asc'
          ? result
          : -result;
      })
    : data;

  const visibleData = sortedData.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <div
      ref={wrapperRef}
      className={`ui-managed-table ${
        compact
          ? 'ui-managed-table--compact'
          : ''
      }`}
    >
      <div className="ui-table-toolbar">
        <strong>{title}</strong>
        <div className="ui-inline">
          {actions}
          <Button
            aria-label="Tablo yoğunluğu"
            title="Yoğunluk"
            onClick={() =>
              setCompact((current) => !current)
            }
          >
            ↕
          </Button>
          <Button
            aria-label="Tam ekran"
            title="Tam ekran"
            onClick={() => {
              if (document.fullscreenElement) {
                void document.exitFullscreen();
              } else {
                void wrapperRef.current?.requestFullscreen();
              }
            }}
          >
            ⛶
          </Button>
          <div className="ui-column-settings">
            <Button
              aria-label="Kolon ayarları"
              title="Kolon ayarları"
              onClick={() =>
                setSettingsOpen(
                  (current) => !current,
                )
              }
            >
              ⚙
            </Button>
            {settingsOpen && (
              <div className="ui-column-settings__panel">
                {columns.map((column) => (
                  <Checkbox
                    key={column.key}
                    checked={
                      !hiddenColumns.has(
                        column.key,
                      )
                    }
                    onChange={(event) => {
                      setHiddenColumns(
                        (current) => {
                          const next =
                            new Set(current);
                          if (
                            event.target.checked
                          ) {
                            next.delete(
                              column.key,
                            );
                          } else {
                            next.add(
                              column.key,
                            );
                          }
                          return next;
                        },
                      );
                    }}
                  >
                    {column.title}
                  </Checkbox>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="ui-table-loading">
          <Spinner label="YÃ¼kleniyor..." />
        </div>
      ) : data.length === 0 ? (
        <EmptyState description={emptyText} />
      ) : (
        <div className="ui-table-scroll">
          <table
            className="ui-table"
            style={{ minWidth }}
          >
            <thead>
              <tr>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    style={{
                      width: column.width,
                    }}
                    className={
                      column.sorter
                        ? 'ui-table__sortable'
                        : undefined
                    }
                    onClick={
                      column.sorter
                        ? () =>
                            setSortState(
                              (current) =>
                                current?.key ===
                                column.key
                                  ? {
                                      key: column.key,
                                      direction:
                                        current.direction ===
                                        'asc'
                                          ? 'desc'
                                          : 'asc',
                                    }
                                  : {
                                      key: column.key,
                                      direction:
                                        'asc',
                                    },
                            )
                        : undefined
                    }
                  >
                    {column.title}
                    {sortState?.key ===
                      column.key &&
                      (sortState.direction ===
                      'asc'
                        ? ' â†‘'
                        : ' â†“')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleData.map(
                (record, index) => {
                  const key =
                    typeof rowKey ===
                    'function'
                      ? rowKey(record)
                      : String(
                          record[rowKey],
                        );
                  return (
                    <tr key={key}>
                      {visibleColumns.map(
                        (column) => {
                          const value =
                            column.dataIndex
                              ? record[
                                  column
                                    .dataIndex
                                ]
                              : undefined;
                          return (
                            <td
                              key={
                                column.key
                              }
                              className={
                                column.ellipsis
                                  ? 'ui-table__ellipsis'
                                  : undefined
                              }
                            >
                              {column.render
                                ? column.render(
                                    value,
                                    record,
                                    index,
                                  )
                                : (value as ReactNode)}
                            </td>
                          );
                        },
                      )}
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      )}

      {data.length > 0 && (
        <div className="ui-table-pagination">
          <span>
            {totalLabel
              ? totalLabel(data.length)
              : `Toplam ${data.length} kullanÄ±cÄ±`}
          </span>
          <select
            className="ui-input ui-table-pagination__size"
            value={pageSize}
            onChange={(event) =>
              onPageSizeChange(
                Number(event.target.value),
              )
            }
            aria-label="Sayfa baÅŸÄ±na kayÄ±t"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / sayfa
              </option>
            ))}
          </select>
          <Pagination
            page={page}
            pageCount={Math.max(
              1,
              Math.ceil(
                data.length / pageSize,
              ),
            )}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

export function ConfirmDialog({
  message,
  onConfirm,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  ...props
}: Omit<OverlayProps, 'children'> & {
  message: ReactNode;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}) {
  return (
    <Modal
      {...props}
      footer={
        <>
          <Button onClick={props.onClose}>
            {cancelText}
          </Button>
          <Button variant="primary" onClick={onConfirm}>{confirmText}</Button>
        </>
      }
    >
      {message}
    </Modal>
  );
}

export function ConfirmAction({
  title,
  description,
  onConfirm,
  children,
  confirmText,
  cancelText,
}: {
  title: ReactNode;
  description?: ReactNode;
  onConfirm: () => void | Promise<void>;
  children: (open: () => void) => ReactNode;
  confirmText?: string;
  cancelText?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children(() => setOpen(true))}
      <ConfirmDialog
        open={open}
        title={title}
        message={description}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          void onConfirm();
          setOpen(false);
        }}
        confirmText={confirmText}
        cancelText={cancelText}
      />
    </>
  );
}

export function FormModal({
  open,
  title,
  width,
  submitText,
  cancelText = 'Ä°ptal',
  submitting,
  onClose,
  onSubmit,
  children,
}: {
  open: boolean;
  title: ReactNode;
  width?: number;
  submitText: string;
  cancelText?: string;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (
    formData: FormData,
    form: HTMLFormElement,
  ) => void | Promise<void>;
  children: ReactNode;
}) {
  const formId = useId();
  const [internalSubmitting, setInternalSubmitting] =
    useState(false);
  const effectiveSubmitting =
    submitting ?? internalSubmitting;

  return (
    <Modal
      open={open}
      title={title}
      width={width}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            loading={effectiveSubmitting}
          >
            {submitText}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={(
          event: FormEvent<HTMLFormElement>,
        ) => {
          event.preventDefault();
          const form = event.currentTarget;
          setInternalSubmitting(true);
          Promise.resolve(
            onSubmit(
              new FormData(form),
              form,
            ),
          ).finally(() =>
            setInternalSubmitting(false),
          );
        }}
      >
        {children}
      </form>
    </Modal>
  );
}

export function Toast({
  message,
  type = 'info',
}: {
  message: ReactNode;
  type?: 'info' | 'success' | 'error';
}) {
  return <div className={`ui-toast ui-toast--${type}`} role="status">{message}</div>;
}

export function ToastHost() {
  const [current, setCurrent] = useState<{
    message: string;
    type: 'info' | 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    const showToast = (event: Event) => {
      const detail = (event as CustomEvent<{
        message: string;
        type: 'info' | 'success' | 'error';
      }>).detail;
      setCurrent(detail);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCurrent(null), 3000);
    };
    window.addEventListener('ui-toast', showToast);
    return () => {
      window.removeEventListener('ui-toast', showToast);
      window.clearTimeout(timer);
    };
  }, []);

  return current ? <Toast {...current} /> : null;
}

export const toast = {
  error(message: string) {
    window.dispatchEvent(new CustomEvent('ui-toast', { detail: { message, type: 'error' } }));
  },
  success(message: string) {
    window.dispatchEvent(new CustomEvent('ui-toast', { detail: { message, type: 'success' } }));
  },
};

export function Tooltip({
  content,
  children,
}: {
  content: string;
  children: ReactNode;
}) {
  return <span className="ui-tooltip" data-tooltip={content}>{children}</span>;
}

export function Progress({
  percent,
  variant = 'line',
  status = 'normal',
  size,
  style,
}: {
  percent: number;
  variant?: 'line' | 'dashboard' | 'circle';
  status?: 'normal' | 'success' | 'active' | 'exception';
  size?: number;
  style?: CSSProperties;
}) {
  const safePercent = Math.min(100, Math.max(0, percent));
  if (variant === 'dashboard' || variant === 'circle') {
    const circleSize = size ?? (variant === 'circle' ? 120 : 120);
    return (
      <div
        className={`ui-progress-dashboard ui-progress--${status}`}
        style={{
          '--ui-progress': `${safePercent * 3.6}deg`,
          width: circleSize,
          height: circleSize,
          ...style,
        } as CSSProperties}
        role="progressbar"
        aria-valuenow={safePercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div>{safePercent}%</div>
      </div>
    );
  }
  return (
    <div className={`ui-progress ui-progress--${status}`} style={style} role="progressbar" aria-valuenow={safePercent}>
      <div style={{ width: `${safePercent}%` }} />
    </div>
  );
}

export function StatCard({
  title,
  value,
  icon,
  description,
  onClick,
}: {
  title: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Card
      hoverable={Boolean(onClick)}
      onClick={onClick}
      className="ui-stat-card"
      style={{ cursor: onClick ? 'pointer' : 'default', height: '100%' }}
    >
      <div className="ui-stat">
        <div className="ui-stat__title">{title}</div>
        <div className="ui-stat__content">
          {icon && <span className="ui-stat__icon">{icon}</span>}
          <span>{value}</span>
        </div>
      </div>
      {description && <Text secondary className="ui-stat__description">{description}</Text>}
    </Card>
  );
}

export function Statistic({
  title,
  value,
  prefix,
  valueStyle,
}: {
  title: ReactNode;
  value: ReactNode;
  prefix?: ReactNode;
  valueStyle?: CSSProperties;
}) {
  return (
    <div className="ui-stat">
      <div className="ui-stat__title">{title}</div>
      <div className="ui-stat__content" style={valueStyle}>
        {prefix && <span className="ui-stat__icon">{prefix}</span>}
        <span>{value}</span>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="ui-page-header">
      <div>
        <Heading level={2}>{title}</Heading>
        {description && <Text secondary>{description}</Text>}
      </div>
      {actions && <div className="ui-page-header__actions">{actions}</div>}
    </header>
  );
}

export function Grid({
  children,
  gap = 24,
  className = '',
  style,
}: CommonProps & {
  children: ReactNode;
  gap?: number;
}) {
  return <div className={`ui-grid ${className}`} style={{ gap, ...style }}>{children}</div>;
}

export function GridItem({
  children,
  className = '',
  style,
}: CommonProps & { children: ReactNode }) {
  return <div className={`ui-grid-item ${className}`} style={style}>{children}</div>;
}

export function Heading({
  level = 1,
  children,
  ...props
}: CommonProps & { level?: 1 | 2 | 3 | 4; children: ReactNode }) {
  const TagName = `h${level}` as const;
  return <TagName {...props} className={`ui-heading ui-heading--${level} ${props.className ?? ''}`}>{children}</TagName>;
}

export function Text({
  children,
  secondary,
  strong,
  copyable,
  className = '',
  ...props
}: CommonProps & {
  children: ReactNode;
  secondary?: boolean;
  strong?: boolean;
  copyable?: boolean;
}) {
  const id = useId();
  return (
    <span
      {...props}
      id={id}
      className={`ui-text ${secondary ? 'ui-text--secondary' : ''} ${strong ? 'ui-text--strong' : ''} ${className}`}
      onClick={copyable ? () => void navigator.clipboard?.writeText(String(children)) : undefined}
      title={copyable ? 'Kopyalamak için tıklayın' : undefined}
    >
      {children}
    </span>
  );
}

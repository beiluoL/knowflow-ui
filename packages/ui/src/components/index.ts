/**
 * 公共组件总入口（内部聚合层）。
 *
 * 规则：
 *   - 只在这里出现「已正式公开」的组件；未迁移组件不在本文件出现，避免"看起来已实现"；
 *   - 组件实现与类型都从各自的 `components/<name>/index.ts` 汇总，避免多处维护；
 *   - 新增组件时只改本文件一组行 + 一个目录，不在根入口散落重复导出。
 */

/* ---------- 表单 ---------- */
export { KfFormField } from './form-field/index'
export type { KfFormFieldProps, KfFormFieldSlots } from './form-field/index'

export { KfInput } from './input/index'
export type { InputModelValue, InputType, KfInputEmits, KfInputProps, KfInputSlots } from './input/index'

export { KfTextarea } from './textarea/index'
export type { KfTextareaEmits, KfTextareaProps, KfTextareaSlots } from './textarea/index'

export { KfCheckbox } from './checkbox/index'
export type {
  CheckboxAs,
  CheckboxValue,
  KfCheckboxEmits,
  KfCheckboxProps,
  KfCheckboxSlots,
} from './checkbox/index'

export { KfRadio, KfRadioGroup, KF_RADIO_GROUP } from './radio/index'
export type {
  KfRadioEmits,
  KfRadioGroupContext,
  KfRadioGroupEmits,
  KfRadioGroupProps,
  KfRadioGroupSlots,
  KfRadioOption,
  KfRadioProps,
  KfRadioSize,
} from './radio/index'

export { KfSwitch } from './switch/index'
export type { KfSwitchEmits, KfSwitchProps, KfSwitchSize, KfSwitchSlots } from './switch/index'

export { KfSelect } from './select/index'
export type { KfSelectEmits, KfSelectOption, KfSelectProps, KfSelectSlots } from './select/index'

export { KfDatePicker } from './date-picker/index'
export {
  buildMonthGrid,
  clampDate,
  dayNumber,
  daysInMonth,
  formatISODate,
  isSameDay,
  monthTitle,
  parseISODate,
  shiftDays,
  shiftMonths,
  today,
  weekdayLabels,
  weekdayOf,
} from './date-picker/index'
export type {
  KfCalendarDay,
  KfDatePickerEmits,
  KfDatePickerProps,
  KfDatePickerSlots,
  Ymd,
} from './date-picker/index'

export { KfNumberInput } from './number-input/index'
export type { KfNumberInputEmits, KfNumberInputProps, KfNumberInputSlots } from './number-input/index'

export { KfTagsInput } from './tags-input/index'
export type { KfTagsInputEmits, KfTagsInputProps, KfTagsInputSlots } from './tags-input/index'

export { KfSearchInput } from './search-input/index'
export type { KfSearchInputEmits, KfSearchInputProps } from './search-input/index'

export { KfSlider } from './slider/index'
export type { KfSliderEmits, KfSliderProps, KfSliderSlots } from './slider/index'

/* ---------- 按钮与图标 ---------- */
export { KfButton } from './button/index'
export type {
  ButtonIconPosition,
  ButtonSize,
  ButtonType,
  ButtonVariant,
  KfButtonEmits,
  KfButtonProps,
  KfButtonSlots,
} from './button/index'

export { KfButtonGroup } from './button-group/index'
export type {
  KfButtonGroupEmits,
  KfButtonGroupItem,
  KfButtonGroupProps,
  KfButtonGroupSlots,
} from './button-group/index'

export { KfCopyButton } from './copy-button/index'
export type { KfCopyButtonEmits, KfCopyButtonProps, KfCopyButtonSlots } from './copy-button/index'

export { KfIcon } from './icon/index'
export { ICON_SIZE_PX } from './icon/index'
export type { IconSize, KfIconProps } from './icon/index'
export {
  getIconMarkup,
  isBuiltinIcon,
  listIconNames,
  registerIcon,
  unregisterIcon,
} from './icon/index'
export type { BuiltinIconName, BuiltinIconNameMap } from './icon/index'
export { BUILTIN_ICON_NAMES, ICON_SVG } from './icon/index'

/* ---------- 展示 ---------- */
export { KfBadge } from './badge/index'
export type { KfBadgeProps, KfBadgeSize, KfBadgeSlots, KfBadgeVariant } from './badge/index'

export { KfTag } from './tag/index'
export type { KfTagEmits, KfTagProps, KfTagSize, KfTagSlots, KfTagVariant } from './tag/index'

export { KfCard } from './card/index'
export type { KfCardPadding, KfCardProps, KfCardSlots, KfCardVariant } from './card/index'

export { KfAvatar } from './avatar/index'
export type { KfAvatarEmits, KfAvatarProps, KfAvatarSize, KfAvatarStatus } from './avatar/index'

export { KfAlert } from './alert/index'
export type { KfAlertEmits, KfAlertProps, KfAlertSlots, KfAlertVariant } from './alert/index'

export { KfProgress } from './progress/index'
export type { KfProgressProps, KfProgressSize, KfProgressSlots, KfProgressVariant } from './progress/index'

export { KfSkeleton } from './skeleton/index'
export type { KfSkeletonProps, KfSkeletonSlots, KfSkeletonType } from './skeleton/index'

export { KfStatusIndicator } from './status-indicator/index'
export type {
  KfStatus,
  KfStatusIndicatorProps,
  KfStatusIndicatorSize,
  KfStatusIndicatorSlots,
} from './status-indicator/index'

export { KfDivider } from './divider/index'
export type { KfDividerDirection, KfDividerProps, KfDividerSlots, KfDividerSpacing } from './divider/index'

export { KfLink } from './link/index'
export type { KfLinkEmits, KfLinkProps, KfLinkSlots, KfLinkTone, KfLinkUnderline } from './link/index'

/* ---------- 反馈与空态 ---------- */
export { KfEmptyState } from './empty-state/index'
export type { KfEmptyStateProps, KfEmptyStateSlots, KfEmptyStateVariant } from './empty-state/index'

export { KfErrorState } from './error-state/index'
export type { KfErrorStateEmits, KfErrorStateProps, KfErrorStateSlots } from './error-state/index'

export { KfToast, useToast } from './toast/index'
export type {
  KfToastEmits,
  KfToastItem,
  KfToastPlacement,
  KfToastProps,
  KfToastSlots,
  KfToastType,
  UseToastOptions,
} from './toast/index'

/* ---------- 浮层 ---------- */
export { KfDialog } from './dialog/index'
export { enterModal, isTopModal, leaveModal, modalDepth } from './dialog/index'
export type {
  KfDialogEmits,
  KfDialogProps,
  KfDialogSlots,
  KfDialogVariant,
  KfDialogWidth,
} from './dialog/index'

export { KfConfirmDialog } from './confirm-dialog/index'
export type {
  KfConfirmDialogEmits,
  KfConfirmDialogProps,
  KfConfirmDialogSlots,
} from './confirm-dialog/index'

export { KfTooltip } from './tooltip/index'
export type { KfTooltipPlacement, KfTooltipProps, KfTooltipSlots } from './tooltip/index'

export { KfContextMenu } from './context-menu/index'
export type { KfContextMenuEmits, KfContextMenuItem, KfContextMenuProps } from './context-menu/index'

/* ---------- 导航与布局 ---------- */
export { KfTabs } from './tabs/index'
export type {
  KfTabItem,
  KfTabsEmits,
  KfTabsProps,
  KfTabsSize,
  KfTabsSlots,
  KfTabsVariant,
} from './tabs/index'

export { KfAccordion, KfAccordionItem } from './accordion/index'
export type {
  KfAccordionEmits,
  KfAccordionItemProps,
  KfAccordionItemSlots,
  KfAccordionProps,
  KfAccordionSlots,
} from './accordion/index'

export { KfPagination } from './pagination/index'
export type { KfPaginationEmits, KfPaginationProps } from './pagination/index'

/* ---------- 数据与文件 ---------- */
export { KfTable } from './table/index'
export type {
  KfTableAlign,
  KfTableColumn,
  KfTableEmits,
  KfTableProps,
  KfTableRow,
  KfTableSlots,
  KfTableSortOrder,
} from './table/index'

export { KfTree } from './tree/index'
export type { KfTreeEmits, KfTreeNode, KfTreeProps, KfTreeSlots } from './tree/index'

export { KfUpload } from './upload/index'
export type {
  KfUploadEmits,
  KfUploadFile,
  KfUploadFileStatus,
  KfUploadProps,
  KfUploadRejectReason,
  KfUploadSlots,
} from './upload/index'

export { KfCombobox } from './combobox/index'
export type { KfComboboxEmits, KfComboboxOption, KfComboboxProps } from './combobox/index'

/* ---------- 浮层补全 ---------- */
export { KfDrawer } from './drawer/index'
export type {
  KfDrawerEmits,
  KfDrawerPlacement,
  KfDrawerProps,
  KfDrawerSlots,
} from './drawer/index'

export { KfPopover } from './popover/index'
export type {
  KfPopoverEmits,
  KfPopoverPlacement,
  KfPopoverProps,
  KfPopoverSlots,
} from './popover/index'

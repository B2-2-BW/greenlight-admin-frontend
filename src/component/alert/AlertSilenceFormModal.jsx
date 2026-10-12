import {
  Button,
  DateField,
  DateRangePicker,
  Form,
  Input,
  Label,
  ListBox,
  Modal,
  RangeCalendar,
  Select,
  TextField,
} from '@heroui/react';
import { fromDate, getLocalTimeZone } from '@internationalized/date';
import { I18nProvider } from '@react-aria/i18n';
import { useEffect, useState } from 'react';
import { AlertClient } from '../../api/alert/index.js';
import { ToastUtil } from '../../util/toastUtil.js';

const LOCAL_TIME_ZONE = getLocalTimeZone();

const toLocalDateTimeParameter = (value) => {
  if (!value) return undefined;
  const pad = (part) => String(part).padStart(2, '0');
  return `${value.year}-${pad(value.month)}-${pad(value.day)}T${pad(value.hour)}:${pad(value.minute)}:${pad(value.second ?? 0)}`;
};

const toZoned = (value) => fromDate(new Date(value), LOCAL_TIME_ZONE);

const createDefaultRange = (hours) => {
  const start = new Date();
  start.setSeconds(0, 0);
  const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
  return {
    start: fromDate(start, LOCAL_TIME_ZONE),
    end: fromDate(end, LOCAL_TIME_ZONE),
  };
};

const rangeErrorOf = (range, silence) => {
  if (!range?.start || !range?.end) return '시작 및 종료 시각을 모두 입력해 주세요.';
  const end = range.end.toDate(LOCAL_TIME_ZONE).getTime();
  const start =
    silence?.status === 'ACTIVE' ? new Date(silence.startsAt).getTime() : range.start.toDate(LOCAL_TIME_ZONE).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return '시작 및 종료 시각을 모두 입력해 주세요.';
  if (start >= end) return '종료 시각은 시작 시각보다 뒤여야 합니다.';
  if (end <= Date.now()) return '종료 시각은 현재 시각보다 뒤여야 합니다.';
  return null;
};

export default function AlertSilenceFormModal({ isOpen, onOpenChange, silence, systems, onSaved }) {
  const [systemCode, setSystemCode] = useState('QUEUE');
  const [comment, setComment] = useState('');
  const [range, setRange] = useState(() => createDefaultRange(1));
  const [isPending, setIsPending] = useState(false);
  const active = silence?.status === 'ACTIVE';
  const rangeError = rangeErrorOf(range, silence);

  useEffect(() => {
    if (!isOpen) return;
    if (silence) {
      setSystemCode(silence.systemCode);
      setComment(silence.comment ?? '');
      setRange({ start: toZoned(silence.startsAt), end: toZoned(silence.endsAt) });
      return;
    }
    setSystemCode(systems[0]?.systemCode ?? 'QUEUE');
    setComment('');
    setRange(createDefaultRange(1));
  }, [isOpen, silence, systems]);

  const submit = async (event) => {
    event.preventDefault();
    if (rangeError) return;
    const endsAt = toLocalDateTimeParameter(range.end);
    const startsAt = active ? silence.startsAt : toLocalDateTimeParameter(range.start);
    setIsPending(true);
    try {
      if (silence) {
        await AlertClient.updateAlertSilence(silence.silenceId, { startsAt, endsAt, comment });
        ToastUtil.success('플랜다운', '플랜다운을 수정했습니다.');
      } else {
        await AlertClient.createAlertSilence({ systemCode, startsAt, endsAt, comment });
        ToastUtil.success('플랜다운', '플랜다운을 등록했습니다.');
      }
      onSaved();
    } catch (error) {
      ToastUtil.error('플랜다운', error.response?.data?.detail ?? '플랜다운을 저장하지 못했습니다.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{silence ? '플랜다운 수정' : '플랜다운 등록'}</Modal.Heading>
            </Modal.Header>
            <Form onSubmit={submit}>
              <Modal.Body className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span id="silence-system-label" className="text-sm font-medium">
                    시스템
                  </span>
                  <Select
                    aria-labelledby="silence-system-label"
                    value={systemCode}
                    onChange={(value) => setSystemCode(String(value))}
                    isDisabled={Boolean(silence) || isPending}
                    variant="secondary"
                  >
                    <Select.Trigger>
                      <Select.Value>{({ state }) => state.selectedItems[0]?.textValue}</Select.Value>
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {systems.map((system) => (
                          <ListBox.Item key={system.systemCode} id={system.systemCode} textValue={system.label}>
                            {system.label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    isDisabled={active || isPending}
                    onPress={() => setRange(createDefaultRange(1))}
                  >
                    1시간
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    isDisabled={active || isPending}
                    onPress={() => setRange(createDefaultRange(2))}
                  >
                    2시간
                  </Button>
                </div>
                <I18nProvider locale="ko-KR">
                  <DateRangePicker
                    value={range}
                    onChange={(next) => next && setRange(next)}
                    granularity="minute"
                    hourCycle={24}
                    hideTimeZone
                    shouldForceLeadingZeros
                    isInvalid={Boolean(rangeError)}
                    isDisabled={isPending}
                  >
                    <Label>기간</Label>
                    <DateField.Group fullWidth variant="secondary">
                      <DateField.InputContainer>
                        <DateField.Input slot="start">
                          {(segment) => <DateField.Segment segment={segment} />}
                        </DateField.Input>
                        <DateRangePicker.RangeSeparator />
                        <DateField.Input slot="end">
                          {(segment) => <DateField.Segment segment={segment} />}
                        </DateField.Input>
                      </DateField.InputContainer>
                      <DateField.Suffix>
                        <DateRangePicker.Trigger>
                          <DateRangePicker.TriggerIndicator />
                        </DateRangePicker.Trigger>
                      </DateField.Suffix>
                    </DateField.Group>
                    <DateRangePicker.Popover>
                      <RangeCalendar aria-label="플랜다운 기간">
                        <RangeCalendar.Header>
                          <RangeCalendar.YearPickerTrigger>
                            <RangeCalendar.YearPickerTriggerHeading />
                            <RangeCalendar.YearPickerTriggerIndicator />
                          </RangeCalendar.YearPickerTrigger>
                          <RangeCalendar.NavButton slot="previous" />
                          <RangeCalendar.NavButton slot="next" />
                        </RangeCalendar.Header>
                        <RangeCalendar.Grid>
                          <RangeCalendar.GridHeader>
                            {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                          </RangeCalendar.GridHeader>
                          <RangeCalendar.GridBody>
                            {(date) => <RangeCalendar.Cell date={date} />}
                          </RangeCalendar.GridBody>
                        </RangeCalendar.Grid>
                      </RangeCalendar>
                    </DateRangePicker.Popover>
                  </DateRangePicker>
                </I18nProvider>
                {rangeError && (
                  <p className="text-sm text-danger" role="alert">
                    {rangeError}
                  </p>
                )}
                {active && (
                  <p className="text-sm text-muted">적용 중에는 시작 시각이 유지되고 종료 시각과 사유만 수정됩니다.</p>
                )}
                <TextField className="w-full">
                  <Label>사유</Label>
                  <Input value={comment} onChange={(event) => setComment(event.target.value)} maxLength={500} />
                </TextField>
              </Modal.Body>
              <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button slot="close" type="button" variant="tertiary" className="w-full sm:w-auto">
                  닫기
                </Button>
                <Button
                  type="submit"
                  isPending={isPending}
                  isDisabled={Boolean(rangeError)}
                  className="w-full sm:w-auto"
                >
                  {silence ? '저장' : '등록'}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

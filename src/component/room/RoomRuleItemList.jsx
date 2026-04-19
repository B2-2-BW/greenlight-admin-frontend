import { Button, Description, FieldError, Input, Label, ListBox, Select, Surface, TextField } from '@heroui/react';

const MATCH_OPERATORS = [
  {
    value: 'EQUAL',
    name: '정확히 일치 (기본값)',
    description: '파라미터 값과 규칙의 값이 정확히 일치하는지 확인합니다.',
  },
  {
    value: 'CONTAINS',
    name: '부분 일치',
    description: '파라미터 값이 규칙의 값을 부분 문자열로 포함하는지 확인합니다.',
  },
  // { value: 'STARTSWITH', name: 'Starts with', description: '파라미터 값이 규칙의 값으로 시작하는지 확인합니다.' },
  // { value: 'ENDSWITH', name: 'Ends with', description: '파라미터 값이 규칙의 값으로 끝나는지 확인합니다.' },
];

export default function RoomRuleItemList({ rules, onAdd, onChange, onDelete }) {
  return (
    <>
      <div>
        <div className="flex flex-col gap-4">
          {rules?.length > 0 &&
            rules?.map((rule, index) => (
              <div key={index}>
                <div className="flex items-center text-sm mb-1 pl-1">
                  <Label>대기열 규칙 {index + 1}</Label>
                </div>
                <Surface variant="default" className="rounded-lg p-2 bg-neutral-50">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2 mb-2 items-start">
                      <Select
                        isRequired
                        value={rule.matchOperator}
                        onChange={(value) => onChange(index, 'matchOperator', value)}
                      >
                        <Label className="text-sm font-normal">규칙 검사 연산자</Label>
                        <Select.Trigger className="w-40 ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent">
                          <Select.Value>{({ state }) => state.selectedItems[0]?.textValue}</Select.Value>
                          <Select.Indicator />
                        </Select.Trigger>

                        <Select.Popover placement="bottom start">
                          <ListBox>
                            {MATCH_OPERATORS.map((operator) => (
                              <ListBox.Item id={operator.value} key={operator.value} textValue={operator.name}>
                                <div className="flex gap-2 items-center">
                                  <div className="flex flex-col">
                                    <span className="text-base">{operator.name}</span>
                                    <span className="text-sm text-neutral-500">{operator.description}</span>
                                  </div>
                                </div>
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                      <TextField isRequired name="value" type="text">
                        <Label className="text-sm font-normal">규칙 값</Label>
                        <Input
                          className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent text-sm"
                          value={rule.value}
                          onChange={(e) => onChange(index, 'value', e.target.value)}
                        />
                        <FieldError>필수 항목을 입력해 주세요.</FieldError>
                      </TextField>

                      <TextField name="description" type="text">
                        <Label className="text-sm font-normal">비고</Label>
                        <Input
                          className="w-120 ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent text-sm"
                          value={rule.description}
                          onChange={(e) => onChange(index, 'description', e.target.value)}
                        />
                      </TextField>
                    </div>

                    <Button onPress={() => onDelete(index)} variant="outline" className="h-6">
                      제거
                    </Button>
                  </div>
                </Surface>
              </div>
            ))}

          {rules?.length === 0 && <div className="text-xs  text-default-600">적용중인 규칙이 없습니다.</div>}
        </div>

        <Button
          onPress={onAdd}
          size="sm"
          color="primary"
          variant="bordered"
          radius="full"
          className="h-6 border-1 mt-4"
        >
          대기열 적용 규칙 추가
        </Button>
      </div>
    </>
  );
}

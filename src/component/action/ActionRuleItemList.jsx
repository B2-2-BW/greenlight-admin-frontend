import { Accordion, AccordionItem, Button, Input, Select, SelectItem } from '@heroui/react';
import { useEffect, useState } from 'react';
import ArrowBackSvg from '../../icon/ArrowBackSvg.jsx';
import ChevronSvg from '../../icon/ChevronSvg.jsx';

const MATCH_OPERATORS = [
  { value: 'EQUAL', name: 'Equal (기본값)', description: '파라미터 값과 규칙의 값이 정확히 일치하는지 확인합니다.' },
  {
    value: 'CONTAINS',
    name: 'Contains',
    description: '파라미터 값이 규칙의 값을 부분 문자열로 포함하는지 확인합니다.',
  },
  { value: 'STARTSWITH', name: 'Starts with', description: '파라미터 값이 규칙의 값으로 시작하는지 확인합니다.' },
  { value: 'ENDSWITH', name: 'Ends with', description: '파라미터 값이 규칙의 값으로 끝나는지 확인합니다.' },
];
const className = 'w-[11rem]';
export default function ActionRuleItemList({ rules, onAdd, onChange, onDelete }) {
  return (
    <>
      <div>
        <div className="pl-1 flex flex-col gap-4">
          {rules?.length > 0 &&
            rules?.map((rule, index) => (
              <div key={index}>
                <div className="flex justify-between">
                  <div className="flex items-center gap-1 text-neutral-600 text-xs font-light">
                    <span>대기열 규칙 {index + 1}</span>
                    <span>
                      ({rule.paramName}, {rule.paramValue})
                    </span>
                  </div>
                  <Button
                    onPress={() => onDelete(index)}
                    size="sm"
                    color="primary"
                    variant="bordered"
                    radius="full"
                    className="h-6 border-1"
                  >
                    제거
                  </Button>
                </div>
                <div className="flex gap-2 mb-2 items-start">
                  <Select
                    size="sm"
                    isRequired
                    className={className}
                    items={MATCH_OPERATORS}
                    label="규칙 검사 연산자"
                    labelPlacement="outside"
                    selectedKeys={[rule.matchOperator]}
                    onChange={(e) => onChange(index, 'matchOperator', e.target.value)}
                    popoverProps={{
                      classNames: {
                        content: 'w-96',
                      },
                    }}
                  >
                    {(operator) => (
                      <SelectItem key={operator.value} textValue={operator.name}>
                        <div className="flex gap-2 items-center">
                          <div className="flex flex-col">
                            <span className="text-small">{operator.name}</span>
                            <span className="text-tiny text-default-400">{operator.description}</span>
                          </div>
                        </div>
                      </SelectItem>
                    )}
                  </Select>
                  <Input
                    size="sm"
                    className={className}
                    label="파라미터명"
                    isRequired
                    errorMessage="필수 항목을 입력해 주세요."
                    labelPlacement="outside"
                    placeholder="slitmCd"
                    name="paramName"
                    type="text"
                    value={rule.paramName}
                    onChange={(e) => onChange(index, 'paramName', e.target.value)}
                  />
                  <Input
                    size="sm"
                    className={className}
                    label="파라미터값"
                    isRequired
                    errorMessage="필수 항목을 입력해 주세요."
                    labelPlacement="outside"
                    placeholder="40A000001"
                    name="paramValue"
                    type="text"
                    value={rule.paramValue}
                    onChange={(e) => onChange(index, 'paramValue', e.target.value)}
                  />
                  <Input
                    size="sm"
                    className={className}
                    label="비고"
                    labelPlacement="outside"
                    name="description"
                    type="text"
                    value={rule.description}
                    onChange={(e) => onChange(index, 'description', e.target.value)}
                  />
                </div>
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

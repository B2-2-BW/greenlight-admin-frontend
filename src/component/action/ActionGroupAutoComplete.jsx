import { useEffect, useState } from 'react';
import { Autocomplete, AutocompleteItem } from '@heroui/react';
import { useFilter } from '@react-aria/i18n';
import { ActionGroupClient } from '../../api/action-group/index.js';
import { ToastUtil } from '../../util/toastUtil.js';
import { requiredInputProps } from '../../shared/props.js';
const animals = [
  { label: 'Cat', key: 'cat', description: 'The second most popular pet in the world' },
  { label: 'Dog', key: 'dog', description: 'The most popular pet in the world' },
  { label: 'Elephant', key: 'elephant', description: 'The largest land animal' },
  { label: 'Lion', key: 'lion', description: 'The king of the jungle' },
  { label: 'Tiger', key: 'tiger', description: 'The largest cat species' },
  { label: 'Giraffe', key: 'giraffe', description: 'The tallest land animal' },
  {
    label: 'Dolphin',
    key: 'dolphin',
    description: 'A widely distributed and diverse group of aquatic mammals',
  },
  { label: 'Penguin', key: 'penguin', description: 'A group of aquatic flightless birds' },
  { label: 'Zebra', key: 'zebra', description: 'A several species of African equids' },
  {
    label: 'Shark',
    key: 'shark',
    description: 'A group of elasmobranch fish characterized by a cartilaginous skeleton',
  },
  {
    label: 'Whale',
    key: 'whale',
    description: 'Diverse group of fully aquatic placental marine mammals',
  },
  { label: 'Otter', key: 'otter', description: 'A carnivorous mammal in the subfamily Lutrinae' },
  { label: 'Crocodile', key: 'crocodile', description: 'A large semiaquatic reptile' },
];

export default function ActionGroupAutoComplete({ action }) {
  const [actionGroups, setActionGroups] = useState([]);

  const [fieldState, setFieldState] = useState({
    selectedKey: '',
    inputValue: '',
    items: [],
  });

  useEffect(() => {
    if (!action?.id) {
      return;
    }
    // actionId의 변경 == 액션 편집 모달 창이 껐다 켜짐
    ActionGroupClient.getActionGroupList()
      .then((data) => {
        setActionGroups(data);
      })
      .catch((err) => {
        console.log(err);
        ToastUtil.error('액션 그룹 로딩에 실패했습니다.', err);
      });
  }, [action]);

  const { startsWith } = useFilter({ sensitivity: 'base' });

  const onSelectionChange = (actionGroupId) => {
    setFieldState((prevState) => {
      let selectedItem = prevState.items.find((option) => option.id === parseInt(actionGroupId));
      return {
        inputValue: selectedItem?.name || '',
        selectedKey: actionGroupId,
        items: actionGroups.filter((item) => startsWith(item.name, selectedItem?.name || '')),
      };
    });
  };
  const onInputChange = (value) => {
    setFieldState((prevState) => ({
      inputValue: value,
      selectedKey: prevState.selectedKey,
      items: actionGroups.filter((item) => startsWith(item.name, value || '')),
    }));
  };
  const onOpenChange = (isOpen, menuTrigger) => {
    if (isOpen) {
      setFieldState((prevState) => ({
        inputValue: prevState.inputValue,
        selectedKey: prevState.selectedKey,
        items: actionGroups,
      }));
    }
  };
  return (
    <>
      <Autocomplete
        className="max-w-[14rem]"
        inputValue={fieldState.inputValue}
        items={fieldState.items}
        label="액션 그룹"
        placeholder="..."
        selectedKey={fieldState.selectedKey}
        onInputChange={onInputChange}
        onOpenChange={onOpenChange}
        onSelectionChange={onSelectionChange}
        isClearable={false}
        scrollShadowProps={{
          isEnabled: true,
        }}
        {...requiredInputProps}
      >
        {(actionGroup) => (
          <AutocompleteItem key={actionGroup.id} textValue={actionGroup.name}>
            <div>
              <div className="flex flex-col">
                <span className="font-medium text-base">{actionGroup.description}</span>
                <span className="text-sm">{actionGroup.name}</span>
              </div>
            </div>
          </AutocompleteItem>
        )}
      </Autocomplete>
    </>
  );
}

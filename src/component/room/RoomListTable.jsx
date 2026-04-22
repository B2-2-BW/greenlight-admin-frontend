import { useCallback, useEffect, useState } from 'react';
import { Checkbox, Skeleton, Spinner, Table } from '@heroui/react';
import RoomStatusChip from './RoomStatusChip.jsx';
import { toDateHtml } from '../../util/dateUtil.jsx';
import { RoomClient } from '../../api/room/index.js';

const columns = [
  { name: 'checkbox', uid: 'checkbox' },
  { name: 'ID', uid: 'roomId' },
  { name: '이름', uid: 'description' },
  { name: '환경', uid: 'roomEnvironment' },
  { name: '활성/비활성', uid: 'enabled' },
  { name: '최대사용자수', uid: 'capacity' },
  { name: '수정일자', uid: 'updatedAt' },
];

function CheckBoxColumn({ id }) {
  return (
    <Table.Column id={id} className="pr-0">
      <Checkbox aria-label="Select all" slot="selection">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox>
    </Table.Column>
  );
}

export default function RoomListTable({ onPress }) {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedKeys, setSelectedKeys] = useState([]);
  useEffect(() => {
    const fetchRoomList = async () => {
      RoomClient.getRoomList()
        .then((res) => {
          const data = res.data;
          setRooms(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          setRooms([]);
          console.log(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };
    fetchRoomList();
  }, []);

  const renderCell = useCallback((room, columnKey) => {
    const cellValue = room[columnKey];
    switch (columnKey) {
      case 'checkbox':
        return (
          <Checkbox slot="selection" variant="secondary">
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
          </Checkbox>
        );
      case 'description':
        return (
          <div className="flex flex-col">
            <span className="text-base font-medium">{room.name} </span>
            <span className="text-sm text-default-500">{cellValue}</span>
          </div>
        );
      case 'enabled':
        return <RoomStatusChip enabled={cellValue} />;
      case 'updatedAt':
        return toDateHtml(cellValue);
      case 'maxTrafficPerSecond':
        return (
          <div>
            <span>{cellValue}</span>
            <span className="ml-1 text-xs text-neutral-500">{cellValue === 0 ? '(진입불가)' : ''}</span>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <>
      <Table>
        <Table.Content
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          aria-label="테이블"
          onRowAction={(key) => onPress(key)}
        >
          <Table.Header columns={columns} style={{ padding: 0, margin: 0 }}>
            {(column) =>
              column.uid === 'checkbox' ? (
                <CheckBoxColumn id={column.uid} />
              ) : (
                <Table.Column id={column.uid} isRowHeader={column.name === 'ID'}>
                  {column.name}
                </Table.Column>
              )
            }
          </Table.Header>
          <Table.Body>
            {isLoading && (
              <Table.LoadMore isLoading={isLoading}>
                <Table.LoadMoreContent>
                  <Spinner size="md" color="accent" />
                </Table.LoadMoreContent>
              </Table.LoadMore>
            )}
            {!isLoading && (
              <Table.Collection items={rooms}>
                {(room) => (
                  <Table.Row id={room.roomId} className="cursor-pointer">
                    {columns.map((column) => (
                      <Table.Cell key={column.uid}>{renderCell(room, column.uid)}</Table.Cell>
                    ))}
                  </Table.Row>
                )}
              </Table.Collection>
            )}
          </Table.Body>
        </Table.Content>
      </Table>
    </>
  );
}

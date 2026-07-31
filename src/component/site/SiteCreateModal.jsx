import { Button, FieldError, Form, Input, Label, Modal, TextField } from '@heroui/react';
import { useState } from 'react';
import { SiteClient } from '../../api/site/index.js';
import { ToastUtil } from '../../util/toastUtil.js';

const initialForm = {
  siteId: '',
  siteName: '',
  siteDescription: '',
  reason: '',
};

export default function SiteCreateModal({ isOpen, onOpenChange, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [isPending, setIsPending] = useState(false);

  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const handleOpenChange = (open) => {
    onOpenChange(open);
    if (!open && !isPending) setForm(initialForm);
  };
  const submit = async (event) => {
    event.preventDefault();
    setIsPending(true);
    try {
      const { data } = await SiteClient.createSite({
        siteId: form.siteId,
        siteName: form.siteName,
        siteDescription: form.siteDescription,
        reason: form.reason,
      });
      setForm(initialForm);
      onCreated(data);
      ToastUtil.success('사이트 생성', '사이트를 생성했습니다.');
    } catch (error) {
      ToastUtil.error('사이트 생성', error.response?.data?.detail ?? '사이트를 생성하지 못했습니다.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <Modal.CloseTrigger />
            <Modal.Header><Modal.Heading>사이트 생성</Modal.Heading></Modal.Header>
            <Form onSubmit={submit} validationBehavior="native">
              <Modal.Body className="flex flex-col gap-4">
                <TextField isRequired className="w-full">
                  <Label>사이트 ID</Label>
                  <Input
                    value={form.siteId}
                    onChange={change('siteId')}
                    maxLength={4}
                    pattern="[A-Za-z0-9_-]+"
                    placeholder="영문, 숫자, _, - 조합 4자 이내"
                  />
                  <FieldError>영문, 숫자, _, - 조합으로 4자 이내로 입력해 주세요.</FieldError>
                </TextField>
                <TextField isRequired className="w-full">
                  <Label>사이트명</Label>
                  <Input value={form.siteName} onChange={change('siteName')} maxLength={255} />
                  <FieldError>사이트명을 입력해 주세요.</FieldError>
                </TextField>
                <TextField className="w-full">
                  <Label>사이트 설명</Label>
                  <Input value={form.siteDescription} onChange={change('siteDescription')} maxLength={4000} />
                </TextField>
                <TextField isRequired className="w-full">
                  <Label>생성 사유</Label>
                  <Input value={form.reason} onChange={change('reason')} maxLength={1000} />
                  <FieldError>생성 사유를 입력해 주세요.</FieldError>
                </TextField>
                <p className="text-sm text-muted">사이트는 활성 상태로 생성되며 대기열 운영은 비활성 상태로 시작합니다.</p>
              </Modal.Body>
              <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button slot="close" type="button" variant="tertiary" className="w-full sm:w-auto">취소</Button>
                <Button type="submit" isPending={isPending} className="w-full sm:w-auto">사이트 생성</Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

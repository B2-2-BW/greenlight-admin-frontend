import {
  Button,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  Skeleton,
  Switch,
  TextField,
} from '@heroui/react';
import { ArrowLeft } from '@gravity-ui/icons';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { SiteClient } from '../api/site/index.js';
import FormSection from '../component/common/FormSection.jsx';
import ConfirmAlertDialog from '../component/ConfirmAlertDialog.jsx';
import { useUserStore } from '../store/user.jsx';
import { ToastUtil } from '../util/toastUtil.js';

const fieldClass = 'ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent';
const enabledMessage = {
  true: {
    title: '사이트 활성화',
    subtitle: '사이트 관리자가 어드민에 로그인하고 대기열을 제어할 수 있습니다.',
  },
  false: {
    title: '사이트 비활성화',
    subtitle: '사이트 관리자가 어드민에 로그인하거나 대기열을 제어할 수 없습니다.',
  },
};

function FieldsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-18 w-full max-w-2xl rounded-lg" />
      ))}
    </div>
  );
}

export default function SiteDetailPage() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const role = useUserStore((state) => state.user?.userRole ?? state.user?.role);
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [isKeyRotationPending, setIsKeyRotationPending] = useState(false);
  const [isKeyRotationConfirmOpen, setIsKeyRotationConfirmOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState(null);
  const load = useCallback(async () => {
    try {
      const { data } = await SiteClient.getManagedSite(siteId);
      setSite(data);
      setName(data.siteName ?? '');
      setDescription(data.siteDescription ?? '');
      setEnabled(Boolean(data.siteEnabled));
    } catch (error) {
      console.error(error);
      ToastUtil.error('사이트 상세', '사이트 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [siteId]);
  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { siteName: name, siteDescription: description, siteEnabled: enabled };
      const { data } = await SiteClient.updateSiteInfo(siteId, payload);
      setSite(data);
      setName(data.siteName ?? '');
      setDescription(data.siteDescription ?? '');
      setEnabled(Boolean(data.siteEnabled));
      ToastUtil.success('사이트 관리', '사이트 정보를 저장했습니다.');
    } catch (error) {
      console.error(error);
      ToastUtil.error('사이트 관리', error.response?.data?.detail ?? '사이트 정보를 저장하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };
  const rotateApiKey = async () => {
    setIsKeyRotationPending(true);
    try {
      const { data } = await SiteClient.rotateSiteApiKey(siteId);
      setNewApiKey(data.apiKey);
    } catch (error) {
      ToastUtil.error('API Key 발급', error.response?.data?.detail ?? '새 API Key를 발급하지 못했습니다.');
    } finally {
      setIsKeyRotationPending(false);
    }
  };
  const closeNewApiKey = (open) => {
    if (!open) {
      setNewApiKey(null);
    }
  };
  const copyNewApiKey = async () => {
    try {
      await navigator.clipboard.writeText(newApiKey);
      ToastUtil.success('API Key 발급', '새 API Key를 복사했습니다.');
    } catch {
      ToastUtil.error('API Key 발급', 'API Key를 복사하지 못했습니다.');
    }
  };
  return (
    <div className="w-full bg-neutral-50">
      <div className="max-w-[1080px] p-4 sm:p-6">
        <header className="mb-4 mt-4 flex items-center justify-between gap-4 sm:mt-8">
          <h1 className="text-2xl font-bold sm:text-3xl">사이트 상세</h1>
          <Button
            size="lg"
            isIconOnly
            variant="ghost"
            onPress={() => navigate('/sites')}
            aria-label="사이트 목록으로 돌아가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </header>
        {loading ? (
          <>
            <FormSection title="사이트 정보">
              <FieldsSkeleton />
            </FormSection>
            <FormSection title="운영 상태">
              <FieldsSkeleton />
            </FormSection>
          </>
        ) : !site ? (
          <p className="py-10 text-center text-sm text-muted">사이트 정보를 찾을 수 없습니다.</p>
        ) : (
          <>
            <Form className="flex flex-col gap-4" validationBehavior="native" onSubmit={submit}>
              <FormSection title="사이트 정보">
                <div className="flex w-full flex-col gap-6">
                  <TextField className="w-full max-w-2xl" isReadOnly>
                    <Label className="text-base">사이트 ID</Label>
                    <Input className="ring-1 focus:ring-2 ring-neutral-200 bg-neutral-100" value={site.siteId} />
                  </TextField>
                  <TextField name="siteName" className="w-full max-w-2xl" isRequired>
                    <Label className="text-base">사이트명</Label>
                    <Input className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} />
                    <FieldError>사이트명을 입력해 주세요.</FieldError>
                  </TextField>
                  <TextField className="w-full max-w-2xl">
                    <Label className="text-base">사이트 설명</Label>
                    <Input
                      className={fieldClass}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </TextField>
                </div>
              </FormSection>
              <FormSection title="운영 상태">
                <div className="flex flex-col gap-2">
                  <Label className="text-base" isRequired>
                    사이트 활성/비활성화
                  </Label>
                  <Switch
                    isSelected={enabled}
                    onChange={setEnabled}
                    className="group w-full max-w-lg"
                  >
                    <Switch.Content className="flex min-h-20 w-full flex-row-reverse items-center justify-between gap-3 rounded-lg border-2 border-default bg-white p-4 hover:bg-neutral-100 group-data-[selected=true]:border-accent">
                      <Switch.Control>
                        <Switch.Thumb>
                          <Switch.Icon />
                        </Switch.Thumb>
                      </Switch.Control>
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="text-base">{enabledMessage[enabled].title}</span>
                        <span className="text-sm text-muted">{enabledMessage[enabled].subtitle}</span>
                      </span>
                    </Switch.Content>
                  </Switch>
                </div>
              </FormSection>
              {role === 'SUPER' && (
                <FormSection title="API Key">
                  <div className="flex max-w-2xl flex-col gap-4">
                    <Description className="text-sm text-muted">
                      기존 API Key를 폐기하고 새로운 API Key를 발급합니다.
                    </Description>
                    <ConfirmAlertDialog
                      title="새 API Key를 발급할까요?"
                      message="기존 API Key는 즉시 만료되며 되돌릴 수 없습니다."
                      confirmMessage="새 API Key 발급"
                      isOpen={isKeyRotationConfirmOpen}
                      onOpenChange={setIsKeyRotationConfirmOpen}
                      onConfirm={rotateApiKey}
                    >
                      <Button
                        type="button"
                        isPending={isKeyRotationPending}
                        isDisabled={isKeyRotationPending}
                        className="min-h-11"
                      >
                        새 API Key 발급
                      </Button>
                    </ConfirmAlertDialog>
                  </div>
                </FormSection>
              )}
              <div className="sticky bottom-0 z-20 mt-4 w-full rounded-xl bg-white/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur">
                <Button type="submit" size="lg" isPending={saving} fullWidth className="min-h-11">
                  저장하기
                </Button>
              </div>
            </Form>
          </>
        )}
      </div>
      <Modal isOpen={newApiKey !== null} onOpenChange={closeNewApiKey}>
        <Modal.Backdrop className="z-49">
          <Modal.Container size="sm">
            <Modal.Dialog className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-md">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>새 API Key</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4">
                <p className="text-sm text-danger">이 화면을 닫으면 다시 확인할 수 없습니다.</p>
                <Input isReadOnly value={newApiKey ?? ''} className="font-mono text-sm" />
              </Modal.Body>
              <Modal.Footer className="flex-col-reverse gap-2 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
                <Button onPress={copyNewApiKey} className="min-h-11 w-full sm:w-auto">
                  복사하기
                </Button>
                <Button slot="close" variant="tertiary" className="min-h-11 w-full sm:w-auto">
                  닫기
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}

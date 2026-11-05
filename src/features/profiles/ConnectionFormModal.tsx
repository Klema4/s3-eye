import { FormEvent, useEffect, useState } from "react";
import { api, ProfileInput } from "../../lib/tauri";
import { useAppStore } from "../../store/appStore";
import { Modal } from "../../design/Modal";
import { Button } from "../../design/Button";
import { Field, Input } from "../../design/Input";
import { Select } from "../../design/Select";

export function ConnectionFormModal() {
  const open = useAppStore((s) => s.connectionFormOpen);
  const setOpen = useAppStore((s) => s.setConnectionFormOpen);
  const saveProfile = useAppStore((s) => s.saveProfile);
  const testConnection = useAppStore((s) => s.testConnection);
  const pushToast = useAppStore((s) => s.pushToast);

  const [preset, setPreset] = useState("b2");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("eu-central-003");
  const [endpoint, setEndpoint] = useState("");
  const [bucket, setBucket] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secret, setSecret] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      if (preset === "b2" && region) {
        const ep = await api.b2DefaultEndpoint(region);
        setEndpoint(ep);
      }
    })();
  }, [open, preset, region]);

  const buildInput = (): ProfileInput => ({
    id: savedId ?? undefined,
    name: name.trim(),
    preset,
    endpoint: endpoint.trim(),
    region: region.trim(),
    bucket: bucket.trim(),
    accessKeyId: accessKeyId.trim(),
    secretAccessKey: secret || undefined,
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const profile = await saveProfile(buildInput());
      setSavedId(profile.id);
      setSecret("");
      pushToast("Connection saved", "success");
    } catch (err) {
      pushToast(String(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const onTest = async () => {
    setBusy(true);
    try {
      let id = savedId;
      if (!id) {
        const profile = await saveProfile(buildInput());
        id = profile.id;
        setSavedId(id);
      }
      await testConnection(id);
    } catch (err) {
      pushToast(String(err), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title="New connection" onClose={() => setOpen(false)} width={520}>
      <form className="stack" onSubmit={(e) => void onSubmit(e)}>
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Provider">
          <Select
            label="Provider"
            value={preset}
            onChange={setPreset}
            options={[
              { value: "b2", label: "Backblaze B2" },
              { value: "custom", label: "S3 compatible" },
            ]}
          />
        </Field>
        <Field label="Region">
          <Input value={region} onChange={(e) => setRegion(e.target.value)} required />
        </Field>
        <Field label="Endpoint">
          <Input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} required />
        </Field>
        <Field label="Bucket">
          <Input value={bucket} onChange={(e) => setBucket(e.target.value)} required />
        </Field>
        <Field label="Access key ID">
          <Input value={accessKeyId} onChange={(e) => setAccessKeyId(e.target.value)} required />
        </Field>
        <Field label="Secret access key">
          <Input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder={savedId ? "Unchanged if left empty" : "Enter secret access key"}
            required={!savedId}
          />
        </Field>
        <div className="form-footer">
          <Button type="button" onClick={() => void onTest()} disabled={busy}>
            Verify connection
          </Button>
          <Button type="submit" variant="primary" disabled={busy}>
            Save connection
          </Button>
        </div>
      </form>
    </Modal>
  );
}

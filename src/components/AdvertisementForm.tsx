type Props = {
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function AdvertisementForm({
  children,
  onSubmit,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-2xl bg-white p-8 shadow"
    >
      {children}
    </form>
  );
}
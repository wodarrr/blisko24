import Link from "next/link";

type Props = {
  title: string;
  value?: string | number;
  href: string;
  icon: string;
  description?: string;
  accent?: "blue" | "green" | "red" | "yellow" | "slate";
};

const accentStyles = {
  blue: {
    icon: "bg-blue-100 text-blue-700",
    value: "text-blue-700",
    hover: "hover:border-blue-200 hover:shadow-blue-100",
  },
  green: {
    icon: "bg-green-100 text-green-700",
    value: "text-green-700",
    hover: "hover:border-green-200 hover:shadow-green-100",
  },
  red: {
    icon: "bg-red-100 text-red-700",
    value: "text-red-600",
    hover: "hover:border-red-200 hover:shadow-red-100",
  },
  yellow: {
    icon: "bg-yellow-100 text-yellow-700",
    value: "text-yellow-600",
    hover: "hover:border-yellow-200 hover:shadow-yellow-100",
  },
  slate: {
    icon: "bg-slate-100 text-slate-700",
    value: "text-slate-700",
    hover: "hover:border-slate-300 hover:shadow-slate-100",
  },
};

export default function AccountCard({
  title,
  value,
  href,
  icon,
  description,
  accent = "blue",
}: Props) {
  const styles = accentStyles[accent];

  return (
    <Link
      href={href}
      className={`group flex min-h-52 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${styles.hover}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${styles.icon}`}
        >
          {icon}
        </div>

        <span className="text-2xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500">
          →
        </span>
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="text-xl font-extrabold text-slate-900">
          {title}
        </h3>

        {description && (
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}

        {value !== undefined && (
          <p className={`mt-auto pt-5 text-4xl font-extrabold ${styles.value}`}>
            {value}
          </p>
        )}
      </div>
    </Link>
  );
}
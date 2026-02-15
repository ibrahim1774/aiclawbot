import {
  Calendar,
  Mail,
  MessageSquare,
  Globe,
  Clock,
  Inbox,
  CreditCard,
  Bell,
  CalendarDays,
  Timer,
  Receipt,
  ListChecks,
  Calculator,
  HandCoins,
  Tag,
  Search,
  Percent,
  AlertCircle,
  ShoppingCart,
  PenTool,
  FileText,
  Users,
  Filter,
  FileSpreadsheet,
  Briefcase,
  BarChart3,
  Newspaper,
  Target,
  MailX,
  FileCheck,
  CalendarRange,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Pill {
  icon: LucideIcon;
  label: string;
  dashed?: boolean;
}

const rows: { pills: Pill[]; direction: "left" | "right"; duration: string }[] =
  [
    {
      direction: "left",
      duration: "25s",
      pills: [
        { icon: Calendar, label: "Schedule meetings from chat" },
        { icon: Mail, label: "Read & summarize email", dashed: true },
        { icon: MessageSquare, label: "Draft replies and follow-ups" },
        { icon: Globe, label: "Translate messages" },
        { icon: Clock, label: "Take meeting notes", dashed: true },
        { icon: Inbox, label: "Organize inbox" },
      ],
    },
    {
      direction: "right",
      duration: "30s",
      pills: [
        { icon: CreditCard, label: "Manage subscriptions", dashed: true },
        { icon: Bell, label: "Remind you of deadlines" },
        { icon: CalendarDays, label: "Plan your week" },
        { icon: Timer, label: "Sync across time zones", dashed: true },
        { icon: Receipt, label: "Track expenses" },
        { icon: ListChecks, label: "Weekly planning" },
      ],
    },
    {
      direction: "left",
      duration: "35s",
      pills: [
        { icon: Calculator, label: "Run payroll calculations" },
        { icon: HandCoins, label: "Negotiate refunds", dashed: true },
        { icon: Tag, label: "Find coupons" },
        { icon: Search, label: "Find best prices online" },
        { icon: Percent, label: "Find discount codes", dashed: true },
        { icon: AlertCircle, label: "Price-drop alerts" },
        { icon: ShoppingCart, label: "Compare products" },
      ],
    },
    {
      direction: "right",
      duration: "28s",
      pills: [
        { icon: PenTool, label: "Draft social posts", dashed: true },
        { icon: FileText, label: "Write contracts and NDAs" },
        { icon: Search, label: "Research competitors" },
        { icon: Filter, label: "Screen and prioritize leads", dashed: true },
        { icon: Briefcase, label: "Draft job descriptions" },
        { icon: FileSpreadsheet, label: "Generate invoices" },
      ],
    },
    {
      direction: "left",
      duration: "32s",
      pills: [
        { icon: BarChart3, label: "Track OKRs and KPIs" },
        { icon: Newspaper, label: "Monitor news and alerts", dashed: true },
        { icon: Target, label: "Set and track goals" },
        { icon: MailX, label: "Screen cold outreach" },
        { icon: FileCheck, label: "Draft invoices", dashed: true },
        { icon: CalendarRange, label: "Content calendar" },
      ],
    },
  ];

function PillTag({ pill }: { pill: Pill }) {
  const Icon = pill.icon;
  return (
    <div
      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm text-white whitespace-nowrap ${
        pill.dashed
          ? "border border-dashed border-card-border-hover"
          : "border border-card-border"
      } bg-card`}
    >
      <Icon className="h-4 w-4 text-muted" />
      {pill.label}
    </div>
  );
}

export default function UseCasesMarquee() {
  return (
    <section className="overflow-hidden py-20">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          What can your AI assistant do for you?
        </h2>
        <p className="mt-3 text-lg text-muted">
          One assistant, thousands of use cases
        </p>
      </div>

      <div className="mt-12 space-y-4">
        {rows.map((row, i) => (
          <div key={i} className="overflow-hidden">
            <div
              className={`flex w-max gap-3 ${
                row.direction === "left"
                  ? "animate-marquee-left"
                  : "animate-marquee-right"
              }`}
              style={
                { "--duration": row.duration } as React.CSSProperties
              }
            >
              {/* Render pills twice for seamless loop */}
              {row.pills.map((pill, j) => (
                <PillTag key={`a-${j}`} pill={pill} />
              ))}
              {row.pills.map((pill, j) => (
                <PillTag key={`b-${j}`} pill={pill} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-sm italic text-muted">
        PS. You can add as many use cases as you want via natural language
      </p>
    </section>
  );
}

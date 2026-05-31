import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  MessageSquare,
  Clock,
  Lock,
  PackageCheck,
  Truck,
  Search,
  Hammer,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import type { RequestSummary } from "@workspace/api-client-react";

export type ResponseTypeKey =
  | "have"
  | "can_get"
  | "can_find"
  | "can_make"
  | "service";

export const RESPONSE_TYPE_META: Record<
  ResponseTypeKey,
  { label: string; short: string; icon: LucideIcon }
> = {
  have: { label: "Has it", short: "Has it", icon: PackageCheck },
  can_get: { label: "Can get it", short: "Can get", icon: Truck },
  can_find: { label: "Can find it", short: "Can find", icon: Search },
  can_make: { label: "Can make it", short: "Can make", icon: Hammer },
  service: { label: "Offers a service", short: "Service", icon: Briefcase },
};

export const RESPONSE_TYPE_ORDER: ResponseTypeKey[] = [
  "have",
  "can_get",
  "can_find",
  "can_make",
  "service",
];

interface RequestCardProps {
  request: RequestSummary;
  showResponses?: boolean;
  /** Show lead-teaser blur — for non-subscribed seller users */
  teaser?: boolean;
}

export function RequestCard({ request, showResponses = true, teaser = false }: RequestCardProps) {
  const urgencyColors = {
    low: "bg-blue-50 text-blue-700 border-blue-100",
    normal: "bg-amber-50 text-amber-700 border-amber-100",
    high: "bg-red-50 text-red-700 border-red-100",
  };

  const formatBudget = (min?: number | null, max?: number | null) => {
    if (min && max) return `$${min} – $${max}`;
    if (min) return `Over $${min}`;
    if (max) return `Up to $${max}`;
    return "Open budget";
  };

  const typeCounts = request.responseTypeCounts ?? {};
  const responseTypeChips = RESPONSE_TYPE_ORDER.flatMap((key) => {
    const count = typeCounts[key] ?? 0;
    if (count <= 0) return [];
    const meta = RESPONSE_TYPE_META[key];
    return [
      {
        key,
        label: meta.label,
        short: meta.short,
        Icon: meta.icon,
        count,
      },
    ];
  });

  if (teaser) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-white shadow-md">
        <div className="pointer-events-none select-none blur-[3px] p-6">
          <div className="mb-2 flex gap-2">
            <span className="rounded-full border bg-background px-2 py-0.5 text-xs capitalize">{request.category}</span>
          </div>
          <div className="h-5 w-3/4 rounded bg-muted mb-1" />
          <div className="h-4 w-full rounded bg-muted mb-1" />
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <span>📍 {request.location || "Nearby"}</span>
            <span>💰 {formatBudget(request.budgetMin, request.budgetMax)}</span>
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px]">
          <Lock className="mb-2 h-6 w-6 text-[#D4AF37]" />
          <p className="text-center text-sm font-semibold text-[#0B3954]">
            Someone {request.location ? `in ${request.location}` : "nearby"} is looking for{" "}
            <span className="italic">{request.category}</span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Budget: {formatBudget(request.budgetMin, request.budgetMax)}
          </p>
          <Link href="/pricing" className="mt-3 inline-block rounded-full bg-[#D4AF37] px-4 py-1.5 text-xs font-semibold text-[#0B3954] hover:bg-[#c9a430]">
            Unlock for $4.99/mo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/requests/${request.id}`} className="block group">
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border border-border/60 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <Badge className="font-semibold rounded-full bg-[#0B3954] text-white border-0 text-[10px]">
                  Looking For
                </Badge>
                <Badge
                  variant="outline"
                  className="font-normal capitalize rounded-full text-[#0B3954] border-[#0B3954]/20 bg-[#0B3954]/5"
                >
                  {request.category}
                </Badge>
                <Badge
                  className={`font-medium capitalize rounded-full border text-xs ${urgencyColors[request.urgency]}`}
                >
                  {request.urgency === "high" ? "Urgent" : request.urgency === "low" ? "Flexible" : "Seeking"}
                </Badge>
                {request.isPrivate && (
                  <Badge className="rounded-full bg-[#D4AF37]/15 text-[#0B3954] border-[#D4AF37]/30 text-xs font-medium">
                    <Lock className="mr-1 h-2.5 w-2.5" />
                    Private
                  </Badge>
                )}
                {request.status !== "open" && (
                  <Badge variant={request.status === "fulfilled" ? "default" : "secondary"} className="rounded-full">
                    {request.status}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-bold font-serif leading-tight group-hover:text-primary transition-colors line-clamp-2 text-[#0B3954]">
                {request.title}
              </h3>
            </div>
            <div className="text-right whitespace-nowrap shrink-0">
              <div className="font-semibold text-lg text-[#0B3954]">
                {formatBudget(request.budgetMin, request.budgetMax)}
              </div>
              {(request.lengthIn || request.widthIn) && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {request.lengthIn}″ × {request.widthIn}″
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed mb-3">
            {request.description}
          </p>
          {request.style && (
            <p className="text-xs text-[#D4AF37] font-medium mb-2 italic">Style: {request.style}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>{request.location || "Anywhere"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
          {showResponses && responseTypeChips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {responseTypeChips.map(({ key, label, short, Icon, count }) => (
                <span
                  key={key}
                  title={`${count} seller${count === 1 ? "" : "s"} ${label.toLowerCase()}`}
                  className="inline-flex items-center gap-1 rounded-full border border-[#0B3954]/15 bg-[#0B3954]/5 px-2 py-0.5 text-[11px] font-medium text-[#0B3954]"
                >
                  <Icon className="h-3 w-3 text-[#D4AF37]" />
                  {short}
                  <span className="text-[#0B3954]/50">{count}</span>
                </span>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-3 border-t border-border/50 flex justify-between items-center bg-[#0B3954]/[0.02]">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={request.buyer.avatarUrl} alt={request.buyer.name} />
              <AvatarFallback>{request.buyer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-[#0B3954]">{request.buyer.name}</span>
          </div>
          {showResponses && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#D4AF37]">
              <MessageSquare className="h-4 w-4" />
              <span>{request.responseCount} {request.responseCount === 1 ? "offer" : "offers"}</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}

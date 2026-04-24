import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, MessageSquare, Clock } from "lucide-react";
import type { RequestSummary } from "@workspace/api-client-react";

interface RequestCardProps {
  request: RequestSummary;
  showResponses?: boolean;
}

export function RequestCard({ request, showResponses = true }: RequestCardProps) {
  const urgencyColors = {
    low: "bg-secondary/10 text-secondary-foreground hover:bg-secondary/20",
    normal: "bg-primary/10 text-primary hover:bg-primary/20",
    high: "bg-destructive/10 text-destructive hover:bg-destructive/20",
  };

  const formatBudget = (min?: number | null, max?: number | null) => {
    if (min && max) return `$${min} - $${max}`;
    if (min) return `Over $${min}`;
    if (max) return `Up to $${max}`;
    return "Open budget";
  };

  return (
    <Link href={`/requests/${request.id}`} className="block group">
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/30 border bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline" className="font-normal capitalize rounded-full bg-background">
                  {request.category}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={`font-medium capitalize rounded-full ${urgencyColors[request.urgency]}`}
                >
                  {request.urgency} urgency
                </Badge>
                {request.status !== 'open' && (
                  <Badge variant={request.status === 'fulfilled' ? "default" : "secondary"}>
                    {request.status}
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-bold font-serif leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {request.title}
              </h3>
            </div>
            <div className="text-right whitespace-nowrap">
              <div className="font-semibold text-lg text-foreground">
                {formatBudget(request.budgetMin, request.budgetMax)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed mb-4">
            {request.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{request.location || "Anywhere"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t border-border/50 bg-muted/20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={request.buyer.avatarUrl} alt={request.buyer.name} />
              <AvatarFallback>{request.buyer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{request.buyer.name}</span>
          </div>
          
          {showResponses && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <MessageSquare className="h-4 w-4" />
              <span>
                {request.responseCount} {request.responseCount === 1 ? 'offer' : 'offers'}
              </span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}

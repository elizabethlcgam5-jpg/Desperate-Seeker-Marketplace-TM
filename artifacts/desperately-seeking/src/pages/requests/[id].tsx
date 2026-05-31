import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TierBadge } from "@/components/tier-badge";
import {
  useGetRequest,
  useGetCurrentUser,
  useListResponsesForRequest,
  useUpdateResponseStatus,
  useCreateResponse,
  useUpdateRequest
} from "@workspace/api-client-react";
import { useLocation, useParams, Link } from "wouter";
import { formatDistanceToNow, format } from "date-fns";
import { MapPin, Clock, MessageSquare, CheckCircle, XCircle, Eye } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { EscrowPanel } from "@/components/escrow-panel";
import { ResponseConversation } from "@/components/response-conversation";

const RESPONSE_TYPES = [
  { value: "have", label: "I have this" },
  { value: "can_get", label: "I can get this" },
  { value: "can_find", label: "I can help you find it" },
  { value: "can_make", label: "I can make this" },
  { value: "service", label: "I offer this as a service" },
] as const;

const RESPONSE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  RESPONSE_TYPES.map((t) => [t.value, t.label]),
);

// Price is required for these (you're quoting a firm number); optional for
// can_find / service where the seller may only give an estimate or none.
const PRICE_REQUIRED_TYPES = ["have", "can_get", "can_make"];

const responseSchema = z
  .object({
    responseType: z.enum(["have", "can_get", "can_find", "can_make", "service"]),
    price: z.preprocess(
      (v) =>
        v === "" || v === null || v === undefined ? undefined : Number(v),
      z.number().min(0).optional(),
    ),
    condition: z.enum(["new", "like_new", "good", "fair", "used"]).optional(),
    message: z.string().min(10, "Please provide a more detailed message"),
    photos: z.string().optional(), // comma separated
  })
  .superRefine((val, ctx) => {
    if (
      PRICE_REQUIRED_TYPES.includes(val.responseType) &&
      val.price === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "Price is required for this option",
      });
    }
  });

export default function RequestDetail() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const { data: currentUser } = useGetCurrentUser();
  const { data: request, isLoading: requestLoading } = useGetRequest(id as string, {
    query: { enabled: !!id },
  });
  const { data: responses, isLoading: responsesLoading } = useListResponsesForRequest(id as string, {
    query: { enabled: !!id },
  });

  const updateResponseStatus = useUpdateResponseStatus();
  const updateRequest = useUpdateRequest();
  const createResponse = useCreateResponse();

  const isBuyer = currentUser?.id === request?.buyer.id;

  const form = useForm<z.infer<typeof responseSchema>>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      responseType: "have",
      price: undefined,
      condition: "good",
      message: "",
      photos: "",
    },
  });

  const responseType = form.watch("responseType");

  const onResponseSubmit = (values: z.infer<typeof responseSchema>) => {
    const photosList = values.photos
      ? values.photos.split(",").map(url => url.trim()).filter(Boolean)
      : [];

    createResponse.mutate(
      {
        requestId: id as string,
        data: {
          responseType: values.responseType,
          price: values.price,
          condition: values.responseType === "have" ? values.condition : undefined,
          message: values.message,
          photos: photosList,
        },
      },
      {
        onSuccess: () => {
          toast.success("Offer sent successfully!");
          setIsResponseDialogOpen(false);
          form.reset();
          queryClient.invalidateQueries();
        },
        onError: () => {
          toast.error("Failed to send offer.");
        },
      }
    );
  };

  const handleAcceptOffer = (responseId: string) => {
    updateResponseStatus.mutate(
      {
        responseId,
        data: { status: "accepted" },
      },
      {
        onSuccess: (data) => {
          toast.success("Offer accepted! You can now chat with the seller.");
          queryClient.invalidateQueries();
          if (data.threadId) {
             setLocation(`/messages/${data.threadId}`);
          }
        },
      }
    );
  };

  const handleDeclineOffer = (responseId: string) => {
    updateResponseStatus.mutate(
      {
        responseId,
        data: { status: "declined" },
      },
      {
        onSuccess: () => {
          toast.success("Offer declined.");
          queryClient.invalidateQueries();
        },
      }
    );
  };

  const handleMarkFulfilled = () => {
    updateRequest.mutate(
      {
        requestId: id as string,
        data: { status: "fulfilled" },
      },
      {
        onSuccess: () => {
          toast.success("Request marked as fulfilled!");
          queryClient.invalidateQueries();
        },
      }
    );
  };

  if (requestLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-32 w-full mb-8" />
        </div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Request not found</h2>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const urgencyColors = {
    low: "bg-secondary/10 text-secondary-foreground",
    normal: "bg-primary/10 text-primary",
    high: "bg-destructive/10 text-destructive",
  };

  const hasAcceptedOffer = responses?.some(r => r.status === "accepted");

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Buyer Request Details
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-normal capitalize bg-background">
                  {request.category}
                </Badge>
                <Badge variant="secondary" className={`font-medium capitalize ${urgencyColors[request.urgency]}`}>
                  {request.urgency} urgency
                </Badge>
                {request.status !== "open" && (
                  <Badge variant={request.status === "fulfilled" ? "default" : "secondary"}>
                    {request.status}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                {request.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{request.location || "Anywhere"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>Posted on {format(new Date(request.createdAt), "PP")}</span>
                </div>
              </div>
            </div>

            <div className="text-left md:text-right shrink-0">
              <p className="text-sm text-muted-foreground mb-1">Budget</p>
              <p className="text-2xl font-semibold">
                {request.budgetMin && request.budgetMax
                  ? `$${request.budgetMin} - $${request.budgetMax}`
                  : request.budgetMax
                  ? `Up to $${request.budgetMax}`
                  : request.budgetMin
                  ? `Over $${request.budgetMin}`
                  : "Open"}
              </p>
            </div>
          </div>

          <div className="mt-8 bg-card border rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Description
            </p>
            <p className="text-lg leading-relaxed whitespace-pre-wrap">
              {request.description}
            </p>
            {request.tags && request.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {request.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="font-normal bg-muted/50">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            {request.photos && request.photos.length > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {request.photos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt={`Reference ${i + 1}`}
                    className="w-full h-32 object-cover rounded-xl border border-border"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Link href={`/profile/${request.buyer.id}`} className="flex items-center gap-3 group">
              <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary transition-colors">
                <AvatarImage src={request.buyer.avatarUrl} alt={request.buyer.name} />
                <AvatarFallback>{request.buyer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground">Requested by</p>
                <p className="text-sm font-medium group-hover:text-primary transition-colors">
                  {request.buyer.name}
                </p>
              </div>
            </Link>

            {isBuyer ? (
              request.status === "open" && (
                <Button variant="outline" onClick={handleMarkFulfilled}>
                  Mark as Fulfilled
                </Button>
              )
            ) : request.status === "open" ? (
              <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="rounded-full shadow-lg shadow-primary/20">
                    Respond
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Respond to this request</DialogTitle>
                    <DialogDescription>
                      Tell the buyer how you can help and set your price.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onResponseSubmit)} className="space-y-6 pt-4">
                      <FormField
                        control={form.control}
                        name="responseType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>How can you help?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {RESPONSE_TYPES.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className={responseType === "have" ? "grid grid-cols-2 gap-4" : ""}>
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {PRICE_REQUIRED_TYPES.includes(responseType)
                                  ? "Price ($)"
                                  : "Price / estimate ($) — optional"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder={
                                    PRICE_REQUIRED_TYPES.includes(responseType)
                                      ? "0"
                                      : "Leave blank if unsure"
                                  }
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {responseType === "have" && (
                          <FormField
                            control={form.control}
                            name="condition"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Condition</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select condition" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="like_new">Like New</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="fair">Fair</SelectItem>
                                    <SelectItem value="used">Used</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message to Buyer</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Hi! Here's how I can help…" className="min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="photos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Photos (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Comma separated image URLs" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={createResponse.isPending}>
                        {createResponse.isPending ? "Sending..." : "Send Offer"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-secondary" />
          Seller Responses ({request.responseCount})
        </h2>

        {responsesLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : responses?.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground">No seller responses yet. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {responses?.map((response) => (
              <Card key={response.id} className={`overflow-hidden ${response.status === 'accepted' ? 'border-primary shadow-sm ring-1 ring-primary/20' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        Seller Response
                      </p>
                      <div className="flex justify-between items-start">
                        <Link href={`/profile/${response.seller.id}`} className="flex items-center gap-2 group">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={response.seller.avatarUrl} alt={response.seller.name} />
                            <AvatarFallback>{response.seller.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium group-hover:text-primary transition-colors">
                            Seller: {response.seller.name}
                          </span>
                          {response.seller.subscriptionTier &&
                            response.seller.subscriptionTier !== "free" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </span>
                            )}
                          <TierBadge tier={response.seller.subscriptionTier} size="xs" />
                          {currentUser?.id === response.seller.id && (
                            <span
                              className="ml-1 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                              title="Buyers who viewed this offer"
                            >
                              <Eye className="h-3 w-3" />
                              {response.viewCount}
                            </span>
                          )}
                        </Link>
                        <div className="text-right">
                          {response.price != null && (
                            <div className="text-xl font-bold">${response.price}</div>
                          )}
                          {response.condition && (
                            <Badge variant="secondary" className="capitalize text-xs font-normal">
                              {response.condition.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Badge className="bg-[#0B3954] text-white border-0 rounded-full text-[11px] font-medium">
                        {RESPONSE_TYPE_LABELS[response.responseType] ?? "I have this"}
                      </Badge>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Message from Seller:
                        </p>
                        <p className="text-sm leading-relaxed">{response.message}</p>
                      </div>

                      <p className="text-sm">
                        <span className="font-medium text-muted-foreground">Status: </span>
                        <span className="capitalize">{response.status}</span>
                      </p>

                      {response.photos && response.photos.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {response.photos.map((photo, i) => (
                            <img key={i} src={photo} alt="Offer photo" className="h-24 w-24 object-cover rounded-md bg-muted" />
                          ))}
                        </div>
                      )}

                      {currentUser &&
                        response.threadId &&
                        (isBuyer || currentUser.id === response.seller.id) && (
                          <ResponseConversation
                            threadId={response.threadId}
                            buyerId={request.buyer.id}
                            currentUserId={currentUser.id}
                          />
                        )}
                    </div>

                    <div className="md:w-48 shrink-0 flex flex-col justify-center items-center gap-3 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-border/50">
                      {response.status === "accepted" ? (
                        <div className="w-full space-y-3">
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center p-2 bg-primary/10 text-primary rounded-full mb-2">
                              <CheckCircle className="w-6 h-6" />
                            </div>
                            <p className="font-medium text-primary">Offer Accepted</p>
                            {(isBuyer || currentUser?.id === response.seller.id) && response.threadId && (
                              <Link href={`/messages/${response.threadId}`}>
                                <Button variant="link" className="mt-1 text-primary text-sm h-auto py-1">Go to Chat</Button>
                              </Link>
                            )}
                          </div>
                          {isBuyer && (
                            <EscrowPanel
                              role="buyer"
                              price={response.price ?? 0}
                              sellerName={response.seller.name}
                              compact
                            />
                          )}
                          {currentUser?.id === response.seller.id && (
                            <EscrowPanel
                              role="seller"
                              price={response.price ?? 0}
                              buyerName={request.buyer.name}
                              compact
                            />
                          )}
                        </div>
                      ) : response.status === "declined" ? (
                        <div className="text-center opacity-50">
                          <XCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="font-medium text-muted-foreground">Declined</p>
                        </div>
                      ) : isBuyer && !hasAcceptedOffer ? (
                        <div className="flex flex-col w-full gap-2">
                          <Button onClick={() => handleAcceptOffer(response.id)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            Accept Offer
                          </Button>
                          <Button variant="ghost" onClick={() => handleDeclineOffer(response.id)} className="w-full text-muted-foreground">
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline" className="font-normal text-muted-foreground">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

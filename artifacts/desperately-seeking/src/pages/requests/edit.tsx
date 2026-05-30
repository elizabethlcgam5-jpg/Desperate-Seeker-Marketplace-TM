import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import {
  useGetRequest,
  useUpdateRequest,
  useGetCurrentUser,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function EditRequest() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: currentUser } = useGetCurrentUser();
  const { data: request, isLoading } = useGetRequest(id as string, {
    query: { enabled: !!id },
  });
  const updateRequest = useUpdateRequest();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [style, setStyle] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [location, setLocationField] = useState("");
  const [urgency, setUrgency] = useState<"low" | "normal" | "high">("normal");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (!request) return;
    setTitle(request.title);
    setDescription(request.description);
    setCategory(request.category ?? "");
    setStyle(request.style ?? "");
    setBudgetMin(request.budgetMin != null ? String(request.budgetMin) : "");
    setBudgetMax(request.budgetMax != null ? String(request.budgetMax) : "");
    setLocationField(request.location ?? "");
    setUrgency(request.urgency);
    setTags((request.tags ?? []).join(", "));
  }, [request]);

  const isOwner = currentUser && request && currentUser.id === request.buyer.id;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    const data = {
      title,
      description,
      category,
      style,
      urgency,
      location,
      budgetMin: budgetMin ? Number(budgetMin) : null,
      budgetMax: budgetMax ? Number(budgetMax) : null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    updateRequest.mutate(
      { requestId: id, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries();
          toast.success("Request updated.");
          setLocation(`/requests/${id}`);
        },
        onError: () => {
          toast.error("Couldn't update the request. Please try again.");
        },
      },
    );
  }

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#0B3954]">
            <Pencil className="h-5 w-5 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#0B3954]">
              Edit Request
            </h1>
            <p className="text-muted-foreground text-sm">
              Update the details of what you're looking for.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#0B3954]/10 rounded-2xl p-6 md:p-8 shadow-md">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !request ? (
            <p className="text-muted-foreground">Request not found.</p>
          ) : !isOwner ? (
            <p className="text-muted-foreground">
              You can only edit your own requests.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="style">Style (optional)</Label>
                  <Input
                    id="style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="budgetMin">Budget min ($)</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="budgetMax">Budget max ($)</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocationField(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Urgency</Label>
                  <Select
                    value={urgency}
                    onValueChange={(v) =>
                      setUrgency(v as "low" | "normal" | "high")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Flexible</SelectItem>
                      <SelectItem value="normal">Seeking</SelectItem>
                      <SelectItem value="high">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="vintage, oak, mid-century"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={updateRequest.isPending}
                  className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0"
                >
                  {updateRequest.isPending ? "Saving…" : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setLocation(`/requests/${id}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

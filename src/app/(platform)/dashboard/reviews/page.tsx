"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { Star, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  serviceName: string;
  advisorName: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/client/appointments", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const items = (data.appointments || [])
            .filter((apt: any) => apt.review)
            .map((apt: any) => ({
              id: apt.review.id,
              rating: apt.review.rating,
              comment: apt.review.comment,
              createdAt: apt.review.createdAt,
              serviceName: apt.service.name,
              advisorName: apt.advisor.user.name,
            }));
          setReviews(items);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          My reviews
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Reviews for your reformer sessions
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="After a session, you can rate your experience."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {review.serviceName}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      with {review.advisorName}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-4 h-4 fill-current",
                          star <= review.rating ? "text-[var(--star)]" : "text-[var(--star-empty)]"
                        )}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-[var(--text-secondary)] bg-[var(--background)] rounded-lg p-3 mt-1">
                    {review.comment}
                  </p>
                )}
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  {format(new Date(review.createdAt), "MMMM d, yyyy", { locale: enUS })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

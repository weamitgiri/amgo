import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { publicService } from "@/api/services/public.service";
import { publicQueryKeys } from "@/hooks/usePublicContent";

/**
 * Admin-managed CMS policy pages (Refund Policy, Legal Policy, …) by slug, in
 * the same layout as the hand-written Privacy / Terms pages.
 */
export const Route = createFileRoute("/policy/$slug")({
  component: PolicyPage,
});

function PolicyPage() {
  const { slug } = Route.useParams();
  const { data: page, isLoading, isError } = useQuery({
    queryKey: [...publicQueryKeys.cms, "slug", slug] as const,
    queryFn: () => publicService.getCmsBySlug(slug),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (page?.title) document.title = `${page.meta_title || page.title} — Zoventro`;
  }, [page?.title, page?.meta_title]);

  return (
    <div className="min-h-screen bg-[oklch(0.975_0.012_290)] flex flex-col">
      <div className="pt-4">
        <Header />
      </div>

      <main className="flex-1 px-4 py-16 max-w-4xl mx-auto w-full">
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-20">Loading…</p>
        ) : isError || !page ? (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
            <p className="mt-3 text-sm text-muted-foreground">This page is not available right now.</p>
            <Link to="/" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{page.title}</h1>
              {page.meta_description && (
                <p className="mt-4 text-muted-foreground text-sm max-w-xl mx-auto">{page.meta_description}</p>
              )}
            </div>

            {/* Content Card — admin-authored rich text from CMS Pages */}
            <div className="bg-card border border-border rounded-[2rem] p-8 md:p-12 shadow-card">
              <div
                className="text-sm text-muted-foreground leading-relaxed space-y-4 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:pt-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:pt-2 [&_h4]:font-semibold [&_h4]:text-foreground [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_a]:text-primary [&_a]:underline [&_hr]:border-border [&_table]:w-full [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-border [&_td]:p-2"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
